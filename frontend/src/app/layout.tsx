import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormBuilder",
  description: "FormBuilder - Crie formulários modernos rapidamente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <div className="text-lg font-semibold">FormBuilder</div>
          </div>
        </div>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
