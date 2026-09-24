from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

old='const PLAYER_HEALTH_REGEN_DELAY=10,PLAYER_HEALTH_REGEN_RATE=5;'
new='const PLAYER_HEALTH_REGEN_DELAY=5,PLAYER_HEALTH_REGEN_RATE=10;'
count=text.count(old)
if count!=1:
    raise SystemExit(f"regen constants: expected 1 match, found {count}")
text=text.replace(old,new,1)

path.write_text(text,encoding="utf-8")
print("v141 regen timing patch applied")
