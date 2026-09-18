import asyncio
import edge_tts
import subprocess
import os
import sys

VOICE = sys.argv[1] if len(sys.argv) > 1 else "en-US-GuyNeural"
TEXT_FILE = sys.argv[2] if len(sys.argv) > 2 else "story1.txt"
OUTPUT = sys.argv[3] if len(sys.argv) > 3 else "output.mp3"

if not os.path.exists(TEXT_FILE):
    print(f"Error: {TEXT_FILE} not found.")
    sys.exit(1)

with open(TEXT_FILE, "r", encoding="utf-8") as f:
    TEXT = f.read().strip()

if not TEXT:
    raise ValueError("Text file is empty!")

async def main():
    print(f"Synthesizing using voice: {VOICE}...")
    communicate = edge_tts.Communicate(TEXT, VOICE)
    await communicate.save(OUTPUT)
    print(f"Audio successfully saved to {OUTPUT}")

if __name__ == "__main__":
    asyncio.run(main())

    if os.path.exists(OUTPUT) and os.path.getsize(OUTPUT) > 0:
        print(f"Playing {OUTPUT} using afplay...")
        subprocess.run(["afplay", OUTPUT])
    else:
        print("Failed to generate audio file.")
