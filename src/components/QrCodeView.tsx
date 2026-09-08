import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  QrCode,
  Download,
  Copy,
  Check,
  Sparkles,
  Image as ImageIcon,
  Wifi,
  User,
  Link,
  FileText,
  Sliders,
  ShieldCheck,
  RotateCcw,
  Palette
} from 'lucide-react';
import { DoneWorkItem } from '../types';

interface QrCodeViewProps {
  onBack: () => void;
  onWorkCompleted: (item: DoneWorkItem) => void;
}

type QrInputType = 'text' | 'wifi' | 'vcard' | 'image';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export const QrCodeView: React.FC<QrCodeViewProps> = ({ onBack, onWorkCompleted }) => {
  const [inputType, setInputType] = useState<QrInputType>('text');

  // Input states
  const [textInput, setTextInput] = useState('https://cozycraft.studio');
  const [wifiSsid, setWifiSsid] = useState('CozyCraft_Studio_5G');
  const [wifiPassword, setWifiPassword] = useState('cozyworkspace2026');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  const [vcardName, setVcardName] = useState('Alex Rivera');
  const [vcardOrg, setVcardOrg] = useState('CozyCraft Labs');
  const [vcardPhone, setVcardPhone] = useState('+1 (555) 234-5678');
  const [vcardEmail, setVcardEmail] = useState('alex@cozycraft.studio');

  // Styling & Options
  const [fgColor, setFgColor] = useState('#191C21');
  const [bgColor, setBgColor] = useState('#FAF7F2');
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>('H');
  const [qrSize, setQrSize] = useState<number>(360);
  const [margin, setMargin] = useState<number>(2);

  // Logo / Center Image
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState<number>(22);

  // States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  // Compute payload string
  const getPayload = (): string => {
    if (inputType === 'text') {
      return textInput || 'https://cozycraft.studio';
    }
    if (inputType === 'wifi') {
      return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
    }
    if (inputType === 'vcard') {
      return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardOrg}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
    }
    if (inputType === 'image') {
      return textInput || 'https://cozycraft.studio';
    }
    return 'https://cozycraft.studio';
  };

  // Generate QR Code on canvas
  useEffect(() => {
    const generate = async () => {
      const payload = getPayload();
      if (!payload) return;

      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Render base QR code onto canvas
        await QRCode.toCanvas(canvas, payload, {
          width: qrSize,
          margin: margin,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: errorCorrection,
        });

        // Draw center logo if present
        if (logoImage) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = logoImage;
            await new Promise((resolve) => {
              img.onload = () => {
                const logoSize = (qrSize * logoSizePercent) / 100;
                const x = (qrSize - logoSize) / 2;
                const y = (qrSize - logoSize) / 2;
                const padding = 6;

                // Draw background circle or rounded rect for logo cutout clarity
                ctx.fillStyle = bgColor;
                ctx.beginPath();
                ctx.roundRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2, 8);
                ctx.fill();

                // Draw border around logo cutout
                ctx.strokeStyle = fgColor;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Draw logo
                ctx.drawImage(img, x, y, logoSize, logoSize);
                resolve(true);
              };
              img.onerror = () => resolve(false);
            });
          }
        }

        const dataUrl = canvas.toDataURL('image/png');
        setPreviewDataUrl(dataUrl);
      } catch (err) {
        console.error('QR code generation error:', err);
      }
    };

    generate();
  }, [
    textInput,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    vcardName,
    vcardOrg,
    vcardPhone,
    vcardEmail,
    inputType,
    fgColor,
    bgColor,
    errorCorrection,
    qrSize,
    margin,
    logoImage,
    logoSizePercent,
  ]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
        // Automatically switch error correction to H to preserve scanning when logo is placed
        setErrorCorrection('H');
      };
      reader.readAsDataURL(file);
    }
  };

  // Download PNG
  const handleDownloadPng = () => {
    if (!previewDataUrl) return;
    const a = document.createElement('a');
    a.href = previewDataUrl;
    a.download = `cozycraft_qr_${Date.now()}.png`;
    a.click();

    // Record in RAM buffer
    onWorkCompleted({
      id: `qr-${Date.now()}`,
      name: `qr_code_${inputType}_${Date.now().toString().slice(-4)}.png`,
      status: 'Ready',
      categoryText: 'Vector QR Code',
      sizeText: '150 KB',
      timeAgoText: 'Just now',
      iconType: 'qr',
      accentColor: 'peach',
      hasPreview: true,
      downloadUrl: previewDataUrl,
      previewData: {
        title: 'Generated QR Code',
        type: `QR (${errorCorrection} level)`,
        details: getPayload().slice(0, 80),
      },
    });
  };

  // Download SVG
  const handleDownloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(getPayload(), {
        type: 'svg',
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorCorrection,
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cozycraft_qr_${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate SVG:', err);
    }
  };

  // Copy Image
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob && navigator.clipboard) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        }
      });
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Preset Colors
  const presetPalettes = [
    { fg: '#191C21', bg: '#FAF7F2', label: 'Cozy Classic' },
    { fg: '#534C72', bg: '#EDE9FE', label: 'Lavender Dream' },
    { fg: '#2F6D44', bg: '#EAF5ED', label: 'Sage Garden' },
    { fg: '#A05E32', bg: '#FFEEDA', label: 'Warm Peach' },
    { fg: '#0F172A', bg: '#F8FAFC', label: 'Slate Dark' },
  ];

  return (
    <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-[#E8DFD4] pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#E8DFD4] text-[#48464E] hover:bg-[#F2ECE4] hover:text-[#191C21] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workshop
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#FFEEDA] text-[#A05E32] border border-[#F8D7BE]">
            <QrCode className="w-3.5 h-3.5" />
            Client-Side Vector Engine
          </span>
        </div>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191C21]">
          Text & Image QR Code Studio
        </h1>
        <p className="text-xs sm:text-sm text-[#6C6975] mt-1">
          Generate custom, high-resolution QR codes offline with embedded logos, brand palettes, and instant PNG/SVG exports.
        </p>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Config Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Input Category Selector */}
          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 shadow-sm space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5762]">
              Payload Source
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setInputType('text')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  inputType === 'text'
                    ? 'bg-[#534C72] text-white border-[#534C72]'
                    : 'bg-[#FAF7F2] text-[#48464E] border-[#E8DFD4] hover:bg-[#F2ECE4]'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                Text / URL
              </button>

              <button
                onClick={() => setInputType('wifi')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  inputType === 'wifi'
                    ? 'bg-[#534C72] text-white border-[#534C72]'
                    : 'bg-[#FAF7F2] text-[#48464E] border-[#E8DFD4] hover:bg-[#F2ECE4]'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                Wi-Fi Config
              </button>

              <button
                onClick={() => setInputType('vcard')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  inputType === 'vcard'
                    ? 'bg-[#534C72] text-white border-[#534C72]'
                    : 'bg-[#FAF7F2] text-[#48464E] border-[#E8DFD4] hover:bg-[#F2ECE4]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Contact vCard
              </button>

              <button
                onClick={() => setInputType('image')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  inputType === 'image'
                    ? 'bg-[#534C72] text-white border-[#534C72]'
                    : 'bg-[#FAF7F2] text-[#48464E] border-[#E8DFD4] hover:bg-[#F2ECE4]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Image Link
              </button>
            </div>

            {/* Input Form Fields */}
            <div className="pt-2">
              {inputType === 'text' || inputType === 'image' ? (
                <div>
                  <label className="block text-xs font-semibold text-[#191C21] mb-1">
                    {inputType === 'text' ? 'Web Link or Raw Text' : 'Image URL or Payload Link'}
                  </label>
                  <textarea
                    rows={3}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={
                      inputType === 'text'
                        ? 'https://example.com or paste text...'
                        : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
                    }
                    className="w-full bg-[#FAF7F2] border border-[#E8DFD4] rounded-xl p-3 text-xs sm:text-sm text-[#191C21] focus:outline-none focus:border-[#534C72]"
                  />
                </div>
              ) : inputType === 'wifi' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#191C21] mb-1">
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E8DFD4] rounded-xl p-2.5 text-xs text-[#191C21] focus:outline-none focus:border-[#534C72]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#191C21] mb-1">
                      Password
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E8DFD4] rounded-xl p-2.5 text-xs text-[#191C21] focus:outline-none focus:border-[#534C72]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#191C21] mb-1">
                      Security Encryption
                    </label>
                    <div className="flex items-center gap-3">
                      {(['WPA', 'WEP', 'nopass'] as const).map((enc) => (
                        <label key={enc} className="inline-flex items-center gap-1.5 text-xs text-[#48464E] cursor-pointer">
                          <input
                            type="radio"
                            name="encryption"
                            checked={wifiEncryption === enc}
                            onChange={() => setWifiEncryption(enc)}
                            className="accent-[#534C72]"
                          />
                          {enc === 'nopass' ? 'Open / None' : enc}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#191C21] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={vcardName}
                      onChange={(e) => setVcardName(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E8DFD4] rounded-xl p-2.5 text-xs text-[#191C21] focus:outline-none focus:border-[#534C72]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#191C21] mb-1">
                      Company / Org
                    </label>
                    <input
                      type="text"
                      value={vcardOrg}
                      onChange={(e) => setVcardOrg(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E8DFD4] rounded-xl p-2.5 text-xs text-[#191C21] focus:outline-none focus:border-[#534C72]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#191C21] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E8DFD4] rounded-xl p-2.5 text-xs text-[#191C21] focus:outline-none focus:border-[#534C72]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#191C21] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E8DFD4] rounded-xl p-2.5 text-xs text-[#191C21] focus:outline-none focus:border-[#534C72]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Aesthetic & Logo Customization */}
          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5A5762] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#534C72]" />
                Colors & Logo Overlay
              </label>

              {logoImage && (
                <button
                  onClick={() => setLogoImage(null)}
                  className="text-xs text-[#BA1A1A] hover:underline"
                >
                  Remove Logo
                </button>
              )}
            </div>

            {/* Presets */}
            <div>
              <span className="block text-xs text-[#79767F] mb-2 font-mono">Curated Color Themes:</span>
              <div className="flex flex-wrap gap-2">
                {presetPalettes.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-[#E8DFD4] bg-[#FAF7F2] hover:bg-[#F2ECE4]"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.fg }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.bg }}
                    />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers & Logo Uploader */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#191C21] mb-1">
                  Foreground (Modules)
                </label>
                <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E8DFD4] rounded-xl p-1.5">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono text-[#191C21]">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191C21] mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E8DFD4] rounded-xl p-1.5">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono text-[#191C21]">{bgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191C21] mb-1">
                  Center Logo Image
                </label>
                <label className="flex items-center justify-center gap-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE4] border border-[#E8DFD4] rounded-xl p-2 cursor-pointer text-xs font-semibold text-[#534C72] transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {logoImage ? 'Change Logo' : 'Upload Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Error Correction & Margin Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F2ECE4]">
              <div>
                <label className="block text-xs font-semibold text-[#191C21] mb-1">
                  Error Correction Level
                </label>
                <div className="flex items-center gap-1.5">
                  {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setErrorCorrection(level)}
                      className={`flex-1 py-1 rounded-lg text-xs font-mono border transition-all ${
                        errorCorrection === level
                          ? 'bg-[#534C72] text-white border-[#534C72]'
                          : 'bg-[#FAF7F2] text-[#48464E] border-[#E8DFD4]'
                      }`}
                    >
                      {level} {level === 'H' ? '(High)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {logoImage && (
                <div>
                  <label className="block text-xs font-semibold text-[#191C21] mb-1">
                    Logo Scale ({logoSizePercent}%)
                  </label>
                  <input
                    type="range"
                    min={12}
                    max={28}
                    value={logoSizePercent}
                    onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                    className="w-full accent-[#534C72]"
                  />
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Live Render & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-6 shadow-md flex flex-col items-center justify-center text-center space-y-4 min-h-[380px]">
            
            <div className="text-xs font-mono font-semibold text-[#5A5762] uppercase tracking-wider">
              Live Canvas Preview
            </div>

            {/* Hidden / Render Canvas */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD4] shadow-inner inline-block">
              <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg" />
            </div>

            <p className="text-xs text-[#79767F] max-w-xs font-mono">
              Level {errorCorrection} redundancy • {logoImage ? 'Logo Embedded' : 'Standard Vector'}
            </p>

            {/* Export Action Buttons */}
            <div className="w-full space-y-2 pt-2">
              <button
                onClick={handleDownloadPng}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#534C72] text-white font-semibold text-sm hover:bg-[#433D5E] transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download PNG (1024x1024)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadSvg}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD4] text-[#191C21] font-semibold text-xs hover:bg-[#F2ECE4] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A05E32]" />
                  Download SVG
                </button>

                <button
                  onClick={handleCopyImage}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD4] text-[#191C21] font-semibold text-xs hover:bg-[#F2ECE4] transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#2F6D44]" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#534C72]" />
                      Copy Image
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          <div className="bg-[#EAF5ED] border border-[#CFE8D7] rounded-xl p-3 text-xs text-[#2F6D44] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Client-Side. No QR tracking or remote standard data generation.</span>
          </div>

        </div>

      </div>

    </div>
  );
};
