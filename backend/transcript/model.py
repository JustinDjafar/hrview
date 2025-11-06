import os
import json
import base64
import requests
import asyncio
import subprocess
import tempfile
from typing import Dict, Any

# === Configuration ===
KOBOLD_API_BASE = os.getenv("KOBOLD_API_BASE", "http://pe.spil.co.id/kobold").rstrip("/")
KOBOLD_API_KEY = os.getenv("KOBOLD_API_KEY", "")

def extract_audio_from_video(video_path: str) -> str:
    """Extract audio as WAV from a video using ffmpeg."""
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")

    temp_wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
    print(f"🎞️ Extracting audio from video → {temp_wav}")

    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-vn",  
        "-acodec", "pcm_s16le",  
        "-ar", "16000",  
        "-ac", "1", 
        temp_wav
    ]

    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ Audio extraction successful")
        return temp_wav
    except subprocess.CalledProcessError:
        raise RuntimeError("Failed to extract audio using ffmpeg. Make sure ffmpeg is installed.")


def _call_kobold_extra_transcribe(audio_path: str):
    """Send the extracted WAV audio file to the Kobold /api/extra/transcribe endpoint."""
    url = f"{KOBOLD_API_BASE}/api/extra/transcribe"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {KOBOLD_API_KEY}"
    } if KOBOLD_API_KEY else {"Content-Type": "application/json"}

    print(f"🎤 Sending transcription request to: {url}")
    print(f"Audio file: {audio_path}")

    with open(audio_path, "rb") as f:
        audio_base64 = base64.b64encode(f.read()).decode("utf-8")

    payload = {
        "audio_data": f"data:audio/wav;base64,{audio_base64}",
        "langcode": "auto",
        "prompt": "",
        "suppress_non_speech": False
    }

    r = requests.post(url, headers=headers, data=json.dumps(payload), timeout=300)
    print(f"Response status: {r.status_code}")
    print(f"Response text: {r.text}")

    r.raise_for_status()
    return r.json()


async def get_transcript_from_audio(audio_path: str) -> Dict[str, Any]:
    """Extract audio then get transcript from a video file using the Kobold API."""
    try:
        wav_path = extract_audio_from_video(audio_path)
        result = _call_kobold_extra_transcribe(wav_path)

        text = result.get("text") or result.get("transcription") or ""
        status = "success" if text else "empty"

        # Cleanup
        if os.path.exists(wav_path):
            os.remove(wav_path)

        return {"text": text, "status": status}
    except Exception as e:
        return {"text": "", "status": "error", "reason": str(e)}
