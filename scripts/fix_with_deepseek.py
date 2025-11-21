import os
import json
import requests

# Load DeepSeek API key from .env
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not API_KEY:
    raise Exception("ERROR: Missing DEEPSEEK_API_KEY in .env")

MODEL = "deepseek-chat"

ERRORS_FILE = r"/opt/UberFix/scripts/errors-warnings.txt"

# Read the ESLint report
with open(ERRORS_FILE, "r", encoding="utf-8") as f:
    report = f.read()

SYSTEM_PROMPT = """
You are DeepSeek Fixer — a code-repair AI.
You receive an ESLint error/warning report.
Your job is:

1. Fix ALL parsing errors.
2. Fix unterminated strings, missing braces, missing JSX tags.
3. Fix React hook dependency warnings using useCallback/useMemo.
4. Prefix unused variables with underscore OR remove safely.
5. Do NOT change logic.
6. Do NOT modify API calls.
7. Never rename components.
8. Output ONLY patches in unified diff format.
"""

payload = {
    "model": MODEL,
    "messages": [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": report}
    ],
    "temperature": 0,
    "stream": False
}

response = requests.post(
    "https://api.deepseek.com/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json=payload
)

result = response.json()

PATCH_FILE = "/opt/UberFix/scripts/deepseek_patch.diff"

with open(PATCH_FILE, "w", encoding="utf-8") as f:
    f.write(result["choices"][0]["message"]["content"])

print(f"Patch generated → {PATCH_FILE}")
print("Apply it with:")
print("git apply deepseek_patch.diff")
