import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dizes Community | Explorer & Share Dice",
  description: "The official community for Dizes app. Upload, download, and discover unique dice configurations created by users worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a0a0b] text-white">
        {children}
      </body>
    </html>
  );
}
