"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";

interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (!("BarcodeDetector" in window)) {
          setLoading(false);
          setError("Barcode scanning is not supported on this device. Enter the barcode manually.");
          return;
        }

        const detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"] });

        setLoading(false);

        async function scan() {
          if (cancelled || !videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              cleanup();
              onScan(code);
              return;
            }
          } catch {
            // ignore detection errors
          }
          rafRef.current = requestAnimationFrame(scan);
        }

        scan();
      } catch (err) {
        console.error("Camera error:", err);
        if (!cancelled) {
          setError("Camera access denied. Enter the barcode manually.");
          setLoading(false);
        }
      }
    }

    function cleanup() {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }

    start();

    return cleanup;
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between bg-black px-4 py-3">
        <h2 className="text-sm font-medium text-white">Scan Barcode</h2>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-white/80 hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />

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
          <div className="h-[150px] w-[250px] rounded-lg border-2 border-green-400/60" />
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
