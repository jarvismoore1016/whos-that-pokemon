import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Who's That Pokémon? — AI Pokémon Generator",
    template: "%s | Who's That Pokémon?",
  },
  description: "Create your own custom AI-generated Pokémon with stats, moves, anime artwork, and Pokédex entries. Collect them as TCG-style cards.",
  keywords: ["pokémon", "AI", "generator", "custom pokémon", "anime", "TCG"],
  openGraph: {
    type: "website",
    title: "Who's That Pokémon? — AI Pokémon Generator",
    description: "Describe any creature. AI generates it as a real Pokémon.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar session={session} />
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
