import type { Metadata } from "next";
import { Geist, Geist_Mono, Alegreya_Sans, Press_Start_2P } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const alegreyaSans = Alegreya_Sans({
  weight: ['300', '400', '500', '700', '800', '900'],
  variable: "--font-alegreya-sans",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: '400',
  variable: "--font-press-start",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PsyCatrist Time",
  description: "Your daily life in manga form",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${alegreyaSans.variable} ${pressStart2P.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
