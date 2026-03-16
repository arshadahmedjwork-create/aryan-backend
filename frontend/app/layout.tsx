import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import AIChat from '@/components/AIChat';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark">
        <AuthProvider>
          <Navbar />
          {children}
          <AIChat />
        </AuthProvider>
      </body>
    </html>
  );
}
