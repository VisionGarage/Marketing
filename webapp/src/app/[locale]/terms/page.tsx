import { Link } from "@/i18n/routing";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/login" className="text-sm text-gold-light hover:underline">
        ← VisionGarage
      </Link>
      <h1 className="mb-6 mt-4 font-heading text-3xl text-cream">Termeni și condiții</h1>
      <div className="prose-vg max-w-none">
        <h2>1. Obiect</h2>
        <p>
          VisionGarage oferă acces, pe bază de abonament, la o bază de cunoștințe pentru
          diagnoză, codare și programare auto. Accesul este personal și nominal.
        </p>
        <h2>2. Interdicția de redistribuire</h2>
        <p>
          Conținutul bibliotecii partajate VisionGarage este protejat. Este <strong>strict
          interzisă</strong> copierea, redistribuirea, revânzarea, publicarea sau partajarea
          conținutului către terți, în orice formă. Fiecare procedură afișată și fiecare document
          exportat conține un <strong>watermark per-utilizator</strong>; orice scurgere este
          urmăribilă la sursă și atrage suspendarea imediată și răspundere juridică.
        </p>
        <h2>3. Abonament și acces</h2>
        <p>
          Accesul este condiționat de un abonament valid. La expirarea, suspendarea sau revocarea
          abonamentului, accesul este întrerupt imediat. Notițele tale private rămân exportabile la
          cerere conform politicii GDPR.
        </p>
        <h2>4. Conținutul propriu</h2>
        <p>
          Notițele private create de tine îți aparțin. VisionGarage nu le accesează în scop comercial
          și le poți exporta sau șterge oricând.
        </p>
        <h2>5. Răspundere</h2>
        <p>
          Procedurile au caracter informativ. Aplicarea lor pe vehicule se face pe răspunderea
          utilizatorului, cu respectarea legislației aplicabile.
        </p>
        <h2>6. Date</h2>
        <p>
          Prelucrarea datelor respectă <Link href="/privacy">Politica de confidențialitate</Link> și
          GDPR. Datele clienților sunt găzduite în Uniunea Europeană.
        </p>
        <p className="text-xs text-muted">Ultima actualizare: 2026.</p>
      </div>
    </main>
  );
}
