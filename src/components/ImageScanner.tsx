"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2, Tag, UtensilsCrossed } from "lucide-react";
import { ImageScanMode } from "@/types";

interface Props {
  onResult: (data: unknown) => void;
  onError: (msg: string) => void;
  onLoading: (loading: boolean) => void;
  tags: string[];
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const max = 1024;
      const ratio = Math.min(max / img.width, max / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

export default function ImageScanner({ onResult, onError, onLoading, tags }: Props) {
  const [mode, setMode] = useState<ImageScanMode>("ingredients");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const analyzeImage = async (base64: string) => {
    setUploading(true);
    onLoading(true);
    onError("");

    try {
      const res = await fetch("/api/scan-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mode, tags }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze image");
      onResult(data);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
      onLoading(false);
    }
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      onError("Please select an image file");
      return;
    }

    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
      await analyzeImage(compressed);
    } catch {
      onError("Failed to process image");
    }
  }, [mode, tags, analyzeImage, onError]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      onError("Camera access denied. Use file upload instead.");
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    const max = 1024;
    const ratio = Math.min(max / video.videoWidth, max / video.videoHeight, 1);
    canvas.width = video.videoWidth * ratio;
    canvas.height = video.videoHeight * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.8);

    stopCamera();
    setPreview(base64);
    await analyzeImage(base64);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const reset = () => {
    setPreview(null);
    stopCamera();
  };

  return (
    <div className="w-full max-w-lg space-y-3">
      {/* Mode toggle */}
      <div className="flex rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
        <button
          onClick={() => setMode("ingredients")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${
            mode === "ingredients"
              ? "bg-white text-green-700 shadow-sm dark:bg-gray-800 dark:text-green-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          Ingredients Label
        </button>
        <button
          onClick={() => setMode("food")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${
            mode === "food"
              ? "bg-white text-green-700 shadow-sm dark:bg-gray-800 dark:text-green-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <UtensilsCrossed className="h-3.5 w-3.5" />
          Food Item
        </button>
      </div>

      {/* Mode description */}
      <p className="text-center text-xs text-[var(--text-secondary)]">
        {mode === "ingredients"
          ? "Photograph the ingredient label to extract and analyze text"
          : "Photograph a food item (no label needed) for AI identification"}
      </p>

      {/* Camera view */}
      {cameraActive && (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)]">
          <video
            ref={videoRef}
            className="h-64 w-full object-cover sm:h-80"
            playsInline
            muted
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/60 p-4">
            <button
              onClick={captureFrame}
              disabled={uploading}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-gray-100 disabled:opacity-50"
            >
              <div className="h-10 w-10 rounded-full border-4 border-green-600" />
            </button>
            <button
              onClick={stopCamera}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow transition hover:bg-white"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && !cameraActive && (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Captured"
            className="h-64 w-full object-cover sm:h-80"
          />
          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <p className="mt-2 text-sm text-white">Analyzing...</p>
            </div>
          )}
          {!uploading && (
            <button
              onClick={reset}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Action buttons */}
      {!cameraActive && !preview && (
        <div className="flex gap-3">
          <button
            onClick={startCamera}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[var(--bg-secondary)] dark:text-gray-300"
          >
            <Camera className="h-5 w-5" />
            Take Photo
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[var(--bg-secondary)] dark:text-gray-300"
          >
            <Upload className="h-5 w-5" />
            Upload Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
