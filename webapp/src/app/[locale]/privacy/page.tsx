import { Link } from "@/i18n/routing";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/login" className="text-sm text-gold-light hover:underline">
        ← VisionGarage
      </Link>
      <h1 className="mb-6 mt-4 font-heading text-3xl text-cream">Politica de confidențialitate</h1>
      <div className="prose-vg max-w-none">
        <h2>1. Operator</h2>
        <p>VisionGarage. Contact: visiongaragear@gmail.com.</p>
        <h2>2. Date prelucrate</h2>
        <p>
          Adresă de email, nume afișat, conținutul notițelor tale, atașamentele încărcate, jurnalul
          de acces (necesar securității) și starea abonamentului.
        </p>
        <h2>3. Temei și scop</h2>
        <p>
          Prelucrăm datele pentru a-ți furniza serviciul (executarea contractului) și pentru a
          asigura securitatea (interes legitim: prevenirea scurgerilor și a abuzului).
        </p>
        <h2>4. Localizare (UE / GDPR)</h2>
        <p>
          Datele sunt găzduite pe infrastructură în <strong>Uniunea Europeană</strong> (Supabase,
          regiune UE). Nu transferăm date în afara SEE fără garanții adecvate.
        </p>
        <h2>5. Izolarea datelor</h2>
        <p>
          Datele fiecărui client sunt izolate strict prin Row-Level Security la nivel de bază de
          date. Un client nu poate accesa niciodată datele altui client.
        </p>
        <h2>6. Drepturile tale</h2>
        <p>
          Ai dreptul de acces, rectificare, export (portabilitate) și ștergere. Exportul datelor tale
          private se face din <em>Setări → Export date</em>. Pentru ștergerea completă a contului,
          scrie la visiongaragear@gmail.com.
        </p>
        <h2>7. Păstrare</h2>
        <p>
          Păstrăm datele cât timp contul este activ. Jurnalul de acces se păstrează o perioadă
          limitată, necesară securității.
        </p>
        <p className="text-xs text-muted">Ultima actualizare: 2026.</p>
      </div>
    </main>
  );
}
