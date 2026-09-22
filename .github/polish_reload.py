from pathlib import Path
p=Path('index.html')
s=p.read_text()
old=' const magazine=(y,z,w=.22,h=.48,d=.32,ang=.08)=>{let q=part(w,h,d,metal,y,z);q.rotation.x=ang;q.userData.reloadHome=q.position.clone();playerReloadPart=q;box(w*.72,.035,d*1.03,dark,x,y+h*.22,z,gun);return q};'
new=' const magazine=(y,z,w=.22,h=.48,d=.32,ang=.08)=>{let q=part(w,h,d,metal,y,z);q.rotation.x=ang;q.userData.reloadHome=q.position.clone();playerReloadPart=q;box(w*.72,.035,d*1.03,dark,0,h*.22,0,q);return q};'
if old not in s: raise SystemExit('magazine helper not found')
s=s.replace(old,new,1)
old=' if(reloading||!a||a.mag===cap||a.reserve<=0||dying)return false;\n const duration=Math.max(420,950-reloadLevel*120);'
new=' if(reloading||!a||a.mag===cap||a.reserve<=0||dying)return false;\n setAim(false);\n const duration=Math.max(420,950-reloadLevel*120);'
if old not in s: raise SystemExit('reload start not found')
s=s.replace(old,new,1)
if s.count('{')!=s.count('}') or s.count('(')!=s.count(')'): raise SystemExit('delimiter mismatch')
p.write_text(s)
print('reload polish applied')
