import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "codecrack.dev — OpenAI-compatible gateway to Hermes",
  description:
    "Persona-locked agent with tools, memory, and streaming. Satu base URL, satu key — pakai dari CLI mana aja.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
