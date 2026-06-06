"""
Rescrie ambele produse WooCommerce cu copy orientat pe vânzare,
bazat pe research de competitori și psihologia cumpărătorului B2B auto.
"""
import csv

# ══════════════════════════════════════════════════════════════════════════════
# PRODUS 1 — Immo OFF / Transfer IMMO TCU VAG
# ══════════════════════════════════════════════════════════════════════════════

IMMO_SRC = "/root/.claude/uploads/daa923e5-0c74-5142-b737-41871de5037b/b9db874f-wcproductexport6620261780745564814.csv"
IMMO_DST = "/home/user/Marketing/products-v2-immo-tcu.csv"

IMMO_NAME = "Immo OFF / Transfer IMMO — TCU DSG VAG | DQ200, DL501, DL382, DQ250, DQ400 | VisionGarage"

IMMO_SHORT = (
    "<p><strong>Ai un TCU second-hand care nu porneste din cauza IMMO? Mașina stă blocată pe lift?</strong></p>"
    "<p>Procesăm fișierele FLASH + EEPROM și îți trimitem TCU-ul gata de pornire în "
    "<strong>30–60 de minute</strong>. Immo OFF sau Transfer IMMO — tu alegi operațiunea, "
    "noi livrăm rezultatul.</p>"
    "<p>Compatibil: DQ200 (Gen1/Gen2/MQB) · DQ200G2 · DQ250 · DQ400 · DL501 Gen1/Gen2 · VL381 · VL300 · DL382. "
    "Serviciu dedicat exclusiv atelierelor auto profesionale.</p>"
)

