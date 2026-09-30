import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Form 14A | Signing tracker",
  description: "Track purchaser signatures and follow-ups for Form 14A property transfers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
