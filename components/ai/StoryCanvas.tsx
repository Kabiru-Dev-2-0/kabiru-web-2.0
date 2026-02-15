'use client';
import {
  CopyRegular,
  DocumentPdfRegular,
  CheckmarkRegular,
  DismissRegular
} from '@fluentui/react-icons';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

import MermaidRenderer from './MermaidRenderer';

interface StoryCanvasProps {
  content: string;
  title?: string;
  onClose?: () => void;
  images?: { url: string; alt: string }[];
  diagram?: string;
}

export default function StoryCanvas({ content, title = 'Generated Story', onClose, images, diagram }: StoryCanvasProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const coverImages = images?.map(img => `<img src="${img.url}" alt="${img.alt}" class="cover-image" />`).join('') || '';
      const contentHtml = document.querySelector('.markdown-content')?.innerHTML || content;

      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
              @page { size: A4; margin: 20mm; }
              body { font-family: 'Inter', sans-serif; color: #1f2937; margin: 0; padding: 0; }
              
              /* Cover Page Styles */
              .cover-page {
                min-height: 80vh; /* Reduced from 100vh to prevent overflow blank page */
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                page-break-after: always;
                padding: 0; /* Remove padding to avoid box-model issues */
              }
              .cover-title {
                font-size: 32px;
                font-weight: 800;
                margin-bottom: 20px;
                line-height: 1.3;
              }
              .cover-image {
                max-width: 90%;
                max-height: 60vh;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                margin-bottom: 20px;
                object-fit: contain;
              }

              /* Content Styles */
              .content-page {
                padding: 40px;
                line-height: 1.8;
                max-width: 800px;
                margin: 0 auto;
              }
              .story-images-container { display: none !important; } /* Hide duplicate images in content */
              
              h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; font-size: 24px; font-weight: 700; }
              h2 { margin-top: 24px; margin-bottom: 12px; font-size: 20px; font-weight: 600; }
              p { margin-bottom: 16px; text-align: justify; }
              pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 16px; }
              blockquote { border-left: 4px solid #d1d5db; padding-left: 16px; color: #4b5563; font-style: italic; }
              img { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 16px; }
            </style>
          </head>
          <body>
            
            <!-- Page 1: Cover (Image + Title) -->
            <div class="cover-page">
              <h1 class="cover-title">${title}</h1>
              ${coverImages}
            </div>

            <!-- Page 2+: Content -->
            <div class="content-page">
              <div id="content">${contentHtml}</div>
            </div>

            <script>
              window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 800); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Card className="h-full border-2 border-[#E4E4E7] dark:border-gray-800 shadow-sm bg-white dark:bg-[#18181b]" radius="lg">
      <CardHeader className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#3674B5] rounded-full"></div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            onPress={handleCopy}
            startContent={copied ? <CheckmarkRegular className="w-4 h-4" /> : <CopyRegular className="w-4 h-4" />}
            className={copied ? "text-green-600 bg-green-50" : "text-gray-600"}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            onPress={handleExportPDF}
            startContent={<DocumentPdfRegular className="w-4 h-4" />}
          >
            Export PDF
          </Button>
          {onClose && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={onClose}
              className="text-gray-400 hover:text-gray-600 -mr-2"
            >
              <DismissRegular className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody className="p-0 overflow-hidden bg-[#FAFAFA] dark:bg-black/20">
        <div className="h-full overflow-y-auto px-10 py-8">
          <article className="prose prose-slate md:prose-lg lg:prose-lg max-w-none dark:prose-invert markdown-content font-sans">
            {/* Title - Removed to avoid duplication as it is already in the markdown content */}
            {/* <h1 className="text-3xl font-bold text-gray-900 border-b pb-4 mb-8">{title}</h1> */}

            {/* Generated Images */}
            {images && images.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6 mb-8 story-images-container">
                {images.map((img, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden shadow-md max-w-lg w-full">
                    <img src={img.url} alt={img.alt || 'Generated Image'} className="w-full h-auto object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Diagram */}
            {diagram && (
              <div className="mb-10 p-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Diagram Alur Cerita</h3>
                <MermaidRenderer chart={diagram} />
              </div>
            )}

            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-6" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4" {...props} />,
                p: ({ node, ...props }) => <p className="text-gray-800 leading-7 mb-4 text-justify text-base" {...props} />,
                li: ({ node, ...props }) => <li className="text-gray-700 text-base" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </CardBody>
    </Card>
  );
}
