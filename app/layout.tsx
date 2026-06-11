import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "G££ Nation Solutions | Hotspot Manager",
  description: "Advanced Hotspot Billing System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}