import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Check, Copy, Printer } from 'lucide-react';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  label?: string;
  sublabel?: string;
  downloadFilename?: string;
  showActions?: boolean;
  colorDark?: string;
  colorLight?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  data,
  size = 200,
  label,
  sublabel,
  downloadFilename = 'eventpulse-qr-pass.png',
  showActions = true,
  colorDark = '#000000',
  colorLight = '#FFFFFF',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        data,
        {
          width: size,
          margin: 1.5,
          color: {
            dark: colorDark,
            light: colorLight,
          },
          errorCorrectionLevel: 'M',
        },
        (error) => {
          if (error) console.error('Error generating QR Code', error);
        }
      );
    }
  }, [data, size, colorDark, colorLight]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = downloadFilename;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Pass - ${label || 'EventPulse'}</title>
            <style>
              body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 90vh; margin: 0; }
              .badge { border: 2px solid #222; padding: 24px; border-radius: 16px; text-align: center; max-width: 320px; }
              h2 { margin: 8px 0 4px 0; font-size: 18px; }
              p { margin: 4px 0; color: #555; font-size: 14px; }
              img { margin: 12px 0; border: 1px solid #ccc; border-radius: 8px; }
              .code { font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 2px; }
            </style>
          </head>
          <body onload="window.print();window.close();">
            <div class="badge">
              <h2>${sublabel || 'VIP Entry Pass'}</h2>
              <img src="${dataUrl}" width="${size}" />
              <div class="code">${label || ''}</div>
              <p>Present this ticket at the check-in desk for entry</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleCopyCode = () => {
    try {
      const parsed = JSON.parse(data);
      navigator.clipboard.writeText(parsed.code || data);
    } catch {
      navigator.clipboard.writeText(data);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center bg-[#141414] p-4 rounded-2xl border border-[#2E2E2E] shadow-lg transition-all">
      <div className="relative p-2.5 bg-white rounded-xl shadow-inner flex items-center justify-center">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      {label && (
        <div className="mt-3 text-center">
          <p className="font-mono font-bold text-[#D4AF37] text-sm tracking-wider uppercase">{label}</p>
          {sublabel && <p className="text-xs text-[#888888] font-light mt-0.5">{sublabel}</p>}
        </div>
      )}

      {showActions && (
        <div className="flex items-center gap-2 mt-3 w-full justify-center flex-wrap">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#CCCCCC] hover:text-white bg-[#1E1E1E] hover:bg-[#282828] border border-[#333333] rounded-lg transition-colors cursor-pointer"
            title="Download QR image"
          >
            <Download className="w-3.5 h-3.5 text-[#888888]" />
            <span>Download</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#CCCCCC] hover:text-white bg-[#1E1E1E] hover:bg-[#282828] border border-[#333333] rounded-lg transition-colors cursor-pointer"
            title="Print Physical Pass"
          >
            <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Print</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[#D4AF37] bg-[#1D1B13] hover:bg-[#2A2410] border border-[#D4AF37]/40 rounded-lg transition-colors cursor-pointer"
            title="Copy verification code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span className="text-[#4ADE80]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

