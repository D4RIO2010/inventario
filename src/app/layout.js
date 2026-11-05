import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

export const viewport = {
  themeColor: "#000000",
};

export const metadata = {
  title: 'Taller Aragua 2003 C.A | Sistema de Inventario',
  description: 'Gestión integral de repuestos de motos - Taller Aragua 2003 C.A (Autorizado Yamaha)',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Taller Aragua",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
