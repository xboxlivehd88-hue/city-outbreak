from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

old='''function bite(z){if(z.cool>0)return;z.cool=z.attack;z.attackAnim=.62;z.attackSide=Math.random()>.5?1:-1;rigTransient(z,"Attack",.48);let armPenalty=((!z.armL.parent?1:0)+(!z.armR.parent?1:0))*.2;health=Math.max(0,health-z.damage*(1-armPenalty));resetHealthRegenDelay();biteS();damage.classList.add("show");setTimeout(()=>damage.classList.remove("show"),140);ui();if(health<=0){showDeathScreen()}else show("-"+z.damage+" HEALTH")}'''

new='''function bite(z){if(z.cool>0)return;z.cool=z.attack;z.attackAnim=.62;z.attackSide=Math.random()>.5?1:-1;rigTransient(z,"Attack",.48);let armPenalty=((!z.armL.parent?1:0)+(!z.armR.parent?1:0))*.2,dealt=z.damage*(1-armPenalty);health=Math.max(0,health-dealt);resetHealthRegenDelay();biteS();damage.classList.add("show");setTimeout(()=>damage.classList.remove("show"),140);ui();if(health<=0){showDeathScreen()}else{const shownDamage=Math.round(dealt*10)/10;show("-"+shownDamage+" HEALTH")}}'''

count=text.count(old)
if count!=1:
    raise SystemExit(f"bite display patch: expected 1 match, found {count}")
text=text.replace(old,new,1)

path.write_text(text,encoding="utf-8")
print("v144 bite damage popup accuracy patch applied")
