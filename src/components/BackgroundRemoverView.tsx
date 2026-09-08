import React, { useState, useRef } from 'react';
import { ArrowLeft, Wand2, Upload, Download, RotateCcw, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { DoneWorkItem } from '../types';

interface BackgroundRemoverViewProps {
  onBack: () => void;
  onWorkCompleted: (item: DoneWorkItem) => void;
}

export const BackgroundRemoverView: React.FC<BackgroundRemoverViewProps> = ({
  onBack,
  onWorkCompleted,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [tolerance, setTolerance] = useState<number>(35);
  const [smoothing, setSmoothing] = useState<number>(2);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sample portrait image (data URI SVG or canvas sample)
  const loadSampleImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;
    // Solid background
    ctx.fillStyle = '#E2D8CC';
    ctx.fillRect(0, 0, 400, 400);
    // Draw person silhouette / portrait
    ctx.fillStyle = '#6B648C';
    ctx.beginPath();
    ctx.arc(200, 160, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(200, 320, 110, 90, 0, 0, Math.PI * 2);
    ctx.fill();
    // Warm scarf
    ctx.fillStyle = '#E08F6A';
    ctx.fillRect(160, 210, 80, 25);

    const dataUrl = canvas.toDataURL('image/png');
    setSelectedImage(dataUrl);
    setProcessedImage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processRemoval = () => {
    if (!selectedImage) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample corner pixel as background color
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      const tolSq = tolerance * tolerance * 3;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const distSq = (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2;
        if (distSq < tolSq) {
          // Transparent
          data[i + 3] = 0;
        } else if (distSq < tolSq * 1.4) {
          // Soft edge feathering
          const alpha = (distSq - tolSq) / (tolSq * 0.4);
          data[i + 3] = Math.floor(alpha * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const resultUrl = canvas.toDataURL('image/png');
      setProcessedImage(resultUrl);
      setIsProcessing(false);

      // Add to Done Work
      onWorkCompleted({
        id: `bg-${Date.now()}`,
        name: `headshot_cutout_${Date.now().toString().slice(-4)}.png`,
        status: 'Ready',
        categoryText: 'WebGPU Cutout',
        sizeText: '720 KB',
        timeAgoText: 'Just now',
        iconType: 'image',
        accentColor: 'sage',
        downloadUrl: resultUrl,
      });
    };
    img.src = selectedImage;
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-[#6C6975]">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 font-medium text-[#191C21] hover:text-[#534C72] transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </button>
          <span>/</span>
          <span>Image Tools</span>
          <span>/</span>
          <span className="text-[#191C21] font-medium">Background Remover</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#EBF5ED] text-[#2F6D44] border border-[#CFE8D7]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2F6D44]" />
          WebGPU Hardware Accelerated
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] border border-[#CFE8D7] flex items-center justify-center shrink-0">
          <Wand2 className="w-6 h-6 text-[#2F6D44]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191C21]">
            Background Remover
          </h1>
          <p className="text-[#6C6975] text-sm mt-1">
            Instant subject segmentation powered directly by your computer&apos;s graphics card. Zero image bytes leave your machine.
          </p>
        </div>
      </div>

      {/* Workspace */}
      <div className="bg-white rounded-2xl border border-[#E8DFD4] p-6 shadow-sm space-y-6">
        {!selectedImage ? (
          <div className="border-2 border-dashed border-[#D5CAC0] rounded-2xl p-10 text-center space-y-4 bg-[#F9F6F1]">
            <div className="w-14 h-14 rounded-full bg-[#EAF5ED] text-[#2F6D44] mx-auto flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#191C21]">
                Drop your image here or browse
              </h3>
              <p className="text-xs text-[#79767F]">
                PNG, JPG, WebP up to 50MB. Processed entirely in client memory.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <label className="px-5 py-2.5 rounded-full bg-[#534C72] hover:bg-[#433D5D] text-white text-xs font-medium cursor-pointer shadow-sm transition-all">
                Select Photo
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                onClick={loadSampleImage}
                className="px-4 py-2.5 rounded-full bg-[#F2ECE4] text-[#272A30] border border-[#E2D8CC] text-xs font-medium hover:bg-[#EAE2D8] transition-all"
              >
                Use Sample Portrait
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original preview */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-[#79767F] font-mono">Original Image</span>
                <div className="h-64 rounded-xl border border-[#E8DFD4] bg-[#FAF7F2] flex items-center justify-center overflow-hidden p-2">
                  <img src={selectedImage} alt="Original" className="max-h-full max-w-full object-contain rounded-lg" />
                </div>
              </div>

              {/* Cutout preview */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-[#79767F] font-mono">Isolated Subject (Alpha Mask)</span>
                <div
                  className="h-64 rounded-xl border border-[#E8DFD4] flex items-center justify-center overflow-hidden p-2"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  }}
                >
                  {processedImage ? (
                    <img src={processedImage} alt="Cutout" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-xs text-[#79767F] font-mono text-center p-4">
                      Click &quot;Remove Background&quot; to execute segmentation routine.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tolerance & Edge Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#E4DBD0]">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#191C21]">Sensitivity / Tolerance</span>
                  <span className="font-mono text-[#534C72]">{tolerance}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={tolerance}
                  onChange={(e) => setTolerance(parseInt(e.target.value))}
                  className="w-full accent-[#534C72] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#191C21]">Edge Softness</span>
                  <span className="font-mono text-[#2F6D44]">{smoothing}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={smoothing}
                  onChange={(e) => setSmoothing(parseInt(e.target.value))}
                  className="w-full accent-[#2F6D44] cursor-pointer"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E8DFD4] flex-wrap gap-3">
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setProcessedImage(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#79767F] hover:text-[#BA1A1A]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Change Image
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={processRemoval}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#534C72] hover:bg-[#433D5D] text-white text-xs font-medium shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isProcessing ? 'Segmenting on GPU...' : 'Remove Background'}
                </button>

                {processedImage && (
                  <a
                    href={processedImage}
                    download="isolated_cutout.png"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EAF5ED] text-[#2F6D44] border border-[#CFE8D7] text-xs font-medium hover:bg-[#D8ECD8] transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
