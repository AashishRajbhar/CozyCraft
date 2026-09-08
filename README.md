# CozyCraft Studio 🎨✨

> **Your calm, private digital workshop.**  
> Instant, client-side tools running in local WebAssembly and browser memory. **Zero server uploads — 100% private.**

---

## 🌟 Overview

**CozyCraft Studio** is a privacy-first, on-device web utility suite built with modern web technologies. All media, audio synthesis, file transcoding, image processing, and code scanning occur **exclusively inside your browser**. No files or personal data ever touch a remote server.

---

## 🛠️ Included Offline Tools

### 1. 🎙️ Text to Voice Studio
- **What it does**: Synthesizes natural speech offline using neural WASM audio engines.
- **Key Features**:
  - Choose between curated personas (*Ember*, *Hazel*, *River*, *Nova*).
  - Fine-tune speech pitch, cadence, and whisper attributes.
  - Export uncompressed `.wav` or compressed `.mp3` audio clips.

### 2. 🔄 Universal File Converter
- **What it does**: Transcodes audio, video, and documents locally without file size restrictions.
- **Key Features**:
  - Powered by client-side FFmpeg WebAssembly.
  - Supports 100+ format conversions (MP4, MP3, WEBM, WAV, PNG, JPEG, SVG, PDF, etc.).
  - Preserves metadata and file quality with zero cloud queues.

### 3. 🪄 Background Remover
- **What it does**: Instantly segments image subjects and removes backgrounds directly using your computer's GPU.
- **Key Features**:
  - Fast WebGPU / Canvas cutout processing.
  - High-precision edge detection for portraits, products, and graphic assets.
  - Download isolated transparent `.png` files.

### 4. 🔳 Text & Image QR Code Generator
- **What it does**: Generates customizable, high-resolution vector and raster QR codes offline.
- **Key Features**:
  - Encode Web Links, Plain Text, Wi-Fi Network Credentials, or vCard Contact Cards.
  - Embed custom brand logo images at the center with `Level H` error correction redundancy.
  - Customizable foreground/background color palettes.
  - Instant **PNG** (1024x1024), **SVG** vector download, or Copy to Clipboard.

### 5. 🔍 Bar Code & QR Code Reader
- **What it does**: Decodes 1D product barcodes and 2D QR codes locally from uploaded images or live camera stream.
- **Key Features**:
  - **Dual Mode**: Upload image files (PNG/JPG/WEBP) or stream live from your webcam.
  - Decodes 1D formats (EAN-13, EAN-8, CODE 128, CODE 39, UPC-A, UPC-E) and 2D QR codes via `@zxing/browser` and `jsqr`.
  - Copy decoded values, open web links directly, and inspect session scan logs.

---

## ⚡ Additional Features

- **⌘K Command Palette**: Press `⌘ + K` (or `Ctrl + K`) anywhere to search and launch tools instantly.
- **Favorites & Starred Routines**: Pin your most used tools for one-click access.
- **RAM Session Activity Log**: Track processed files stored in local volatile browser memory with option to clear RAM anytime.

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### Step 1: Clone or Navigate to Project
```bash
cd cozycraft-studio
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

To preview the built production output locally:

```bash
npm run preview
```

---

## 🌐 Deploying Online

Because CozyCraft Studio is **100% client-side**, the generated `dist` folder can be hosted on any static hosting platform:

- **Vercel**: `npx vercel`
- **Netlify**: Drag & drop the `dist/` directory onto Netlify Drop.
- **GitHub Pages**: Push the `dist/` branch or configure GitHub Actions.
- **Firebase Hosting**: `firebase deploy --only hosting`

---

## 🧰 Built With

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **QR & Barcode Processing**: `qrcode`, `@zxing/browser`, `jsqr`
- **Client-Side WASM**: WebAssembly / WebGPU
