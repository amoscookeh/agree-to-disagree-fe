import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agree 2 Disagree",
  description: "Deep research on political debates from multiple perspectives",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
