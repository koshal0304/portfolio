"""Slim an Avaturn GLB for the web with only numpy + ffmpeg:
- morph targets: drop NORMAL deltas, store POSITION deltas as sparse accessors (|d| < 0.1 mm -> 0)
- textures: WebP (EXT_texture_webp), base colour <= 1024px, other maps <= 512px
- animation: drop facial-weight channels (the guide drives the face itself)
Usage: python3 scripts/slim-avatar.py "model.glb" src/assets/avatar/twin.glb   (needs numpy + ffmpeg)
"""
import json, struct, subprocess, sys
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
raw = open(src, 'rb').read()
off, g, binc = 12, None, None
while off < len(raw):
    ln, ty = struct.unpack_from('<II', raw, off)
    if ty == 0x4E4F534A:
        g = json.loads(raw[off + 8:off + 8 + ln])
    else:
        binc = raw[off + 8:off + 8 + ln]
    off += 8 + ln

DT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def read(ai):
    a = g['accessors'][ai]
    assert 'sparse' not in a
    bv = g['bufferViews'][a['bufferView']]
    dt, n = np.dtype(DT[a['componentType']]), NC[a['type']]
    start = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = bv.get('byteStride') or dt.itemsize * n
    rows = np.lib.stride_tricks.as_strided(
        np.frombuffer(binc, np.uint8, offset=start), shape=(a['count'], dt.itemsize * n), strides=(stride, 1))
    return np.ascontiguousarray(rows).view(dt).reshape(a['count'], n)


out = bytearray()
views, accessors = [], []


def blob(data, target=None):
    while len(out) % 4:
        out.append(0)
    view = {'buffer': 0, 'byteOffset': len(out), 'byteLength': len(data)}
    if target:
        view['target'] = target
    out.extend(data)
    views.append(view)
    return len(views) - 1


def dense(ai, target=None):
    a = dict(g['accessors'][ai])
    a.pop('byteOffset', None)
    a['bufferView'] = blob(read(ai).tobytes(), target)
    accessors.append(a)
    return len(accessors) - 1


def sparse_position(ai):
    a = dict(g['accessors'][ai])
    d = read(ai).astype(np.float32)
    d[np.abs(d).max(1) < 1e-4] = 0
    idx = np.nonzero(np.abs(d).max(1) > 0)[0].astype(np.uint32)
    a.pop('byteOffset', None)
    a.pop('bufferView', None)
    if len(idx):
        a['sparse'] = {
            'count': int(len(idx)),
            'indices': {'bufferView': blob(idx.tobytes()), 'componentType': 5125},
            'values': {'bufferView': blob(d[idx].tobytes())},
        }
        a['min'] = d.min(0).tolist()
        a['max'] = d.max(0).tolist()
    else:
        a['min'], a['max'] = [0, 0, 0], [0, 0, 0]
    accessors.append(a)
    return len(accessors) - 1


cache = {}


def keep(ai, target=None):
    if ai not in cache:
        cache[ai] = dense(ai, target)
    return cache[ai]


for m in g['meshes']:
    for p in m['primitives']:
        p['attributes'] = {k: keep(v, 34962) for k, v in p['attributes'].items()}
        if 'indices' in p:
            p['indices'] = keep(p['indices'], 34963)
        if p.get('targets'):
            p['targets'] = [{'POSITION': sparse_position(t['POSITION'])} for t in p['targets']]

for s in g.get('skins', []):
    if 'inverseBindMatrices' in s:
        s['inverseBindMatrices'] = keep(s['inverseBindMatrices'])

for an in g.get('animations', []):
    chans = [c for c in an['channels'] if c['target']['path'] != 'weights']
    used = sorted({c['sampler'] for c in chans})
    remap = {old: new for new, old in enumerate(used)}
    an['samplers'] = [dict(an['samplers'][i], input=keep(an['samplers'][i]['input']), output=keep(an['samplers'][i]['output'])) for i in used]
    for c in chans:
        c['sampler'] = remap[c['sampler']]
    an['channels'] = chans

# Which images are base colour (keep 1024) vs data maps (512).
base = set()
for mat in g['materials']:
    t = mat.get('pbrMetallicRoughness', {}).get('baseColorTexture')
    if t:
        base.add(g['textures'][t['index']]['source'])


def webp(data, size):
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=pix_fmt',
                            '-of', 'csv=p=0', '-i', 'pipe:0'], input=data, capture_output=True, check=True).stdout.decode().strip()
    alpha = any(k in probe for k in ('rgba', 'ya', 'argb', 'bgra', 'yuva', 'pal8'))
    cmd = ['ffmpeg', '-v', 'error', '-i', 'pipe:0', '-vf', f"scale='min({size},iw)':-2:flags=lanczos",
           '-c:v', 'libwebp', '-quality', '82', '-pix_fmt', 'yuva420p' if alpha else 'yuv420p', '-f', 'webp', 'pipe:1']
    return subprocess.run(cmd, input=data, capture_output=True, check=True).stdout


for i, im in enumerate(g['images']):
    bv = g['bufferViews'][im['bufferView']]
    data = binc[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']]
    im['bufferView'] = blob(webp(data, 1024 if i in base else 512))
    im['mimeType'] = 'image/webp'
for t in g['textures']:
    t['extensions'] = {**t.get('extensions', {}), 'EXT_texture_webp': {'source': t.pop('source')}}
for key in ('extensionsUsed', 'extensionsRequired'):
    g[key] = sorted(set(g.get(key, [])) | {'EXT_texture_webp'})

g['accessors'], g['bufferViews'] = accessors, views
while len(out) % 4:
    out.append(0)
g['buffers'] = [{'byteLength': len(out)}]
js = json.dumps(g, separators=(',', ':')).encode()
js += b' ' * (-len(js) % 4)
with open(dst, 'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(out)))
    f.write(struct.pack('<II', len(js), 0x4E4F534A) + js)
    f.write(struct.pack('<II', len(out), 0x004E4942) + bytes(out))
print(f'{src}: {len(raw) / 1e6:.2f} MB -> {dst}: {(28 + len(js) + len(out)) / 1e6:.2f} MB')
