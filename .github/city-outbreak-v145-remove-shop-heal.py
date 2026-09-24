from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

def replace_once(old,new,label):
    global text
    count=text.count(old)
    if count!=1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text=text.replace(old,new,1)

replace_once(
'''  <section class="shopSection"><h3>Upgrades</h3><div class="shopItems">
    <button data-buy="heal">Heal +40<br>$150</button>
    <button data-buy="mag">Magazine +4<br>$250</button>''',
'''  <section class="shopSection"><h3>Upgrades</h3><div class="shopItems">
    <button data-buy="mag">Magazine +4<br>$250</button>''',
"remove heal shop button"
)

replace_once(
''' if(type==="awmAmmo"){price=300;if(cash>=price){cash-=price;ammoState.awm.reserve+=10;show("+10 AWM ROUNDS");ok=true}}
 if(type==="heal"){price=150;if(cash>=price){cash-=price;health=Math.min(100,health+40);show("+40 HEALTH");ok=true}}
 if(type==="mag"){price=250;if(cash>=price){cash-=price;magSize+=4;show("MAGAZINE UPGRADED");ok=true}}''',
''' if(type==="awmAmmo"){price=300;if(cash>=price){cash-=price;ammoState.awm.reserve+=10;show("+10 AWM ROUNDS");ok=true}}
 if(type==="mag"){price=250;if(cash>=price){cash-=price;magSize+=4;show("MAGAZINE UPGRADED");ok=true}}''',
"remove heal purchase branch"
)

path.write_text(text,encoding="utf-8")
print("v145 removed redundant shop heal purchase")
