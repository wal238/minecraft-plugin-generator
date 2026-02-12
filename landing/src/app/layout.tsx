import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MC Plugin Builder | Create Minecraft Plugins Without Code",
    template: "%s | MC Plugin Builder",
  },
  description:
    "Build custom Minecraft server plugins visually. Drag-and-drop block editor generates real Paper API Java code. Free to start, no coding required.",
  keywords: ["minecraft", "plugin", "builder", "paper api", "no code", "server plugins"],
  openGraph: {
    title: "MC Plugin Builder | Create Minecraft Plugins Without Code",
    description:
      "Build custom Minecraft server plugins visually with our drag-and-drop editor.",
    url: siteUrl,
    siteName: "MC Plugin Builder",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "MC Plugin Builder - Create Minecraft Plugins Without Code",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MC Plugin Builder",
    description: "Build custom Minecraft plugins without writing code.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MC Plugin Builder",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description:
    "Build custom Minecraft server plugins visually with a drag-and-drop editor. No Java knowledge required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
