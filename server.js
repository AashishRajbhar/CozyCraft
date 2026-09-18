import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// TTS API endpoint
app.post('/api/tts', (req, res) => {
  const { text, voice = 'en-US-GuyNeural', rate = '+0%', pitch = '+0Hz' } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text parameter is required.' });
  }

  const tempFile = path.join(__dirname, `temp_server_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);
  const pythonProc = spawn('python3', [
    path.join(__dirname, 'tts_service.py'),
    '--text', text.trim(),
    '--voice', voice,
    '--rate', String(rate),
    '--pitch', String(pitch),
    '--out', tempFile
  ]);

  let stderrData = '';
  pythonProc.stderr.on('data', (data) => {
    stderrData += data.toString();
  });

  pythonProc.on('close', (code) => {
    if (code === 0 && fs.existsSync(tempFile) && fs.statSync(tempFile).size > 0) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="tts_${Date.now()}.mp3"`);
      
      const stream = fs.createReadStream(tempFile);
      stream.pipe(res);
      stream.on('end', () => {
        fs.unlink(tempFile, () => {});
      });
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        fs.unlink(tempFile, () => {});
        if (!res.headersSent) {
          res.status(500).json({ error: 'Audio stream failed.' });
        }
      });
    } else {
      console.error('Python synthesis failed:', stderrData);
      if (fs.existsSync(tempFile)) fs.unlink(tempFile, () => {});
      res.status(500).json({ error: 'Edge-TTS synthesis failed.', details: stderrData });
    }
  });
});

app.listen(PORT, () => {
  console.log(`CozyCraft Studio TTS Server running on http://localhost:${PORT}`);
});
