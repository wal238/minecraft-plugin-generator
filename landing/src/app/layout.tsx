import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MC Plugin Builder | Create Minecraft Plugins Without Code",
  description: "Build custom Minecraft server plugins visually. Drag-and-drop block editor generates real Paper API Java code. Free to start, no coding required.",
  keywords: ["minecraft", "plugin", "builder", "paper api", "no code", "server plugins"],
  openGraph: {
    title: "MC Plugin Builder | Create Minecraft Plugins Without Code",
    description: "Build custom Minecraft server plugins visually with our drag-and-drop editor.",
    type: "website",
    siteName: "MC Plugin Builder",
  },
  twitter: {
    card: "summary_large_image",
    title: "MC Plugin Builder",
    description: "Build custom Minecraft plugins without writing code.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