IMMO_DESC = "\n".join([
    "<h2>Serviciu IMMO OFF / Transfer IMMO — Cutii Automate DSG VAG</h2>",
    "",
    "<p><strong>Scenariul cu care ajungi la noi:</strong> Ai montat un TCU second-hand pe o cutie DQ200, "
    "DL501 sau DL382. Mașina nu pornește. Clientul sună pentru a treia oară azi. "
    "Dealer-ul cere 3–5 zile și un preț de două ori mai mare. "
    "Tu ai nevoie de o soluție azi — nu mâine.</p>",
    "",
    "<p>Exact asta facem noi. Primim fișierele dimineața, le returnăm procesate în 30–60 de minute, "
    "clientul pleacă cu mașina în aceeași zi.</p>",
    "",
    "<hr />",
    "",
    "<h3>Ce este IMMO OFF și IMMO Transfer?</h3>",
    "",
    "<p>Fiecare TCU VAG conține date de imobilizator criptate (VIN, CS, MAC, Power Class) "
    "legate electronic de vehiculul original. Când montezi un TCU second-hand, datele nu "
    "corespund cu celelalte module ale mașinii și vehiculul nu pornește — chiar dacă TCU-ul "
    "este perfect funcțional din punct de vedere hardware.</p>",
    "",
    "<ul>",
    "<li><strong>IMMO Transfer (Clonare)</strong> — copiem datele IMMO de pe TCU-ul original "
    "(sau donor) pe cel nou/second-hand. Soluția ideală când TCU-ul original poate fi citit. "
    "Rezultat: unitate plug &amp; play, fără recodare suplimentară.</li>",
    "<li><strong>IMMO OFF</strong> — dezactivăm complet verificarea imobilizatorului direct în "
    "fișierul TCU. Singura soluție când TCU-ul original nu mai există, este distrus sau "
    "nu poate fi citit cu niciun echipament.</li>",
    "</ul>",
    "",
    "<hr />",
    "",
    "<h3>Cutii automate suportate</h3>",
    "",
    "<ul>",
    "<li>DQ200 — Gen1, Gen2, MQB (7 trepte, uscat)</li>",
    "<li>DQ200G2 — generația a doua DSG 7</li>",
    "<li>DQ250 — 6 trepte, ud (MQB și pre-MQB)</li>",
    "<li>DQ400 — 7 trepte hibrid PHEV</li>",
    "<li>DL501 — Gen 1 și Gen 2 (S-Tronic Audi)</li>",
    "<li>VL381 / VL300 — cutii VAG longitudinale</li>",
    "<li>DL382 — 7 trepte longitudinal MQB</li>",
    "</ul>",
    "",
    "<p><strong>Mărci:</strong> Volkswagen · Audi · Skoda · Seat · Cupra</p>",
    "",
    "<p>Nu ești sigur dacă modelul tău este pe listă? "
    "Scrie-ne pe WhatsApp înainte de comandă — confirmăm în câteva minute.</p>",
    "",
    "<hr />",
    "",
    "<h3>Cum funcționează — 4 pași simpli</h3>",
    "",
    "<ol>",
    "<li><strong>Citești fișierele</strong> — FLASH + EEPROM de pe TCU-ul de destinație "
    "(cel care va fi montat în mașină). Pentru IMMO Transfer ai nevoie și de fișierele "
    "TCU-ului donor/original.</li>",
    "<li><strong>Trimiți fișierele</strong> — pe email sau WhatsApp, împreună cu numărul "
    "comenzii și VIN-ul vehiculului.</li>",
    "<li><strong>Procesăm</strong> — analizăm fișierele și efectuăm modificările IMMO. "
    "Timp de procesare: <strong>30–60 de minute</strong> în orele de program.</li>",
    "<li><strong>Primești fișierul modificat</strong> — scrii în TCU și mașina pornește.</li>",
    "</ol>",
    "",
    "<h3>Ce echipament îți trebuie</h3>",
    "<ul>",
    "<li>Echipament de citire/scriere FLASH + EEPROM pentru TCU VAG "
    "(Trasdata, Alientech KTAG, BitBox, PCMflash, CMD, Flex sau echivalent)</li>",
    "<li>Fișiere complete: FLASH (firmware) + EEPROM (date calibrare + IMMO)</li>",
    "<li>Pentru IMMO Transfer: fișierele de pe <strong>ambele</strong> TCU-uri (donor + destinație)</li>",
    "<li>VIN-ul vehiculului și descrierea situației</li>",
    "</ul>",
    "",
    "<hr />",
    "",
    "<h3>Garanție și politică de returnare</h3>",
    "<p>Dacă fișierul procesat nu funcționează din cauza unei erori de procesare din partea noastră, "
    "<strong>reluăm gratuit sau returnăm integral suma plătită</strong>. "
    "Nu procesăm fișiere corupte, incomplete sau provenite din TCU-uri cu defecte hardware — "
    "în acest caz nu putem garanta rezultatul.</p>",
    "",
    "<h3>Program de lucru și livrare</h3>",
    "<p><strong>Luni–Vineri:</strong> 08:00–18:00 | <strong>Sâmbătă:</strong> 09:00–14:00<br />",
    "Fișierele trimise în intervalul de lucru sunt procesate în 30–60 de minute. "
    "Comenzile primite în afara programului sunt procesate la prima oră a zilei următoare.</p>",
    "",
    "<hr />",
    "",
    "<h3>Declarație legală</h3>",
    "<p>VisionGarage este un service auto independent. Serviciile de IMMO OFF și IMMO Transfer "
    "sunt oferite exclusiv atelierelor auto profesionale, strict în scopul restaurării funcționale "
    "a cutiilor automate cu TCU defect sau înlocuit. Serviciul NU este destinat ocolirii "
    "sistemelor antifurt pe vehicule care nu aparțin clientului. "
    "Orice utilizare în afara scopului declarat de reparație intră în răspunderea exclusivă a clientului.</p>",
    "",
    "<p>Vezi și: <a href=\"https://visiongarage.ro/produs/immo-off-ecu-vag/\">"
    "Immo OFF ECU VAG — Dezactivare imobilizator VW, Audi, Skoda, Seat</a></p>",
])

IMMO_NOTE = (
    "Multumim pentru comanda! Urmatorul pas: trimite fisierele FLASH + EEPROM pe WhatsApp "
    "sau la office@visiongarage.ro, impreuna cu VIN-ul vehiculului si descrierea situatiei. "
    "Pentru IMMO Transfer ai nevoie de fisierele de pe AMBELE TCU-uri (donor + destinatie). "
    "Procesam in 30-60 de minute din momentul in care primim fisierele complete."
)

IMMO_SEO_KW    = "immo off TCU VAG DQ200"
IMMO_SEO_TITLE = "IMMO OFF / Transfer IMMO TCU DSG VAG — DQ200, DL501, DL382 | VisionGarage"
IMMO_SEO_META  = (
    "Procesam IMMO OFF si Transfer IMMO pentru TCU cutii DSG VAG: DQ200, DL501, DL382, DQ250, DQ400, VL381. "
    "Livrare fisier in 30-60 min. Garantie sau returnare bani. Serviciu pentru ateliere auto profesionale."
)

