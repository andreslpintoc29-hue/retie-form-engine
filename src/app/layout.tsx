import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RETIE Form Engine",
  description: "Motor dinámico de formularios para inspecciones RETIE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}