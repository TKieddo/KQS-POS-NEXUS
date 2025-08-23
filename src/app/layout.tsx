import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from '@/context/CurrencyContext'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'sonner'
import Script from 'next/script'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KQS POS - Point of Sale System",
  description: "Modern, offline-first point of sale system for retail businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* RSVP.js for QZ Tray */}
        <Script src="https://cdn.jsdelivr.net/npm/rsvp@4.8.5/dist/rsvp.min.js" strategy="beforeInteractive" />
        {/* Official sha-256 for QZ Tray (per docs) */}
        <Script src="https://cdn.jsdelivr.net/npm/sha-256@0.2.0/sha-256.min.js" strategy="beforeInteractive" />
        {/* QZ Tray JS library for printer integration */}
        <Script src="https://cdn.jsdelivr.net/npm/qz-tray@2.1.0/qz-tray.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <CurrencyProvider>
            {children}
            <Toaster position="top-right" richColors />
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
