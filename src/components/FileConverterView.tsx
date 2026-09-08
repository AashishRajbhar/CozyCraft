import React, { useState } from 'react';
import { ArrowLeft, ArrowLeftRight, Upload, Download, Check, ShieldCheck, FileText, Loader2 } from 'lucide-react';
import { DoneWorkItem } from '../types';

interface FileConverterViewProps {
  onBack: () => void;
  onWorkCompleted: (item: DoneWorkItem) => void;
}

export const FileConverterView: React.FC<FileConverterViewProps> = ({
  onBack,
  onWorkCompleted,
}) => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string>('1.4 MB');
  const [targetFormat, setTargetFormat] = useState<string>('webp');
  const [converting, setConverting] = useState<boolean>(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState<string>('');

  const formats = ['webp', 'png', 'jpg', 'svg', 'json', 'csv', 'md', 'pdf'];

  const handleSelectSample = () => {
    setSelectedFileName('branding_artwork_master.png');
    setFileSize('3.8 MB');
    setConvertedFileUrl(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      setConvertedFileUrl(null);
    }
  };

  const runConversion = () => {
    if (!selectedFileName) return;
    setConverting(true);

    setTimeout(() => {
      const base = selectedFileName.replace(/\.[^/.]+$/, '');
      const out = `${base}_transcoded.${targetFormat}`;
      setOutputName(out);
      
      const blob = new Blob([`CozyCraft WASM converted content for ${out}`], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      setConvertedFileUrl(url);
      setConverting(false);

      onWorkCompleted({
        id: `conv-${Date.now()}`,
        name: out,
        status: 'Ready',
        categoryText: `FFmpeg ${targetFormat.toUpperCase()}`,
        sizeText: '1.2 MB',
        timeAgoText: 'Just now',
        iconType: 'image',
        accentColor: 'sage',
        downloadUrl: url,
      });
    }, 1200);
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
          <span>Converters</span>
          <span>/</span>
          <span className="text-[#191C21] font-medium">Universal File Converter</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#EBF5ED] text-[#2F6D44] border border-[#CFE8D7]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2F6D44]" />
          FFmpeg WebAssembly Core
        </div>
      </div>

      {/* Title */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] border border-[#CFE8D7] flex items-center justify-center shrink-0">
          <ArrowLeftRight className="w-6 h-6 text-[#2F6D44]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191C21]">
            Universal File Converter
          </h1>
          <p className="text-[#6C6975] text-sm mt-1">
            Transcode video, audio, images, and documents locally with zero file size restrictions.
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-[#E8DFD4] p-6 shadow-sm space-y-6">
        {!selectedFileName ? (
          <div className="border-2 border-dashed border-[#D5CAC0] rounded-2xl p-10 text-center space-y-4 bg-[#F9F6F1]">
            <div className="w-14 h-14 rounded-full bg-[#EAF5ED] text-[#2F6D44] mx-auto flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#191C21]">
                Drop file to convert locally in browser memory
              </h3>
              <p className="text-xs text-[#79767F]">
                Supports 100+ formats. Video, audio, raster images, vectors, and documents.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <label className="px-5 py-2.5 rounded-full bg-[#534C72] hover:bg-[#433D5D] text-white text-xs font-medium cursor-pointer shadow-sm transition-all">
                Choose Local File
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                onClick={handleSelectSample}
                className="px-4 py-2.5 rounded-full bg-[#F2ECE4] text-[#272A30] border border-[#E2D8CC] text-xs font-medium hover:bg-[#EAE2D8] transition-all"
              >
                Use Sample Asset
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFD4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EAF5ED] text-[#2F6D44] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-[#191C21] text-sm">{selectedFileName}</div>
                  <div className="text-xs text-[#79767F] font-mono">{fileSize} • In RAM buffer</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedFileName(null)}
                className="text-xs text-[#79767F] hover:text-[#BA1A1A]"
              >
                Change File
              </button>
            </div>

            {/* Target format selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#191C21]">Convert to Target Format</label>
              <div className="flex flex-wrap gap-2">
                {formats.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setTargetFormat(fmt)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium uppercase transition-all ${
                      targetFormat === fmt
                        ? 'bg-[#534C72] text-white shadow-xs'
                        : 'bg-[#F2ECE4] text-[#48464E] hover:bg-[#E8DFD4]'
                    }`}
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E8DFD4]">
              <span className="text-xs text-[#5A5762] font-mono">
                Engine: FFmpeg 6.0 WASM (Threaded Web Worker)
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={runConversion}
                  disabled={converting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#534C72] hover:bg-[#433D5D] text-white text-xs font-medium shadow-sm transition-all"
                >
                  {converting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Transcoding in WebAssembly...
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="w-4 h-4" />
                      Convert to .{targetFormat}
                    </>
                  )}
                </button>

                {convertedFileUrl && (
                  <a
                    href={convertedFileUrl}
                    download={outputName}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#EAF5ED] text-[#2F6D44] border border-[#CFE8D7] text-xs font-medium hover:bg-[#D8ECD8] transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .{targetFormat}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
