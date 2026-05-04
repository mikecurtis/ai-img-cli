import { generateText, gateway } from 'ai';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

function printUsageAndExit(code: number): never {
  const msg =
    'Usage: ai-img-cli [--output <file>] [--prompt <text>] [--thinking]\n' +
    '       echo "a prompt" | ai-img-cli\n' +
    '       ai-img-cli -o <file> -p <text>\n';
  process.stderr.write(msg);
  process.exit(code);
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return '';
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  const { values } = parseArgs({
    options: {
      prompt: { type: 'string', short: 'p' },
      output: { type: 'string', short: 'o' },
      help: { type: 'boolean', short: 'h' },
      thinking: { type: 'boolean' },
    },
    allowPositionals: false,
  });

  if (values.help) printUsageAndExit(0);

  const prompt = values.prompt ?? (await readStdin()).trim();
  if (!prompt) {
    process.stderr.write('Error: prompt is required (via --prompt or stdin).\n');
    printUsageAndExit(1);
  }

  const model = gateway(values.thinking ? 'gemini-3-pro-image-preview' : 'gemini-3.1-flash-image-preview');
  const result = await generateText({ model, prompt });

  const image = result.files.find((f) => f.mediaType.startsWith('image/'));
  if (!image) {
    process.stderr.write('Error: model returned no image.\n');
    if (result.text) process.stderr.write(`Model text: ${result.text}\n`);
    process.exit(2);
  }

  let outputPath = values.output;
  if (!outputPath) {
    const ext = image.mediaType.split('/')[1] ?? 'bin';
    const dir = await mkdtemp(join(tmpdir(), 'ai-img-'));
    outputPath = join(dir, `output.${ext}`);
  }

  await writeFile(outputPath, image.uint8Array);
  process.stdout.write(`Wrote ${image.uint8Array.byteLength} bytes (${image.mediaType}) to ${outputPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
