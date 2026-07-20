import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import type { Procedure, Profile } from "@/lib/types";

// Generează un PDF dintr-o procedură, cu WATERMARK per-user:
//  - vizibil discret (text diagonal repetat cu watermark_tag + email),
//  - identificator în METADATE (Author/Keywords/Subject).
// Orice scurgere e urmăribilă la sursă.
export async function procedureToPdf(p: Procedure, who: Profile): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);

  // Metadate = identificator per-user
  pdf.setTitle(p.title);
  pdf.setAuthor(`VisionGarage • ${who.email}`);
  pdf.setSubject(`watermark:${who.watermark_tag} user:${who.id}`);
  pdf.setKeywords([`VG-${who.watermark_tag}`, who.email, "VisionGarage", "do-not-redistribute"]);
  pdf.setCreator("VisionGarage Knowledge Base");
  pdf.setProducer(`VisionGarage • ${who.watermark_tag}`);

  const A4: [number, number] = [595.28, 841.89];
  const margin = 50;
  const lineH = 13;
  const maxWidth = A4[0] - margin * 2;
  const wmText = `VisionGarage · ${who.watermark_tag} · ${who.email}`;

  let page = pdf.addPage(A4);
  let y = A4[1] - margin;

  const drawWatermark = (pg: typeof page) => {
    // text diagonal repetat, discret
    for (let i = -1; i < 6; i++) {
      pg.drawText(wmText, {
        x: 30,
        y: 120 + i * 130,
        size: 11,
        font,
        color: rgb(0.6, 0.5, 0.2),
        opacity: 0.07,
        rotate: degrees(30),
      });
    }
  };
  drawWatermark(page);

  const newPage = () => {
    page = pdf.addPage(A4);
    drawWatermark(page);
    y = A4[1] - margin;
  };
  const ensure = (h: number) => {
    if (y - h < margin + 30) newPage();
  };

  const wrap = (text: string, f: typeof font, size: number): string[] => {
    const out: string[] = [];
    for (const raw of text.split("\n")) {
      let line = "";
      for (const word of raw.split(" ")) {
        const test = line ? line + " " + word : word;
        if (f.widthOfTextAtSize(test, size) > maxWidth && line) {
          out.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      out.push(line);
    }
    return out;
  };

  const write = (text: string, f: typeof font, size: number, color = rgb(0.1, 0.1, 0.1)) => {
    for (const line of wrap(text, f, size)) {
      ensure(size + 4);
      page.drawText(line, { x: margin, y, size, font: f, color });
      y -= size + 4;
    }
  };

  // Titlu
  write(p.title, bold, 18, rgb(0.1, 0.2, 0.19));
  y -= 6;
  // Meta
  const meta = [
    `${p.brand} • ${p.category}`,
    p.vehicle ? `Vehicul: ${p.vehicle}` : "",
    p.module_ecu ? `Modul: ${p.module_ecu}` : "",
    p.tool ? `Unealtă: ${p.tool}` : "",
    `Limbă: ${p.language.toUpperCase()}`,
    p.tags?.length ? `Tag-uri: ${p.tags.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("   |   ");
  write(meta, font, 9, rgb(0.4, 0.4, 0.4));
  y -= 8;

  // Conținut (markdown ca text monospațiat — păstrează blocurile de cod lizibile)
  for (const block of p.content_md.split("\n")) {
    write(block || " ", mono, 9, rgb(0.15, 0.15, 0.15));
  }

  // Subsol legal
  ensure(40);
  y -= 10;
  write(
    "© VisionGarage — Document personal. Redistribuirea este interzisă (vezi Termenii).",
    font,
    8,
    rgb(0.5, 0.4, 0.2)
  );

  return pdf.save();
}
