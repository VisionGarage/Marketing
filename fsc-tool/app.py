#!/usr/bin/env python3
"""Simple local web UI for generating FSC files. Run: python app.py"""
from __future__ import annotations

import io
import zipfile

from flask import Flask, render_template, request, send_file, flash, redirect, url_for

import fsc_core

app = Flask(__name__)
app.secret_key = "local-only-fsc-tool"

APPID_CHOICES = [f"{a:04X}" for a in fsc_core.ALL_APPIDS]


@app.route("/", methods=["GET"])
def index():
    return render_template(
        "index.html",
        appid_choices=APPID_CHOICES,
        default_appid=f"{fsc_core.DEFAULT_APPID:04X}",
    )


def _load_template_bytes():
    upload = request.files.get("template")
    if upload and upload.filename:
        return upload.read()
    return None


@app.route("/generate", methods=["POST"])
def generate():
    vin7 = request.form.get("vin", "").strip()
    generate_all = request.form.get("generate_all") == "on"

    try:
        vin = fsc_core.validate_vin(vin7)
        template = fsc_core.load_template(_load_template_bytes())
    except ValueError as exc:
        flash(str(exc))
        return redirect(url_for("index"))

    if generate_all:
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            for appid in fsc_core.ALL_APPIDS:
                output, *_ = fsc_core.build_fsc(template, vin, appid)
                zf.writestr(f"FSC_{vin7}_{appid:04x}.fsc", output)
        buffer.seek(0)
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"FSC_{vin7}_all.zip",
            mimetype="application/zip",
        )

    appid_text = request.form.get("appid", "").strip()
    try:
        appid = int(appid_text, 16)
    except ValueError:
        flash("App ID invalid; folosește format hexazecimal, ex. 017C")
        return redirect(url_for("index"))

    try:
        output, digest, quotient, checked, strict_valid = fsc_core.build_fsc(
            template, vin, appid
        )
    except (ValueError, RuntimeError, AssertionError) as exc:
        flash(f"Eroare la generare: {exc}")
        return redirect(url_for("index"))

    buffer = io.BytesIO(output)
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"FSC_{vin7}_{appid:04x}.fsc",
        mimetype="application/octet-stream",
    )


if __name__ == "__main__":
    app.run(debug=False, host="127.0.0.1", port=5000)
