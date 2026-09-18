import React, { useState } from 'react';
import { ArrowLeft, ArrowLeftRight, Upload, Download, Check, ShieldCheck, FileText, Loader2, Wrench, AlertTriangle } from 'lucide-react';
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

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#FFEEDA] text-[#A05E32] border border-[#F8D7BE]">
          <Wrench className="w-3.5 h-3.5 text-[#A05E32]" />
          Under Construction
        </div>
      </div>

      {/* Under Construction Banner */}
      <div className="p-5 rounded-2xl bg-[#FFEEDA] border border-[#F8D7BE] flex flex-col sm:flex-row items-start sm:items-center gap-4 text-[#A05E32] shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-[#F6DCBE] flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5 text-[#A05E32]" />
        </div>
        <div className="space-y-1">
          <div className="font-bold text-base flex items-center gap-2">
            <span>🚧 Under Construction / Work in Progress</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#A05E32] text-white font-mono">
              Module v2.0
            </span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-[#7C431D]">
            The Universal File Converter tool is currently under active construction. Full FFmpeg WASM video, audio, and document format transcoding pipeline enhancements are being integrated.
          </p>
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

      {/* Card */}
      <div className="bg-white rounded-2xl border border-[#E8DFD4] p-6 sm:p-7 shadow-sm space-y-6">
        {/* Upload Zone */}
        <div className="border-2 border-dashed border-[#E4DBD0] rounded-xl p-8 text-center bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-colors">
          <input
            type="file"
            id="file-input"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF5ED] text-[#2F6D44] flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-[#191C21] text-base">
                Click to select a file or drag & drop here
              </div>
              <div className="text-xs text-[#79767F] mt-1 font-mono">
                Supports Video, Audio, Image, and Document formats (Up to 2GB)
              </div>
            </div>
          </label>

          <div className="mt-4 pt-4 border-t border-[#E8DFD4] flex items-center justify-center gap-2 text-xs">
            <span className="text-[#79767F]">Or try sample:</span>
            <button
              onClick={handleSelectSample}
              className="text-[#534C72] font-semibold hover:underline"
            >
              branding_artwork_master.png
            </button>
          </div>
        </div>

        {/* Selected file details & options */}
        {selectedFileName && (
          <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#E2D8CC] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#534C72]" />
                <div>
                  <div className="font-semibold text-sm text-[#191C21]">
                    {selectedFileName}
                  </div>
                  <div className="text-xs font-mono text-[#79767F]">
                    {fileSize}
                  </div>
                </div>
              </div>

              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EBF5ED] text-[#2F6D44]">
                Ready to Transcode
              </span>
            </div>

            {/* Target format picker */}
            <div className="space-y-2 pt-2 border-t border-[#E8DFD4]">
              <div className="text-xs font-semibold text-[#191C21]">
                Target Export Format
              </div>
              <div className="flex items-center flex-wrap gap-2">
                {formats.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setTargetFormat(fmt)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      targetFormat === fmt
                        ? 'bg-[#534C72] text-white shadow-2xs'
                        : 'bg-white text-[#5A5762] border border-[#E2D8CC] hover:bg-[#F2ECE4]'
                    }`}
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Action button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={runConversion}
                disabled={converting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#534C72] hover:bg-[#433D5D] text-white text-sm font-medium transition-all shadow-2xs disabled:opacity-50"
              >
                {converting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transcoding in WASM...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-4 h-4" />
                    Convert File to .{targetFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Converted result output */}
        {convertedFileUrl && (
          <div className="p-4 rounded-xl bg-[#EBF5ED] border border-[#CFE8D7] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[#2F6D44]" />
              <div>
                <div className="font-semibold text-sm text-[#191C21]">
                  {outputName}
                </div>
                <div className="text-xs font-mono text-[#2F6D44]">
                  Successfully transcoded locally inside browser memory.
                </div>
              </div>
            </div>

            <a
              href={convertedFileUrl}
              download={outputName}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2F6D44] hover:bg-[#255736] text-white text-xs font-medium transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Result
            </a>
          </div>
        )}

      </div>
    </div>
  );
};
