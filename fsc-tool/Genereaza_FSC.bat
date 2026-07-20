@echo off
cd /d "%~dp0"
py -3 fsc_gui.py
if errorlevel 1 (
    echo.
    echo A aparut o eroare. Verifica daca Python este instalat ^(python.org^),
    echo cu optiunea "Add python.exe to PATH" bifata la instalare.
    pause
)
