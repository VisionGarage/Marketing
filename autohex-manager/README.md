# VisionGarage Coding Manager

Aplicatie desktop (Electron + React + SQLite) pentru gestiunea procedurilor de
**coding si retrofit**, a fisierelor de coding si a istoricului interventiilor
pe vehiculele clientilor VisionGarage.

Aceasta aplicatie **nu comunica direct cu ECU-ul vehiculului** (nu necesita
interfata J2534/VCI). Este un instrument de organizare: biblioteca de proceduri
documentate, arhiva de fisiere de coding (backup-uri), evidenta clienti/vehicule
si checklist/istoric interventii.

## Functionalitati

- **Biblioteca proceduri**: proceduri de coding/retrofit organizate pe
  marca/model/an, cu precondiitii, pasi, unelte necesare si note de risc.
- **Clienti & vehicule**: evidenta clientilor si a vehiculelor asociate.
- **Fisiere de coding**: atasare si arhivare fisiere de backup per vehicul,
  optional legate de o procedura anume.
- **Istoric interventii**: checklist generat automat din pasii procedurii,
  status (planificat / in lucru / finalizat / esuat), tehnician, note.

## Rulare in dezvoltare

Necesita Node.js 18+ instalat.

```bash
npm install
npm run dev
```

Aceasta porneste serverul Vite pentru interfata (React). Pentru a rula si
fereastra Electron in paralel, intr-un alt terminal:

```bash
npm run build
VITE_DEV_SERVER_URL=http://localhost:5173 npx electron .
```

## Build pentru Windows

```bash
npm run electron:pack
```

Genereaza un instalator `.exe` (NSIS) in folderul `release/`, pornind de la
configuratia `electron-builder` din `package.json`.

## Date

Datele (clienti, vehicule, proceduri, fisiere, istoric) sunt stocate local
intr-o baza SQLite in folderul de date al aplicatiei (`app.getPath('userData')`),
iar fisierele de coding atasate sunt copiate in acelasi folder, sub
`coding-files/<id-vehicul>/`.

## Nota

Acest proiect a fost creat ca alternativa proprie, mai simpla, la aplicatii de
tip AutoHex Platform - axat strict pe organizarea procedurilor si fisierelor
de lucru ale atelierului, nu pe comunicarea hardware cu ECU-ul.
