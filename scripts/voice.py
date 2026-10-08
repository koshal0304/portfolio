"""Pre-render the AI guide's voice with Kokoro (open neural TTS, Apache-2.0): natural speech,
no runtime API, no keys. Reads [{id, text}] JSON (from scripts/voice-lines.ts) on stdin,
writes public/voice/<id>.mp3 and src/components/guide/voiceClips.ts.

One-time setup:
  python3.13 -m venv .venv-tts && .venv-tts/bin/pip install kokoro-onnx
  mkdir -p ~/.cache/kokoro && cd ~/.cache/kokoro && \
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx && \
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
  (ffmpeg must be on PATH)

Run:  npm run voice                 renders only new/changed sentences
      GUIDE_VOICE=am_fenrir FORCE=1 npm run voice   re-render everything in another voice
"""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "voice"
MANIFEST = ROOT / "src" / "components" / "guide" / "voiceClips.ts"
VOICE = os.environ.get("GUIDE_VOICE", "am_michael")  # warm, confident US male; also try am_fenrir, bm_george
SPEED = float(os.environ.get("GUIDE_SPEED", "1.0"))
MODEL_DIR = Path(os.environ.get("KOKORO_DIR", Path.home() / ".cache" / "kokoro"))

DIGITS = "zero one two three four five six seven eight nine".split()

# Say tech names the way engineers do (espeak would spell or mangle them). Captions are untouched.
SAY = {
    "NL-to-SQL": "N L to sequel", "SQLGlot": "sequel glot", "SQLAlchemy": "sequel alchemy",
    "PostgreSQL": "postgres", "MySQL": "my sequel", "SQL": "sequel", "RAG": "rag", "FAISS": "face",
    "YOLO": "yolo", "CLIP": "clip", "REST": "rest", "JSON": "jason", "DAGs": "dags", "OAuth2": "oh auth two",
    "OAuth": "oh auth", "PyTorch": "pie torch", "DistilBERT": "distil bert", "BERT": "bert", "MLflow": "M L flow",
    "ChromaDB": "chroma D B", "LlamaIndex": "llama index", "scikit-learn": "sai kit learn", "Boto3": "boto three",
    "ResNet18": "res net eighteen", "EC2": "E C two", "S3": "S three", "LangGraph": "lang graph",
    "LangChain": "lang chain", "FastAPI": "fast A P I", "B.Tech": "B tech", "Node.js": "node J S",
    "Ripik.ai": "Ripik A I", "LLMs": "L L Ms", "APIs": "A P Is", "PDFs": "P D Fs", "GitHub": "git hub",
    "DevOps": "dev ops", "WebSockets": "web sockets", "TensorFlow": "tensor flow", "OpenCV": "open C V",
    "koshalkumar0304@gmail.com": "Kohshul kumar zero three zero four at gmail dot com",
    "github.com/koshal0304": "github dot com slash Kohshul zero three zero four",
    "Koshal": "Kohshul",  # espeak says "KAH-shul"; this gives "KOH-shul"
}
SAY_RE = re.compile("|".join(re.escape(k) for k in sorted(SAY, key=len, reverse=True)))


def speakable(text: str) -> str:
    t = SAY_RE.sub(lambda m: SAY[m.group(0)], text)
    t = re.sub(r"(\d+)\.(\d+)", lambda m: f"{m.group(1)} point {' '.join(DIGITS[int(d)] for d in m.group(2))}", t)
    t = re.sub(r"(\d+)\s*[–-]\s*(\d+)", r"\1 to \2", t)  # year and number ranges
    t = re.sub(r"(\d+)K\b", r"\1 thousand", t)
    t = re.sub(r"(\d)\+", r"\1 plus", t)
    t = t.replace("%", " percent").replace("→", " to ").replace("—", ", ").replace("|", ", ").replace("&", " and ")
    t = re.sub(r"(?<=\w)/(?=\w)", " or ", t)
    return re.sub(r"\s+", " ", t).strip()


def espeak_config():
    from kokoro_onnx import EspeakConfig
    import espeakng_loader

    data = os.environ.get("ESPEAK_DATA") or espeakng_loader.get_data_path()
    if len(data) > 120:  # espeak-ng keeps its data path in a 160-byte buffer; long venv paths overflow it
        short = Path(tempfile.gettempdir()) / "espeak-ng-data"
        if not short.exists():
            shutil.copytree(data, short)
        data = str(short)
    return EspeakConfig(data_path=data)


def main():
    lines = json.load(sys.stdin)
    OUT.mkdir(parents=True, exist_ok=True)
    todo = [l for l in lines if os.environ.get("FORCE") or not (OUT / f"{l['id']}.mp3").exists()]
    if todo:
        from kokoro_onnx import Kokoro

        kokoro = Kokoro(str(MODEL_DIR / "kokoro-v1.0.onnx"), str(MODEL_DIR / "voices-v1.0.bin"), espeak_config=espeak_config())
        for n, line in enumerate(todo, 1):
            samples, rate = kokoro.create(speakable(line["text"]), voice=VOICE, speed=SPEED, lang="en-us")
            pcm = (np.clip(samples, -1, 1) * 32767).astype(np.int16)
            with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
                with wave.open(tmp.name, "wb") as w:
                    w.setnchannels(1)
                    w.setsampwidth(2)
                    w.setframerate(rate)
                    w.writeframes(pcm.tobytes())
                # Even loudness across clips, trimmed edges, small mono MP3 for every browser.
                subprocess.run(
                    ["ffmpeg", "-loglevel", "error", "-y", "-i", tmp.name,
                     "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=11",
                     "-ac", "1", "-ar", "24000", "-codec:a", "libmp3lame", "-b:a", "40k", str(OUT / f"{line['id']}.mp3")],
                    check=True,
                )
            print(f"[{n}/{len(todo)}] {line['id']}  {line['text'][:70]}", flush=True)

    keep = {l["id"] for l in lines}
    for stale in OUT.glob("*.mp3"):
        if stale.stem not in keep:
            stale.unlink()
    ids = sorted(keep)
    MANIFEST.write_text(
        "// Generated by `npm run voice` — ids of pre-rendered clips in public/voice/.\n"
        f"export const VOICE_CLIPS = new Set<string>({json.dumps(ids)});\n"
    )
    print(f"{len(ids)} clips ({len(todo)} rendered) → public/voice/, voice {VOICE}")


if __name__ == "__main__":
    main()
