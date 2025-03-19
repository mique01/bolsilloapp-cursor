import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import ClientLayout from "../components/ClientLayout";
import { SupabaseAuthProvider } from './lib/contexts/SupabaseAuthContext';

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
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if (window.location.pathname === "/") {
                const redirect = sessionStorage.redirect;
                if (redirect) {
                  delete sessionStorage.redirect;
                  history.replaceState(null, null, redirect);
                }
              }
            })();
          `
        }} />
      </head>
      <body className={`${inter.className} h-full bg-gray-950 text-white`}>
        <SupabaseAuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}