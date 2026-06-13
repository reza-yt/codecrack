import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
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
      <body className="min-h-screen flex flex-col">
        <NextTopLoader
          color="#34d399"
          height={2}
          showSpinner={false}
          shadow="0 0 10px #34d399, 0 0 5px #34d399"
          easing="cubic-bezier(0.45, 0, 0.15, 1)"
          speed={300}
        />
        {children}
      </body>
    </html>
  );
}
