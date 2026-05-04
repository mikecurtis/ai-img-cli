---
name: ai-img-cli
description: Generate images from text prompts using AI (Gemini) via a CLI tool. Supports stdin prompts, custom output paths, and an extended-thinking mode for higher-quality results.
---

# ai-img-cli

CLI tool that generates images from text prompts using Google Gemini image models via the Vercel AI SDK gateway. Writes the image to a file and prints the output path.

## How It Works

1. Accepts a prompt via `--prompt`/`-p` flag or piped stdin
2. Calls Gemini Flash (fast) or Gemini Pro (thinking/quality) through the AI gateway
3. Writes the returned image to the specified path, or auto-creates a temp file if no output is given
4. Prints the output path and byte count to stdout

## Usage

```bash
ai-img-cli [--prompt <text>] [--output <file>] [--thinking] [--help]
echo "a prompt" | ai-img-cli [-o <file>]
```

**Flags:**

- `--prompt`/`-p` — Text prompt describing the image to generate (required if not using stdin)
- `--output`/`-o` — Output file path; if omitted, a temp file is created automatically
- `--thinking` — Use the higher-quality `gemini-3-pro-image-preview` model instead of `gemini-3.1-flash-image-preview`
- `--help`/`-h` — Print usage and exit

**Examples:**

```bash
# Basic generation, auto temp file output
ai-img-cli -p "a red panda sitting in a cherry blossom tree"

# Save to a specific file
ai-img-cli -p "photorealistic mountain sunrise" -o ~/Desktop/sunrise.png

# Pipe prompt from another command
echo "a cyberpunk city at night" | ai-img-cli -o city.png

# Higher quality output via thinking model
ai-img-cli --thinking -p "intricate watercolor map of a fantasy kingdom" -o map.png
```