with open(IMMO_SRC, newline='', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    rows = list(reader)

r = rows[0]
r['Nume']               = IMMO_NAME
r['Descriere scurtă']   = IMMO_SHORT
r['Descriere']          = IMMO_DESC
r['Notă de cumpărare']  = IMMO_NOTE
r['Meta: _yoast_wpseo_focuskw']    = IMMO_SEO_KW
r['Meta: _yoast_wpseo_title']      = IMMO_SEO_TITLE
r['Meta: _yoast_wpseo_metadesc']   = IMMO_SEO_META
r['Meta: rank_math_title']         = IMMO_SEO_TITLE
r['Meta: rank_math_description']   = IMMO_SEO_META
r['Meta: rank_math_focus_keyword'] = IMMO_SEO_KW

with open(IMMO_DST, 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerow(r)

print("IMMO produs scris:", IMMO_DST)


# ══════════════════════════════════════════════════════════════════════════════
# PRODUS 2 — VAG SVM Coding & Component Protection
# ══════════════════════════════════════════════════════════════════════════════

SVM_SRC = "/root/.claude/uploads/daa923e5-0c74-5142-b737-41871de5037b/11a0e5a8-wcproductexport6620261780763953129.csv"
SVM_DST = "/home/user/Marketing/products-v2-svm-cp.csv"

SVM_NAME = "Component Protection OFF + SVM Coding VAG — Serviciu Online Remote | VW Audi Skoda Seat"

SVM_SHORT = (
    "<p><strong>Ai montat un modul second-hand și apare eroarea Component Protection? "
    "Ai nevoie de SVM Coding după un retrofit?</strong></p>"
    "<p>Efectuăm sesiuni ODIS online cu acces GeKo direct pe mașina din atelierul tău — "
    "remote, fără transport, fără dealer. <strong>Rezultat în aceeași zi.</strong></p>"
    "<p>Compatibil: VW · Audi · Skoda · Seat · Cupra. "
    "Serviciu dedicat exclusiv atelierelor auto profesionale cu echipament ODIS / VAS6154.</p>"
)

SVM_DESC = "\n".join([
    "<h2>Component Protection OFF + SVM Coding VAG — Sesiune Remote cu Acces GeKo</h2>",
    "",
    "<p><strong>Scenariul clasic:</strong> Ai montat un modul second-hand (head unit, airbag, "
    "cluster, senzor) pe o masina VAG. Pe bord apare eroarea <em>Component Protection active</em>. "
    "Modulul nu funcționează. Clientul nu poate pleca cu mașina. "
    "Dealer-ul spune că nu poate ajuta cu piese care nu vin de la ei. "
    "Ești blocat — fără acces la serverele GeKo ale VAG Group, această eroare nu poate fi eliminată.</p>",
    "",
    "<p><strong>Noi avem accesul GeKo. Și ți-l punem la dispoziție azi.</strong></p>",
    "",
    "<hr />",
    "",
    "<h3>Ce este Component Protection (CP)?</h3>",
    "",
    "<p>Component Protection este sistemul de securitate VAG Group care leagă electronic fiecare "
    "modul de VIN-ul vehiculului pe care a fost înregistrat inițial. "
    "Un modul second-hand montat pe altă mașină va funcționa limitat sau deloc până când "
    "CP este eliminat prin serverele oficiale VAG (GeKo).</p>",
    "",
    "<p><strong>Component Protection nu poate fi eliminat offline.</strong> "
    "ODIS fără conexiune activă la serverele GeKo nu poate efectua această operațiune — indiferent "
    "de versiunea software sau de echipamentul pe care îl ai.</p>",
    "",
    "<h3>Ce este SVM Coding?</h3>",
    "",
    "<p>SVM (Software Version Management) este sistemul VAG prin care se actualizează și validează "
    "configurația software a modulelor dintr-un vehicul. Este obligatoriu după:</p>",
    "<ul>",
    "<li>Montarea unui modul nou sau second-hand</li>",
    "<li>Retrofit echipamente: ACC, trailer hitch, camere, faruri adaptive, sisteme audio</li>",
    "<li>Actualizări de software ECU / TCU</li>",
    "<li>Orice intervenție care modifică configurația de fabrică a mașinii</li>",
    "</ul>",
    "<p>Fără SVM Coding corect, erorile reziduale rămân în memorie și clientul se întoarce cu reclamație.</p>",
    "",
    "<hr />",
    "",
    "<h3>Module suportate (lista principală)</h3>",
    "<ul>",
    "<li>Head unit / Infotainment (5F, MIB, MIB2, MIB3, modulele 3Q)</li>",
    "<li>Instrument cluster / Bord digital</li>",
    "<li>Airbag module (7N0, 7P6 și altele)</li>",
    "<li>BCM / Modulul de confort</li>",
    "<li>Gateway (J533)</li>",
    "<li>ECU motor</li>",
    "<li>TCU cutie automată DSG</li>",
    "<li>Camere, senzori parcare, module ACC</li>",
    "<li>Faruri adaptive / Matrix</li>",
    "</ul>",
    "<p>Nu ești sigur dacă modulul tău este suportat? Contactează-ne înainte de comandă — "
    "confirmăm în câteva minute pe WhatsApp.</p>",
    "",
    "<p><strong>Mărci:</strong> Volkswagen · Audi · Skoda · Seat · Cupra · Porsche (selectiv)</p>",
    "",
    "<hr />",
    "",
    "<h3>Cum funcționează sesiunea remote</h3>",
    "<ol>",
    "<li><strong>Plasezi comanda</strong> și ne trimiți VIN-ul mașinii + modulul care "
    "necesită intervenție (CP OFF, SVM sau ambele).</li>",
    "<li><strong>Confirmăm</strong> — verificăm în prealabil dacă modulul nu este "
    "blocat/raportat furat. Îți comunicăm dacă există vreo problemă înainte de a începe.</li>",
    "<li><strong>Programăm sesiunea</strong> — de regulă în aceeași zi sau ziua următoare, "
    "la o oră convenabilă pentru tine.</li>",
    "<li><strong>Sesiunea live</strong> — te conectezi cu echipamentul tău diagnostic "
    "(VAS6154A, VXDIAG, Smartlink C sau compatibil J2534), noi preluăm sesiunea ODIS "
    "online și efectuăm CP OFF / SVM Coding direct pe modulul din mașina ta.</li>",
    "<li><strong>Confirmare finală</strong> — înainte de a încheia sesiunea, verificăm "
    "că erorile au dispărut și modulul funcționează corect.</li>",
    "</ol>",
    "",
    "<h3>Ce echipament îți trebuie</h3>",
    "<ul>",
    "<li>Interfață diagnostică VAG compatibilă: VAS6154A, VXDIAG VCX SE 6154, Smartlink C "
    "sau echivalent J2534</li>",
    "<li>Laptop cu ODIS Service instalat și conexiune internet stabilă</li>",
    "<li>Conexiune LAN sau Wi-Fi stabilă la mașină în timpul sesiunii</li>",
    "<li>VIN-ul vehiculului și denumirea exactă a modulului</li>",
    "</ul>",
    "",
    "<hr />",
    "",
    "<h3>Garanție și transparență</h3>",
    "<ul>",
    "<li>Dacă CP nu poate fi eliminat deoarece modulul este pe lista neagră VAG "
    "(piesă furată, vehicul casat Cat A/B), <strong>returnăm integral suma plătită</strong>. "
    "Verificăm acest lucru înainte de a începe.</li>",
    "<li>Dacă apare o problemă tehnică din partea noastră în timpul sesiunii, "
    "reluăm fără costuri suplimentare.</li>",
    "<li>Emitem raport de intervenție după fiecare sesiune.</li>",
    "</ul>",
    "",
    "<h3>Program de lucru</h3>",
    "<p><strong>Luni–Vineri:</strong> 08:00–18:00 | <strong>Sâmbătă:</strong> 09:00–14:00<br />",
    "Sesiunile se programează cu minimum 2 ore înainte. "
    "Urgențele se tratează pe WhatsApp — facem tot posibilul să intervenim în aceeași zi.</p>",
    "",
    "<hr />",
    "",
    "<h3>Condiții obligatorii</h3>",
    "<ul>",
    "<li>Serviciu disponibil <strong>exclusiv pentru service-uri auto autorizate</strong> "
    "(nu persoane fizice fără pregătire tehnică).</li>",
    "<li>Documente necesare: factură achiziție piesă, copie talon vehicul, "
    "copie buletin proprietar, declarație de responsabilitate semnată de service.</li>",
    "<li>Piesele provenite din vehicule cu statut de furt sau accidentate grav (Cat A/B) "
    "pot fi blocate în baza de date VAG și nu pot fi deblocate — "
    "verificăm înainte să începem.</li>",
    "</ul>",
    "",
    "<p>Vezi și: <a href=\"https://visiongarage.ro/produs/vag-bcm2-decrypt-clone-elv-repair-fileservice-visiongarage/\">"
    "VAG BCM / BCM2 — Decrypt, Clone, CP Removal, ELV Repair | VisionGarage</a></p>",
])

SVM_NOTE = (
    "Multumim pentru comanda! Dupa plasarea comenzii, trimite pe WhatsApp: "
    "VIN-ul vehiculului, modulul care necesita interventie (CP OFF / SVM / ambele), "
    "factura de achizitie a piesei, copie talon vehicul si copie buletin proprietar. "
    "Te contactam in maximum 2-4h pentru programarea sesiunii online. "
    "Sesiunea dureaza de regula 30-90 de minute, in functie de complexitate."
)

SVM_SEO_KW    = "component protection removal VAG online"
SVM_SEO_TITLE = "Component Protection OFF + SVM Coding VAG Remote | VW Audi Skoda Seat | VisionGarage"
SVM_SEO_META  = (
    "Eliminam Component Protection si efectuam SVM Coding pentru VW, Audi, Skoda, Seat — "
    "sesiune ODIS online cu acces GeKo, remote, fara transport. "
    "Verificare modul inainte de plata. Garantie sau returnare bani. Ateliere profesionale."
)

with open(SVM_SRC, newline='', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    rows = list(reader)

# Varianta descriptions
VAR_CP_IMMO = (
    "Componenta IMMO este legata de serverele VAG — generăm un raport care este trimis "
    "reprezentanței, iar răspunsul este primit în 48–72h lucrătoare. "
    "Sunt necesare fișierele complete, VIN-ul vehiculului și documentele de proprietate."
)
VAR_SVM = (
    "Codare SVM (Software Version Management) pentru vehicule VAG — sesiune ODIS online "
    "cu acces GeKo. Include validarea configurației modulului, ștergerea erorilor reziduale "
    "și raport de intervenție. Durata sesiunii: 30–60 de minute."
)
VAR_CP = (
    "Eliminare Component Protection pentru module VAG montate dintr-un alt VIN — "
    "sesiune ODIS online cu acces GeKo. Verificăm în prealabil dacă modulul nu este "
    "pe lista neagră VAG. Include testare funcții și raport de intervenție. "
    "Durata sesiunii: 30–60 de minute."
)

for r in rows:
    rid = r['﻿ID'] if '﻿ID' in r else r.get('ID', '')
    if rid == '3009':  # parent
        r['Nume']               = SVM_NAME
        r['Descriere scurtă']   = SVM_SHORT
        r['Descriere']          = SVM_DESC
        r['Notă de cumpărare']  = SVM_NOTE
        r['Meta: _yoast_wpseo_focuskw']    = SVM_SEO_KW
        r['Meta: _yoast_wpseo_title']      = SVM_SEO_TITLE
        r['Meta: _yoast_wpseo_metadesc']   = SVM_SEO_META
        r['Meta: rank_math_title']         = SVM_SEO_TITLE
        r['Meta: rank_math_description']   = SVM_SEO_META
        r['Meta: rank_math_focus_keyword'] = SVM_SEO_KW
        r['Nume'] = SVM_NAME
    elif rid == '3492':  # CP Immo variation
        r['Descriere'] = VAR_CP_IMMO
        r['Nume'] = SVM_NAME + "<span> - </span>Component Protection Immo"
    elif rid == '3010':  # SVM Coding variation
        r['Descriere'] = VAR_SVM
        r['Nume'] = SVM_NAME + "<span> - </span>SVM Coding"
    elif rid == '3011':  # CP variation
        r['Descriere'] = VAR_CP
        r['Nume'] = SVM_NAME + "<span> - </span>Component Protection"

with open(SVM_DST, 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for r in rows:
        writer.writerow(r)

print("SVM produs scris:", SVM_DST)
print("Done.")
