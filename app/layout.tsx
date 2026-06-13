import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://codecrack.dev"),
  title: {
    default: "codecrack.dev — OpenAI-compatible gateway to Hermes",
    template: "%s · codecrack.dev",
  },
  description:
    "Persona-locked agent with tools, memory, and streaming. Satu base URL, satu key — pakai dari CLI mana aja.",
  openGraph: {
    title: "codecrack.dev",
    description: "OpenAI-compatible gateway to Hermes.",
    url: "https://codecrack.dev",
    siteName: "codecrack.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "codecrack.dev",
    description: "OpenAI-compatible gateway to Hermes.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  );
}
