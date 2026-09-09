import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IUST Library Insights | Book Demand Analyzer",
  description:
    "An interactive library analytics dashboard for exploring borrowing demand and planning evidence-based book purchases.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
