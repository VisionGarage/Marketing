import csv, re

src = "/root/.claude/uploads/daa923e5-0c74-5142-b737-41871de5037b/11a0e5a8-wcproductexport6620261780763953129.csv"
dst = "/home/user/Marketing/products-improved-svm.csv"

with open(src, newline='', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    rows = list(reader)

# ═══════════════════════════════════════════════════════════════
# ROW 0 - PARENT (ID 3009, variable)
# ═══════════════════════════════════════════════════════════════
r = rows[0]

r['Descriere scurta'] if 'Descriere scurta' in r else None

short_desc = (
    "<p>Serviciu profesional online de codare <strong>SVM (Software Version Management)</strong> si "
    "<strong>Component Protection (CP)</strong> pentru vehicule VAG: VW, Audi, SEAT, Skoda.</p>\n"
    "<p>Acceptam doar <strong>service-uri autorizate</strong>, cu acte complete: factura piesa, "
    "copie talon, copie buletin proprietar si declaratie de responsabilitate semnata de unitate.</p>\n"
    "<p><strong>Echipament obligatoriu:</strong> Laptop Windows 10 + interfata VCDS / VNCI 6154 / Smartlink C + conexiune LAN stabila.</p>"
)

description = "\n".join([
    "<h2>VAG SVM Coding &amp; Component Protection - Serviciu Online Autorizat</h2>",
    "",
    "<h3>Ce este SVM si Component Protection?</h3>",
    "<p><strong>SVM (Software Version Management)</strong> este sistemul intern al grupului VAG care verifica daca "
    "calculatoarele montate in vehicul au software si hardware conforme inainte de livrare.</p>",
    "<p><strong>Component Protection (CP)</strong> este o masura anti-furt care leaga componentele critice "
    "(unitati de control, panouri, infotainment) de VIN-ul vehiculului. Daca se monteaza o unitate din alt VIN, "
    "apar erori de securitate sau componenta nu este activabila.</p>",
    "",
    "<h3>Simptome frecvente</h3>",
    "<ul>",
    "<li>Coduri de eroare: <em>Component Protection active</em>, <em>SVM code required</em>, <em>Hardware change suggestion</em>.</li>",
    "<li>Unitati instalate dintr-un alt VIN nu sunt recunoscute.</li>",
    "<li>Functii dezactivate dupa inlocuirea modulelor (radio, panou instrumente, unitati comfort).</li>",
    "<li>Servicii de codare care esueaza sau modulul refuza activarea din cauza mismatch-ului SVM.</li>",
    "</ul>",
    "",
    "<h3>Ce include serviciul nostru</h3>",
    "<ul>",
    "<li>Codare SVM &amp; deblocare Component Protection (dupa dovada de proprietate si verificarea service-ului autorizat).</li>",
    "<li>Suport online pentru service-ul clientului, cu interfata VNCI 6154 / Smartlink C.</li>",
    "<li>Documentare completa, raport de interventie si garantie limitata pentru lucrare.</li>",
    "</ul>",
    "",
    "<h3>Conditii obligatorii</h3>",
    "<ul>",
    "<li>Acceptam doar <strong>service-uri autorizate</strong> (nu persoane fizice nespecializate).</li>",
    "<li>Documente necesare: factura achizitie piesa, copie talon vehicul, copie buletin proprietar, "
    "declaratie semnata de unitatea care efectueaza lucrarea.</li>",
    "<li>Laptop cu <strong>Windows 10</strong>, interfata <strong>VNCI 6154</strong> sau <strong>Smartlink C</strong> "
    "(lucram la adaugarea altor interfete).</li>",
    "<li>Acces Internet stabil, cablu LAN, alimentare stabila.</li>",
    "</ul>",
    "",
    "<h3>Procedura rapida</h3>",
    "<ol>",
    "<li>Plasezi comanda online si trimiti actele + VIN-ul vehiculului.</li>",
    "<li>Programam impreuna ora interventiei online.</li>",
    '<li>Conectezi service-ul via <a href="https://www.anyviewer.com/individual.html" target="_blank" rel="noopener">AnyViewer</a>.</li>',
    "<li>Executam codarea SVM / CP si testam functiile.</li>",
    "<li>Primesti raport final + documentatie de suport.</li>",
    "</ol>",
    "",
    "<hr />",
    "",
    '<p>Vezi si: <a href="https://visiongarage.ro/produs/vag-bcm2-decrypt-clone-elv-repair-fileservice-visiongarage/">'
    "VAG BCM / BCM2 - Decrypt, Clone, CP Removal, ELV Repair | VisionGarage</a></p>",
])

purchase_note = (
    "Multumim pentru comanda! Trimite pe WhatsApp sau email: "
    "factura de achizitie a piesei, copie talon vehicul, copie buletin proprietar si "
    "declaratie de responsabilitate semnata de service. VIN-ul vehiculului este obligatoriu. "
    "Te contactam in maximum 24h pentru programarea sesiunii online."
)

seo_title = "VAG SVM Coding & Component Protection - Serviciu Online Autorizat | VisionGarage"
seo_meta = (
    "Serviciu online de codare SVM si deblocare Component Protection pentru VW, Audi, SEAT, Skoda. "
    "Acceptam service-uri autorizate cu acte complete. Interfata VNCI 6154 / Smartlink C. "
    "Programare rapida, raport de interventie inclus."
)
seo_kw = "VAG SVM Coding Component Protection"

r['Descriere scurtă'] = short_desc
r['Notă de cumpărare'] = purchase_note

r['Descriere'] = description
r['Meta: _yoast_wpseo_focuskw']  = seo_kw
r['Meta: _yoast_wpseo_title']    = seo_title
r['Meta: _yoast_wpseo_metadesc'] = seo_meta
r['Meta: rank_math_title']         = seo_title
r['Meta: rank_math_description']   = seo_meta
r['Meta: rank_math_focus_keyword'] = seo_kw

# ═══════════════════════════════════════════════════════════════
# ROW 1 - Component Protection Immo (ID 3492)
# ═══════════════════════════════════════════════════════════════
rows[1]['Descriere'] = (
    "Pentru componentele IMMO se genereaza un raport care este trimis catre reprezentanta VAG. "
    "Raspunsul este primit in 48-72h lucratoare. "
    "Sunt necesare fisierele complete si VIN-ul vehiculului."
)

# ═══════════════════════════════════════════════════════════════
# ROW 2 - SVM Coding (ID 3010)
# ═══════════════════════════════════════════════════════════════
rows[2]['Descriere'] = (
    "Codare SVM (Software Version Management) pentru vehicule VAG: VW, Audi, SEAT, Skoda. "
    "Serviciu online, executat prin telecomanda cu interfata VNCI 6154 / Smartlink C. "
    "Include testare functii si raport de interventie."
)

# ═══════════════════════════════════════════════════════════════
# ROW 3 - Component Protection (ID 3011)
# ═══════════════════════════════════════════════════════════════
rows[3]['Descriere'] = (
    "Deblocare Component Protection (CP) pentru module VAG montate dintr-un alt VIN. "
    "Serviciu online cu dovada de proprietate obligatorie (factura piesa + documente vehicul). "
    "Include testare functii si raport de interventie."
)

# ── WRITE ─────────────────────────────────────────────────────
with open(dst, 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

print("Done:", dst)
print("Rows:", len(rows))

# Verify key changed
with open(dst, newline='', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    rows_check = list(reader)
    r0 = rows_check[0]
    print("Meta title:", r0.get('Meta: _yoast_wpseo_title', ''))
    print("Short desc len:", len(r0.get(short_key, '')))
    print("Desc len:", len(r0.get('Descriere', '')))
