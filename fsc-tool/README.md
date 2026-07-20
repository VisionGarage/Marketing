# Generator FSC

Două variante, ambele folosesc aceeași logică din `fsc_core.py`:

- **`fsc_gui.py`** — aplicație desktop cu fereastră (Windows/Mac/Linux), cea mai simplă variantă. **Recomandat.**
- **`app.py`** — aplicație web locală (Flask), utilă dacă preferi browser-ul.

---

## Varianta simplă: aplicația desktop (Windows)

Necesită o singură instalare, o singură dată: **Python**.

1. Descarcă Python de pe https://www.python.org/downloads/windows/
   (ultima versiune, ex. 3.12).
2. La instalare, bifează neapărat **"Add python.exe to PATH"** înainte de a
   apăsa Install.
3. Copiază folderul `fsc-tool` pe calculatorul tău Windows.
4. Dă dublu-click pe **`Genereaza_FSC.bat`**.

Se deschide o fereastră simplă: introduci VIN-ul, alegi App ID-ul (sau
bifezi "generează toate"), apeși **Generează** și alegi unde salvezi
fișierul. Nu mai e nevoie de `pip install`, `venv` sau linie de comandă —
Tkinter (interfața grafică) și tot restul vin incluse în Python.

### Dacă vrei un `.exe` de sine stătător (fără Python instalat deloc)

Pe un calculator Windows cu Python deja instalat, rulează o singură dată:

```bat
pip install pyinstaller
pyinstaller --onefile --windowed --name GeneratorFSC fsc_gui.py
```

Rezultă `dist\GeneratorFSC.exe` — un singur fișier pe care îl poți muta/copia
oriunde și rula prin dublu-click, fără ca Python să mai fie instalat pe acel
calculator. (Nu pot genera acest `.exe` direct din acest mediu, pentru că
build-ul PyInstaller pentru Windows trebuie rulat pe Windows.)

---

## Varianta web (Flask)

```bash
cd fsc-tool
python3 -m venv venv
source venv/bin/activate   # pe Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Apoi deschide http://127.0.0.1:5000 în browser.

## Utilizare (identică în ambele variante)

1. Introdu VIN-ul (exact 7 caractere alfanumerice).
2. Alege App ID-ul dorit din listă (sau bifează "generează toate" pentru a
   primi toate fișierele/App ID-urile predefinite).
3. Opțional, alege propriul template binar; altfel se folosește
   template-ul implicit.
4. Apasă "Generează" și alege unde salvezi fișierul.

Ambele variante rulează doar local, nu expun nimic în rețea.
