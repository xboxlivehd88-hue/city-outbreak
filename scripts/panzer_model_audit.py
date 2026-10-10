#!/usr/bin/env python3
"""Inspect the ACTUAL uploaded Panzer GLB. Stdlib only; runs on GitHub checkout."""
import json
import struct
from collections import Counter, defaultdict
from pathlib import Path

path=Path("assets/panzer_zombie.glb")
raw=path.read_bytes()
magic,version,total=struct.unpack_from("<III",raw,0)
assert magic==0x46546C67 and version==2
pos=12;chunks={}
while pos+8<=len(raw):
    length,kind=struct.unpack_from("<II",raw,pos);pos+=8
    chunks[kind]=raw[pos:pos+length];pos+=length
gltf=json.loads(chunks[0x4E4F534A])
bin_data=chunks.get(0x004E4942,b"")
accessors=gltf.get("accessors",[])
views=gltf.get("bufferViews",[])
types={"SCALAR":1,"VEC2":2,"VEC3":3,"VEC4":4,"MAT4":16}
components={5120:("b",1),5121:("B",1),5122:("h",2),5123:("H",2),5125:("I",4),5126:("f",4)}
def read_accessor(i):
    if i is None or i>=len(accessors):return None
    a=accessors[i];count=a["count"];n=types[a["type"]]
    if "bufferView" not in a:return [(0,)*n]*count
    v=views[a["bufferView"]]
    c=components.get(a["componentType"])
    if c is None:return None
    fmt,size=c
    stride=v.get("byteStride",n*size)
    start=v.get("byteOffset",0)+a.get("byteOffset",0)
    if len(bin_data)<start+stride*(count-1)+n*size:return None
    st=struct.Struct("<"+fmt*n)
    return [st.unpack_from(bin_data,start+k*stride) for k in range(count)]
nodes=gltf.get("nodes",[])
skins=gltf.get("skins",[])
meshes=gltf.get("meshes",[])
animations=gltf.get("animations",[])
parents={}
for i,node in enumerate(nodes):
    for child in node.get("children",[]):parents[child]=i
def nodeinfo(i):
    n=nodes[i]
    return {"node":i,"name":n.get("name"),"parent":parents.get(i),"mesh":n.get("mesh"),"skin":n.get("skin"),"translation":n.get("translation"),"rotation":n.get("rotation"),"scale":n.get("scale")}
report={
 "file":str(path),"bytes":len(raw),"version":version,
 "extensionsUsed":gltf.get("extensionsUsed",[]),
 "nodeCount":len(nodes),"meshCount":len(meshes),"skinCount":len(skins),"animationCount":len(animations),
 "nodesWithLegNames":[nodeinfo(i) for i,n in enumerate(nodes) if any(w in n.get("name","").lower() for w in ("leg","knee","thigh","shin","calf","foot","ankle"))],
 "skins":[{"id":i,"name":s.get("name"),"jointCount":len(s.get("joints",[])),
           "joints":[nodeinfo(k) for k in s.get("joints",[])]} for i,s in enumerate(skins)],
 "meshes":[{"id":i,"name":m.get("name"),"primitives":[{"material":p.get("material"),"mode":p.get("mode"),"vertexCount":accessors[p["attributes"]["POSITION"]]["count"] if "POSITION" in p.get("attributes",{}) else None,
     "attributes":p.get("attributes"),"extensions":list(p.get("extensions",{}))} for p in m.get("primitives",[])]} for i,m in enumerate(meshes)],
 "skinnedNodes":[nodeinfo(i) for i,n in enumerate(nodes) if "skin" in n],
 "animations":[{"name":a.get("name"),"channels":len(a.get("channels",[])),
                "targetNodes":[{"node":c.get("target",{}).get("node"),"name":nodes[c["target"]["node"]].get("name"),"path":c.get("target",{}).get("path")} for c in a.get("channels",[]) if c.get("target",{}).get("node") is not None][:120]} for a in animations],
 "jointMeshWeights":[]
}
for node_idx,node in enumerate(nodes):
    if "mesh" not in node:continue
    mesh=meshes[node["mesh"]];skin=skins[node["skin"]] if "skin" in node and node["skin"]<len(skins) else None
    for pi,prim in enumerate(mesh.get("primitives",[])):
        attr=prim.get("attributes",{})
        p=read_accessor(attr.get("POSITION"));j=read_accessor(attr.get("JOINTS_0"));w=read_accessor(attr.get("WEIGHTS_0"))
        if not p:continue
        bounds={a:(min(v[k] for v in p),max(v[k] for v in p)) for k,a in enumerate("xyz")}
        count=Counter(); zone=defaultdict(Counter)
        if skin and j and w:
            for vi in range(min(len(p),len(j),len(w))):
                for id_,we in zip(j[vi],w[vi]):
                    if we<=.10:continue
                    jid=int(id_)
                    if jid>=len(skin.get("joints",[])):continue
                    bone=skin["joints"][jid]
                    name=nodes[bone].get("name",f"node{bone}")
                    count[name]+=1
                    side="left" if p[vi][0] < (bounds["x"][0]+bounds["x"][1])/2 else "right"
                    zone[side][name]+=1
        report["jointMeshWeights"].append({
          "node":node_idx,"mesh":mesh.get("name"),"primitive":pi,
          "vertices":len(p),"bounds":bounds,
          "skin":node.get("skin"),"jointCounts":count.most_common(75),
          "negativeX":zone["left"].most_common(30),
          "positiveX":zone["right"].most_common(30)})
outfile=Path("PANZER_MODEL_AUDIT.json")
outfile.write_text(json.dumps(report,indent=2))
print(f"Panzer source asset: {len(raw)} bytes, {len(nodes)} nodes, {len(skins)} skins, {len(animations)} clips.")
print("Leg nodes:",[(n["name"],n["node"]) for n in report["nodesWithLegNames"]])
for m in report["jointMeshWeights"]:
 print("mesh:",m["mesh"],"skin:",m["skin"],"bounds:",m["bounds"],"joint counts:",m["jointCounts"][:15])
print("WROTE",outfile)
