import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poder Blog",
  description: "Blog con artículos y comentarios. Admin para publicar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className="antialiased bg-background text-foreground"
      >
        {children}
      </body>
    </html>
  );
}
