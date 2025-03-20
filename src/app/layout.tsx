import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import ClientLayout from "../components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bolsillo App",
  description: "Gestiona tus finanzas personales de manera inteligente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} h-full text-gray-900 dark:text-gray-100`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
