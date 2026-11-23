# Digital twin

`twin.glb` is Koshal's Avaturn avatar (full look + idle clip), slimmed for the web from
14.7 MB to 3.6 MB. The AI guide picks up whatever `.glb` is in this folder, stands it in
the hero, and flies it into the corner dock as the visitor scrolls. Delete the file to fall
back to the procedural hologram.

To swap in a new export (Avaturn, Ready Player Me, Mixamo-rigged scans):

```bash
python3 scripts/slim-avatar.py "model.glb" src/assets/avatar/twin.glb   # needs numpy + ffmpeg
```

It keeps the rig, the idle animation and every face shape, drops morph-target normals,
stores expression deltas sparsely, and re-encodes textures as WebP (1024px colour, 512px maps).

What the guide drives:
- Body: the GLB's first animation clip plays as idle; gestures (wave, point, present…)
  blend over it. Bones use Mixamo / Ready Player Me names (`Hips`, `Spine2`, `Neck`, `Head`,
  `RightArm`, `RightForeArm`, `RightHand`, …; a `mixamorig:` prefix is fine). Faces +Z.
- Face (ARKit + Oculus viseme blendshapes): `jawOpen`, `viseme_aa/E/I/O/U/SS/FF` from the live
  voice, `eyeBlink*`, `eyeLook*` for gaze, `mouthSmile*` + `cheekSquint*`, `browInnerUp`,
  `browOuterUp*`, `browDown*`. Missing shapes are simply skipped.
