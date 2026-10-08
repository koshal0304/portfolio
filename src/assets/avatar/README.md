# Realistic avatar (optional)

Drop one rigged humanoid `.glb` of yourself in this folder and rebuild. The AI guide
picks it up automatically and drives it with the same script, gestures, pointing
and lip-sync as the built-in hologram. Delete the file to go back to the hologram.

Requirements:
- Humanoid skeleton with Mixamo / Ready Player Me style bone names
  (`Hips`, `Spine2`, `Neck`, `Head`, `RightArm`, `RightForeArm`, `RightHand`, …;
  a `mixamorig:` prefix is fine). The model should face +Z (the glTF default).
- Optional face morph targets for lip-sync and expressions:
  `jawOpen` / `mouthOpen` / `viseme_aa`, `eyeBlinkLeft` + `eyeBlinkRight`, `mouthSmile`.
- Keep it light for mobile: aim for < 5 MB (use Draco or meshopt compression,
  1024px textures).

Photo-to-avatar tools that export a rigged GLB with ARKit blendshapes, or a 3D-scan
app followed by Mixamo auto-rigging, both work.
