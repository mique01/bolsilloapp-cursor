import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import ClientLayout from "../components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bolsillo App",
  description: "Gestiona tus finanzas personales de manera inteligente",
};

// Agregar un script para establecer la ruta base correctamente en GitHub Pages
const BasePathScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            window.basePath = '${process.env.NEXT_PUBLIC_BASE_PATH || ''}';
            window.isBasepathHandled = ${process.env.NODE_ENV === 'production'};
            console.log('Base path set to:', window.basePath);
            console.log('Basepath handled by Next.js:', window.isBasepathHandled);
          })();
        `,
      }}
    />
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <BasePathScript />
      </head>
      <body className={`${inter.className} h-full text-gray-900 dark:text-gray-100 dark-theme`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
