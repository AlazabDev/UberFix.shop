#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import requests

ROOT = "/opt/UberFix"
ERROR_FILE = f"{ROOT}/scripts/errors-warnings.txt"
PATCH_OUTPUT = f"{ROOT}/scripts/deepseek_patch.diff"

API_KEY = os.getenv("DEEPSEEK_API_KEY")
MODEL = "deepseek-coder"

if not API_KEY:
    print("ERROR: Missing DEEPSEEK_API_KEY in environment.")
    exit(1)

# -------------------------------------------------------
# Load errors/warnings
# -------------------------------------------------------
if not os.path.exists(ERROR_FILE):
    print("ERROR: errors-warnings.txt not found.")
    exit(1)

with open(ERROR_FILE, "r", encoding="utf-8") as f:
    ERRORS = f.read().strip()


# -------------------------------------------------------
# Collect affected source files ONLY
# -------------------------------------------------------
def extract_paths(text: str):
    paths = set()
    for line in text.splitlines():
        if line.startswith("/opt/UberFix/src"):
            # أول عنصر في السطر هو المسار
            parts = line.split()
            if not parts:
                continue
            path = parts[0]
            if os.path.exists(path):
                paths.add(path)
    return sorted(paths)


AFFECTED_FILES = extract_paths(ERRORS)

if not AFFECTED_FILES:
    print("No affected files detected.")
    exit(0)

print(f"Detected {len(AFFECTED_FILES)} affected files.")


# -------------------------------------------------------
# Build the DeepSeek prompt
# -------------------------------------------------------
prompt_header = """
You are DeepSeek Fix-Engine.

TASK:
Generate a single unified diff patch fixing ONLY the errors and warnings listed.

RULES:
- Fix only the mentioned problems.
- Do not alter business logic.
- Do not remove or rename components, functions, or exports.
- For unused variables: prefix with "_" or remove.
- For parsing errors: fix malformed JSX, unterminated strings, missing '}}', missing tags.
- Keep imports exactly as they are.
- Your output MUST be ONLY the diff.

ERROR REPORT:
"""

prompt = prompt_header + ERRORS + "\n\nAFFECTED FILES CONTENT:\n"

for file_path in AFFECTED_FILES:
    try:
        with open(file_path, "r", encoding="utf-8") as src:
            content = src.read()
        prompt += "\n### FILE: {}\n```\n{}\n```".format(file_path, content)
    except Exception as e:
        print(f"Failed to read file {file_path}: {e}")

# -------------------------------------------------------
# DeepSeek API Request
# -------------------------------------------------------
url = "https://api.deepseek.com/v1/chat/completions"

payload = {
    "model": MODEL,
    "messages": [
        {"role": "system", "content": "You are a strict code repair engine."},
        {"role": "user", "content": prompt},
    ],
    "temperature": 0,
    "max_tokens": 40000,
}

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

print("Sending request to DeepSeek…")

response = requests.post(url, json=payload, headers=headers, timeout=300)

if response.status_code != 200:
    print("DeepSeek API ERROR:", response.text)
    exit(1)

result = response.json()

try:
    completion = result["choices"][0]["message"]["content"]
except (KeyError, IndexError) as e:
    print("Invalid DeepSeek response structure:", e)
    print(json.dumps(result, indent=2))
    exit(1)

# إزالة حواجز ``` إن وُجدت
completion = completion.strip()
if completion.startswith("```"):
    # يمكن أن يكون ```diff أو ```patch أو بدون لغة
    lines = completion.splitlines()
    # حذف أول وآخر سطر من الـ fence
    if len(lines) >= 3:
        completion = "\n".join(lines[1:-1]).strip()

# -------------------------------------------------------
# Save patch
# -------------------------------------------------------
os.makedirs(os.path.dirname(PATCH_OUTPUT), exist_ok=True)

with open(PATCH_OUTPUT, "w", encoding="utf-8") as f:
    f.write(completion)

print("\nPATCH SAVED →", PATCH_OUTPUT)
print("\nApply patch using:")
print("  git apply deepseek_patch.diff")
