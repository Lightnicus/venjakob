'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export type PdfPreviewProps = {
  file: string;
};

const PdfPreview: React.FC<PdfPreviewProps> = ({ file }) => {
  const [numPages, setNumPages] = useState<number>();
  const [error, setError] = useState<string | null>(null);

  const handleLoadSuccess = (params: { numPages: number }) => {
    setNumPages(params.numPages);
  };

  const handleLoadError = (e: Error) => {
    setError('PDF konnte nicht geladen werden.');
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Document
        file={file}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        loading={<div className="text-gray-500">Lade PDF…</div>}
        error={
          <div className="text-red-500">PDF konnte nicht geladen werden.</div>
        }
        aria-label="PDF Vorschau"
      >
        {numPages &&
          Array.from(new Array(numPages), (el, idx) => (
            <Page
              key={`page_${idx + 1}`}
              pageNumber={idx + 1}
              width={800}
              className="mx-auto my-2 border rounded shadow"
            />
          ))}
      </Document>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <a
        href={file}
        className="underline text-blue-700 mt-2"
        tabIndex={0}
        aria-label="PDF herunterladen"
      >
        PDF herunterladen
      </a>
    </div>
  );
};

export default PdfPreview;
