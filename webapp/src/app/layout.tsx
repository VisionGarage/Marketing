// Layout rădăcină pass-through. Elementul <html>/<body> este randat în
// [locale]/layout.tsx (rute localizate) și în not-found.tsx (global).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
