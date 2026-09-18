#!/usr/bin/env python3
import sys
import os
import json
import argparse
import asyncio
import edge_tts

async def synthesize(text, voice="en-US-GuyNeural", rate="+0%", pitch="+0Hz", output_path=None):
    if not text or not text.strip():
        raise ValueError("Text parameter cannot be empty.")
    
    # Sanitize pitch & rate formats for edge-tts
    # edge-tts expects rate like '+0%' or '-10%' or '+20%'
    # pitch like '+0Hz' or '+10Hz' or '-10Hz'
    if isinstance(rate, (int, float)):
        rate = f"{'+' if rate >= 0 else ''}{int(rate)}%"
    if isinstance(pitch, (int, float)):
        pitch = f"{'+' if pitch >= 0 else ''}{int(pitch)}Hz"

    communicate = edge_tts.Communicate(text.strip(), voice, rate=rate, pitch=pitch)
    
    if output_path and output_path != "-":
        await communicate.save(output_path)
        return output_path
    else:
        # Save to temp file and read bytes
        temp_out = f"temp_tts_{os.getpid()}.mp3"
        try:
            await communicate.save(temp_out)
            with open(temp_out, "rb") as f:
                data = f.read()
            sys.stdout.buffer.write(data)
            sys.stdout.buffer.flush()
        finally:
            if os.path.exists(temp_out):
                os.remove(temp_out)
        return None

def main():
    parser = argparse.ArgumentParser(description="Edge-TTS Python Service")
    parser.add_argument("--text", type=str, help="Text to synthesize")
    parser.add_argument("--voice", type=str, default="en-US-GuyNeural", help="Voice ID")
    parser.add_argument("--rate", type=str, default="+0%", help="Speed rate (e.g. +0%, -10%, +20%)")
    parser.add_argument("--pitch", type=str, default="+0Hz", help="Pitch offset (e.g. +0Hz, +5Hz, -5Hz)")
    parser.add_argument("--out", type=str, default=None, help="Output MP3 path or - for stdout")
    parser.add_argument("--json-stdin", action="store_true", help="Read arguments as JSON from stdin")

    args = parser.parse_args()

    text = args.text
    voice = args.voice
    rate = args.rate
    pitch = args.pitch
    out = args.out

    if args.json_stdin:
        input_raw = sys.stdin.read()
        if input_raw.strip():
            data = json.loads(input_raw)
            text = data.get("text", text)
            voice = data.get("voice", voice)
            rate = data.get("rate", rate)
            pitch = data.get("pitch", pitch)
            out = data.get("out", out)

    if not text:
        sys.stderr.write("Error: Missing text input.\n")
        sys.exit(1)

    try:
        asyncio.run(synthesize(text, voice, rate, pitch, out))
    except Exception as e:
        sys.stderr.write(f"Synthesis error: {str(e)}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
