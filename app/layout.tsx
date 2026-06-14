import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

export const metadata: Metadata = {
  title: "codecrack.dev — Gateway kompatibel OpenAI untuk Hermes",
  description:
    "Agen dengan persona terkunci, dilengkapi tools, memori, dan streaming. Satu base URL, satu key, dapat digunakan dari CLI mana pun.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
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
