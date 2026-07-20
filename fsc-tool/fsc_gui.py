#!/usr/bin/env python3
"""Aplicație desktop (Tkinter) pentru generarea fișierelor FSC.
Nu necesită nicio instalare suplimentară — folosește doar Python standard.
"""
from __future__ import annotations

import os
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

import fsc_core

APPID_CHOICES = [f"{a:04X}" for a in fsc_core.ALL_APPIDS]
DEFAULT_APPID = f"{fsc_core.DEFAULT_APPID:04X}"


class FscApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Generator FSC")
        self.resizable(False, False)
        self.template_path: str | None = None

        pad = {"padx": 10, "pady": 6}

        ttk.Label(self, text="VIN (7 caractere)").grid(row=0, column=0, sticky="w", **pad)
        self.vin_var = tk.StringVar()
        ttk.Entry(self, textvariable=self.vin_var, width=20).grid(row=0, column=1, sticky="w", **pad)

        ttk.Label(self, text="App ID").grid(row=1, column=0, sticky="w", **pad)
        self.appid_var = tk.StringVar(value=DEFAULT_APPID)
        self.appid_combo = ttk.Combobox(
            self, textvariable=self.appid_var, values=APPID_CHOICES, width=17, state="readonly"
        )
        self.appid_combo.grid(row=1, column=1, sticky="w", **pad)

        self.all_var = tk.BooleanVar(value=False)
        self.all_check = ttk.Checkbutton(
            self, text="Generează toate App ID-urile predefinite",
            variable=self.all_var, command=self._toggle_all
        )
        self.all_check.grid(row=2, column=0, columnspan=2, sticky="w", **pad)

        ttk.Label(self, text="Template (opțional)").grid(row=3, column=0, sticky="w", **pad)
        template_frame = ttk.Frame(self)
        template_frame.grid(row=3, column=1, sticky="w", **pad)
        self.template_label = ttk.Label(template_frame, text="(implicit)", width=20)
        self.template_label.pack(side="left")
        ttk.Button(template_frame, text="Alege...", command=self._choose_template).pack(side="left", padx=4)

        ttk.Button(self, text="Generează", command=self._generate).grid(
            row=4, column=0, columnspan=2, pady=14
        )

        self.status_var = tk.StringVar(value="")
        ttk.Label(self, textvariable=self.status_var, foreground="#555", wraplength=340, justify="left").grid(
            row=5, column=0, columnspan=2, sticky="w", padx=10, pady=(0, 10)
        )

    def _toggle_all(self):
        state = "disabled" if self.all_var.get() else "readonly"
        self.appid_combo.configure(state=state)

    def _choose_template(self):
        path = filedialog.askopenfilename(title="Alege fișierul template")
        if path:
            self.template_path = path
            self.template_label.configure(text=os.path.basename(path))

    def _load_template_bytes(self) -> bytes | None:
        if not self.template_path:
            return None
        with open(self.template_path, "rb") as fh:
            return fh.read()

    def _generate(self):
        vin7 = self.vin_var.get().strip()
        try:
            vin = fsc_core.validate_vin(vin7)
            template = fsc_core.load_template(self._load_template_bytes())
        except ValueError as exc:
            messagebox.showerror("Eroare", str(exc))
            return

        if self.all_var.get():
            out_dir = filedialog.askdirectory(title="Alege folderul destinație")
            if not out_dir:
                return
            target_dir = os.path.join(out_dir, vin7)
            os.makedirs(target_dir, exist_ok=True)
            count = 0
            for appid in fsc_core.ALL_APPIDS:
                try:
                    output, *_ = fsc_core.build_fsc(template, vin, appid)
                except Exception as exc:
                    messagebox.showerror("Eroare", f"App ID {appid:04X}: {exc}")
                    return
                with open(os.path.join(target_dir, f"FSC_{vin7}_{appid:04x}.fsc"), "wb") as fh:
                    fh.write(output)
                count += 1
            self.status_var.set(f"Generate {count} fișiere în: {target_dir}")
            messagebox.showinfo("Gata", f"Generate {count} fișiere în:\n{target_dir}")
            return

        appid_text = self.appid_var.get().strip()
        try:
            appid = int(appid_text, 16)
        except ValueError:
            messagebox.showerror("Eroare", "App ID invalid; folosește format hex, ex. 017C")
            return

        try:
            output, digest, quotient, checked, strict_valid = fsc_core.build_fsc(
                template, vin, appid
            )
        except Exception as exc:
            messagebox.showerror("Eroare", str(exc))
            return

        default_name = f"FSC_{vin7}_{appid:04x}.fsc"
        save_path = filedialog.asksaveasfilename(
            title="Salvează fișierul FSC",
            initialfile=default_name,
            defaultextension=".fsc",
            filetypes=[("FSC files", "*.fsc"), ("All files", "*.*")],
        )
        if not save_path:
            return
        with open(save_path, "wb") as fh:
            fh.write(output)

        self.status_var.set(
            f"Salvat: {save_path}\nMD5: {digest.hex().upper()}\nquotient: {quotient}"
        )
        messagebox.showinfo("Gata", f"Fișier salvat:\n{save_path}")


if __name__ == "__main__":
    app = FscApp()
    app.mainloop()
