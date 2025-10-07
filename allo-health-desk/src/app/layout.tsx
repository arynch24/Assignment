import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SonnerProvider } from "@/components/ui/SonnerProvider";
import { AuthProvider } from "@/context/AuthContext";
import { DateProvider } from "@/context/DateContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Allo Health Desk",
  description: "Allo Health Desk Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <DateProvider>
            {children}
            <SonnerProvider />
          </DateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
