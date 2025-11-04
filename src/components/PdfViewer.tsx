/**
 * Composant de visualisation PDF avec react-pdf
 * Affiche un PDF dans une modal avec navigation de pages
 */

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from './ui/Button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Configuration worker PDF.js depuis CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  filename: string;
  initialPage: number;
  onClose: () => void;
  section?: string;
}

export function PdfViewer({ filename, initialPage, onClose, section }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError('Erreur de chargement du PDF');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              📖 {filename}
            </h3>
            {section && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {section}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement du PDF...</p>
            </div>
          )}

          {error && (
            <div className="text-center p-8">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">{error}</p>
              <p className="text-sm text-gray-500">Le fichier PDF n'est peut-être pas disponible.</p>
            </div>
          )}

          {!error && (
            <Document
              file={`/pdfs/${filename}`}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              className="flex justify-center"
            >
              <Page
                pageNumber={pageNumber}
                width={Math.min(window.innerWidth - 100, 900)}
                loading={null}
                className="shadow-lg"
              />
            </Document>
          )}
        </div>

        {/* Footer Navigation */}
        {!loading && !error && numPages > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg flex justify-between items-center">
            <Button
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {pageNumber} / {numPages}
            </span>

            <Button
              onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              variant="outline"
              className="flex items-center gap-2"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

