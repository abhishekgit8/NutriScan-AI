"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, Loader2 } from "lucide-react";

interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scanner = new Html5Qrcode("barcode-scanner-viewport");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          Promise.resolve(scanner.stop()).catch(() => {});
          onScan(decodedText);
        },
        () => {}
      )
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("Camera error:", err);
        setError(
          "Camera access denied or unavailable. Try entering the barcode manually."
        );
        setLoading(false);
      });

    return () => {
      if (scannerRef.current) {
        Promise.resolve(scannerRef.current.stop()).catch(() => {});
        Promise.resolve(scannerRef.current.clear()).catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between bg-black px-4 py-3">
        <h2 className="text-sm font-medium text-white">Scan Barcode</h2>
        <button
          onClick={() => {
            Promise.resolve(scannerRef.current?.stop()).catch(() => {});
            onClose();
          }}
          className="rounded-full p-2 text-white/80 hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div id="barcode-scanner-viewport" ref={containerRef} className="h-full w-full" />

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
            <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            <p className="text-sm text-white/70">Starting camera...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 px-8 text-center">
            <Camera className="h-12 w-12 text-white/30" />
            <p className="text-sm text-white/70">{error}</p>
            <button
              onClick={onClose}
              className="rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Enter Manually
            </button>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[150px] w-[250px] rounded-lg border-2 border-green-400/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
        </div>
      </div>

      <div className="bg-black px-4 py-4 text-center">
        <p className="text-xs text-white/50">
          Point your camera at a product barcode
        </p>
      </div>
    </div>
  );
}
