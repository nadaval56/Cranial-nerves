"""Slim brain model for the 3D cranial-nerve map: public/models/brain-cn.glb

Source: assets/brain.glb from nadaval56/brain, itself derived from
Anderson M. Winkler, "Brain for Blender" (brainder.org), CC BY-SA 3.0.
This file is a further derivative (parts removed, normals dropped) and is shared
under the same license, CC BY-SA 3.0.

Keeps only what is visible around the cranial nerves: brainstem, cerebellum, and the outer
cortex lobes (shown as a translucent shell). Normals are dropped — three.js computes them.

Run:  python3 scripts/make-model.py ../brain/assets/brain.glb public/models/brain-cn.glb
"""
import json, struct, sys
import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
KEEP = ['brainstem', 'cerebellum_L', 'cerebellum_R'] + [f'{l}_{s}' for s in 'LR' for l in
        ('frontal', 'motor', 'sensory', 'parietal', 'temporal', 'occipital')]

b = open(SRC, 'rb').read()
jl = struct.unpack('<I', b[12:16])[0]
j = json.loads(b[20:20 + jl])
binc = b[20 + jl + 8:]

def acc(i, n):
    a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]
    dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16}[a['componentType']]
    return np.frombuffer(binc, dtype=dt, count=a['count'] * n, offset=bv.get('byteOffset', 0) + a.get('byteOffset', 0))

parts = []
for node in j['nodes']:
    if node.get('name') not in KEEP or 'mesh' not in node: continue
    p = j['meshes'][node['mesh']]['primitives'][0]
    pos = acc(p['attributes']['POSITION'], 3).reshape(-1, 3) + np.array(node.get('translation', [0, 0, 0]), np.float32)
    idx = acc(p['indices'], 1).astype(np.uint32)
    parts.append((node['name'], pos.astype(np.float32), idx))
assert len(parts) == len(KEEP), [p[0] for p in parts]

buf, views, accs, meshes, nodes = bytearray(), [], [], [], []
def add(arr, target, comp, typ, count, mn=None, mx=None):
    while len(buf) % 4: buf.append(0)
    views.append({'buffer': 0, 'byteOffset': len(buf), 'byteLength': arr.nbytes, 'target': target})
    buf.extend(arr.tobytes())
    a = {'bufferView': len(views) - 1, 'componentType': comp, 'count': count, 'type': typ}
    if mn is not None: a['min'], a['max'] = mn, mx
    accs.append(a); return len(accs) - 1

for name, pos, idx in parts:
    small = idx.max() < 65536
    ia = add(idx.astype(np.uint16 if small else np.uint32), 34963, 5123 if small else 5125, 'SCALAR', len(idx))
    pa = add(pos, 34962, 5126, 'VEC3', len(pos), pos.min(0).tolist(), pos.max(0).tolist())
    meshes.append({'name': name, 'primitives': [{'attributes': {'POSITION': pa}, 'indices': ia}]})
    nodes.append({'name': name, 'mesh': len(meshes) - 1})

while len(buf) % 4: buf.append(0)
gj = {'asset': {'version': '2.0', 'copyright': 'Derived from Brain for Blender, Anderson M. Winkler (brainder.org), CC BY-SA 3.0'},
      'scene': 0, 'scenes': [{'nodes': list(range(len(nodes)))}], 'nodes': nodes, 'meshes': meshes,
      'accessors': accs, 'bufferViews': views, 'buffers': [{'byteLength': len(buf)}]}
js = json.dumps(gj, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(buf)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(buf), 0x004E4942) + bytes(buf)
open(OUT, 'wb').write(out)
print('parts', len(parts), 'bytes', len(out))
