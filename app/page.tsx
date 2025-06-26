'use client';

import { FileSpreadsheet, ArrowRight, Zap, Shield, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import FileUploader from '@/components/FileUploader';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Excel to JSON</h1>
              <p className="text-sm text-gray-500">Convert your spreadsheets instantly</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">

        {/* File Uploader */}
        <div className="mb-16">
          <FileUploader />
        </div>
      </main>
    </div>
  );
}