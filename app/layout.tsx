import type { Metadata } from "next";
import { Cormorant_Garamond, EB_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const serifBook = EB_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif-book",
});

const sans = Inter({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Librería personal de Esteban",
  description: "Librería 3D interactiva de Esteban — arrastrá para girar, scroll para zoom, click en un libro para abrirlo y descargar su cosechá en PDF.",
  themeColor: "#E5D3A8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${serif.variable} ${serifBook.variable} ${sans.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
