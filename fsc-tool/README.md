# Generator FSC (aplicație web locală)

Interfață web simplă peste logica de generare a fișierelor FSC.

## Instalare și rulare

```bash
cd fsc-tool
python3 -m venv venv
source venv/bin/activate   # pe Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Apoi deschide http://127.0.0.1:5000 în browser.

## Utilizare

1. Introdu VIN-ul (exact 7 caractere alfanumerice).
2. Alege App ID-ul dorit din listă (sau bifează "generează toate" pentru a
   primi o arhivă .zip cu toate App ID-urile predefinite).
3. Opțional, încarcă propriul template binar; altfel se folosește
   template-ul implicit.
4. Apasă "Generează" — fișierul .fsc (sau arhiva .zip) se descarcă automat.

Aplicația rulează doar local (127.0.0.1) și nu expune nimic în rețea.
