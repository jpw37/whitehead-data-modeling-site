import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const title = "Data-Driven Modeling Group";
const description = "Jared P. Whitehead's research group at BYU, using data to understand, construct, and improve mathematical models.";
const imageUrl = `${siteUrl}/og.png`;

export const dynamic = "force-static";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: imageUrl, width: 1730, height: 909, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [imageUrl],
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
