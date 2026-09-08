import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import jsQR from 'jsqr';
import {
  ArrowLeft,
  ScanBarcode,
  Upload,
  Camera,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileText
} from 'lucide-react';
import { DoneWorkItem } from '../types';

interface BarcodeReaderViewProps {
  onBack: () => void;
  onWorkCompleted: (item: DoneWorkItem) => void;
}

interface ScannedRecord {
  id: string;
  text: string;
  formatName: string;
  timestamp: string;
  isUrl: boolean;
}

export const BarcodeReaderView: React.FC<BarcodeReaderViewProps> = ({
  onBack,
  onWorkCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');

  // Scanning & Detection States
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ScannedRecord | null>(null);
  const [scanHistory, setScanHistory] = useState<ScannedRecord[]>([]);

  // Copy state
  const [isCopied, setIsCopied] = useState(false);

  // Camera & Image refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const zxingControlsRef = useRef<any>(null);

  // Helper to test if text is URL
  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  // Add scan result to list & done work
  const handleScanSuccess = (text: string, formatName: string) => {
    if (!text) return;

    const record: ScannedRecord = {
      id: `scan-${Date.now()}`,
      text,
      formatName: formatName || 'Barcode / QR Code',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isUrl: isValidUrl(text),
    };

    setLastResult(record);
    setScanHistory((prev) => [record, ...prev.filter((item) => item.text !== text)]);
    setErrorMessage(null);

    // Save to RAM buffer
    onWorkCompleted({
      id: record.id,
      name: `barcode_${record.formatName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}.txt`,
      status: 'Ready',
      categoryText: 'Barcode Scanned',
      sizeText: `${text.length} B`,
      timeAgoText: 'Just now',
      iconType: 'barcode',
      accentColor: 'lavender',
      hasPreview: true,
      previewData: {
        title: `Scanned ${record.formatName}`,
        type: record.formatName,
        details: text,
      },
    });
  };

  // File Upload Decoder
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = async () => {
        try {
          // 1. Try ZXing Browser reader on Image element
          const codeReader = new BrowserMultiFormatReader();
          const result = await codeReader.decodeFromImageElement(img);

          if (result) {
            handleScanSuccess(result.getText(), result.getBarcodeFormat().toString());
            return;
          }
        } catch (_) {
          // Fall back to canvas & jsQR if ZXing throws on image element
        }

        // 2. Canvas pixel extraction for jsQR & native BarcodeDetector fallback
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Try jsQR
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
          if (qrCode) {
            handleScanSuccess(qrCode.data, 'QR_CODE');
            return;
          }

          // Try native BarcodeDetector if available in browser
          if ('BarcodeDetector' in window) {
            try {
              const detector = new (window as any).BarcodeDetector();
              const detected = await detector.detect(img);
              if (detected && detected.length > 0) {
                handleScanSuccess(detected[0].rawValue, detected[0].format.toUpperCase());
                return;
              }
            } catch (err) {
              console.warn('Native BarcodeDetector error:', err);
            }
          }
        }

        setErrorMessage('No valid barcode or QR code detected in this image. Please ensure the barcode is clear and unblurred.');
      };
    };

    reader.readAsDataURL(file);
  };

  // Camera Reader Control
  const startCameraScanner = async () => {
    setIsScanning(true);
    setErrorMessage(null);

    try {
      const codeReader = new BrowserMultiFormatReader();
      if (!videoRef.current) return;

      const controls = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            handleScanSuccess(result.getText(), result.getBarcodeFormat().toString());
          }
        }
      );

      zxingControlsRef.current = controls;
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMessage('Could not access camera. Please allow camera permissions or upload an image file instead.');
      setIsScanning(false);
    }
  };

  const stopCameraScanner = () => {
    if (zxingControlsRef.current) {
      zxingControlsRef.current.stop();
      zxingControlsRef.current = null;
    }
    setIsScanning(false);
  };

  // Handle Tab Switch
  useEffect(() => {
    if (activeTab === 'camera') {
      startCameraScanner();
    } else {
      stopCameraScanner();
    }
    return () => {
      stopCameraScanner();
    };
  }, [activeTab]);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E8DFD4] pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#E8DFD4] text-[#48464E] hover:bg-[#F2ECE4] hover:text-[#191C21] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workshop
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#EDE9FE] text-[#534C72] border border-[#DDD6FE]">
          <ScanBarcode className="w-3.5 h-3.5" />
          Multi-Format ZXing Decoder
        </span>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191C21]">
          Bar Code & QR Code Reader
        </h1>
        <p className="text-xs sm:text-sm text-[#6C6975] mt-1">
          Scan and decode 1D product barcodes (EAN, UPC, Code 128) and 2D QR codes locally from files or live webcam.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Scanner Box (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Mode Switcher */}
          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-3 shadow-sm flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                activeTab === 'upload'
                  ? 'bg-[#534C72] text-white border-[#534C72]'
                  : 'bg-[#FAF7F2] text-[#48464E] border-[#E8DFD4] hover:bg-[#F2ECE4]'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload Image File
            </button>

            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                activeTab === 'camera'
                  ? 'bg-[#534C72] text-white border-[#534C72]'
                  : 'bg-[#FAF7F2] text-[#48464E] border-[#E8DFD4] hover:bg-[#F2ECE4]'
              }`}
            >
              <Camera className="w-4 h-4" />
              Live Camera Feed
            </button>
          </div>

          {/* Scanner Viewport */}
          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-6 shadow-md min-h-[340px] flex flex-col items-center justify-center relative overflow-hidden">
            
            {activeTab === 'upload' ? (
              <label className="w-full h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#E2D8CC] rounded-2xl hover:border-[#534C72] hover:bg-[#FAF7F2] transition-all cursor-pointer text-center group">
                <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] text-[#534C72] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>

                <div className="font-bold text-sm text-[#191C21]">
                  Click or drag barcode image here
                </div>
                <p className="text-xs text-[#79767F] mt-1 max-w-xs leading-relaxed">
                  Supports PNG, JPG, WEBP, GIF files containing EAN-13, EAN-8, CODE-128, CODE-39, UPC, or QR Codes.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="w-full flex flex-col items-center justify-center space-y-3">
                <div className="relative w-full max-w-md aspect-4/3 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-[#E8DFD4]">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />

                  {/* Scanning Laser Animation Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-48 h-48 border-2 border-[#3EA25E] rounded-xl relative shadow-[0_0_15px_rgba(62,162,94,0.4)]">
                      <div className="w-full h-0.5 bg-[#3EA25E] absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_8px_#3EA25E]" />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#79767F] font-mono">
                  Hold barcode or QR code steady in front of camera
                </p>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="mt-4 w-full p-3 rounded-xl bg-[#FFDAD6]/60 border border-[#FFB4AB] text-[#BA1A1A] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Privacy Note */}
          <div className="bg-[#EAF5ED] border border-[#CFE8D7] rounded-xl p-3 text-xs text-[#2F6D44] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Zero Cloud Transfers. Camera feed & images stay exclusively inside your browser memory.</span>
          </div>

        </div>

        {/* Right Result & History Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Latest Decoded Card */}
          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-3">
              <h2 className="font-bold text-sm text-[#191C21] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A05E32]" />
                Latest Decoded Result
              </h2>
              {lastResult && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#534C72] font-semibold">
                  {lastResult.formatName}
                </span>
              )}
            </div>

            {lastResult ? (
              <div className="space-y-3">
                <div className="bg-[#FAF7F2] border border-[#E8DFD4] rounded-xl p-3.5 text-xs font-mono break-all text-[#191C21] leading-relaxed max-h-36 overflow-y-auto">
                  {lastResult.text}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(lastResult.text)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#534C72] text-white font-semibold text-xs hover:bg-[#433D5E] transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied to Clipboard
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Text
                      </>
                    )}
                  </button>

                  {lastResult.isUrl && (
                    <a
                      href={lastResult.text}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD4] text-[#191C21] font-semibold text-xs hover:bg-[#F2ECE4] transition-colors"
                    >
                      Open Link
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-[#79767F] font-mono">
                No barcode scanned yet. Upload an image or use camera to decode.
              </div>
            )}
          </div>

          {/* Session History Log */}
          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-[#5A5762] uppercase tracking-wider">
                Session Scan History ({scanHistory.length})
              </h3>
              {scanHistory.length > 0 && (
                <button
                  onClick={() => setScanHistory([])}
                  className="text-xs text-[#BA1A1A] hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {scanHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#79767F] font-mono">
                History is empty.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-[#F2ECE4]">
                {scanHistory.map((item) => (
                  <div key={item.id} className="pt-2 pb-1 flex items-start justify-between gap-2">
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F2ECE4] text-[#5A5762]">
                          {item.formatName}
                        </span>
                        <span className="text-[10px] text-[#79767F] font-mono">{item.timestamp}</span>
                      </div>
                      <div className="text-xs text-[#191C21] font-mono truncate max-w-[200px]">
                        {item.text}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyText(item.text)}
                      className="p-1 text-[#79767F] hover:text-[#534C72] rounded"
                      title="Copy value"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
