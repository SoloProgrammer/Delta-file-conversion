import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Excel to JSON Converter - Fast & Secure File Conversion',
  description: 'Convert Excel files (.xlsx, .xls, .csv) to JSON format instantly. Fast, secure, and easy-to-use online converter with drag-and-drop functionality.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}