import type * as React from "react";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/cookie-consent";
import type { Metadata, Viewport } from "next";

const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.artissafe.dk'),
  title: {
    default: 'ART IS SAFE - Køb og sælg original kunst online',
    template: '%s | ART IS SAFE'
  },
  description: 'Danmarks førende online markedsplads for original kunst. Køb og sælg malerier, skulpturer og kunstværker direkte fra kunstnere. AI-drevet prisevaluering baseret på markedsdata.',
  keywords: [
    'kunst',
    'kunstmarkedsplads',
    'køb kunst',
    'sælg kunst',
    'original kunst',
    'malerier',
    'skulpturer',
    'kunstværker',
    'danske kunstnere',
    'kunstgalleri online',
    'prisevaluering kunst',
    'kunstauktion'
  ],
  authors: [{ name: 'ART IS SAFE' }],
  creator: 'ART IS SAFE',
  publisher: 'ART IS SAFE',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'da_DK',
    url: '/',
    siteName: 'ART IS SAFE',
    title: 'ART IS SAFE - Køb og sælg original kunst online',
    description: 'Danmarks førende online markedsplads for original kunst. Køb og sælg malerier, skulpturer og kunstværker direkte fra kunstnere.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ART IS SAFE',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ART IS SAFE - Køb og sælg original kunst online',
    description: 'Danmarks førende online markedsplads for original kunst. Køb og sælg malerier, skulpturer og kunstværker direkte fra kunstnere.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  category: 'art',
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className="light" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${fontSans.variable} font-sans antialiased`}>
        {children}
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
