import { generateText, gateway } from 'ai';
import { writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const MODEL = gateway('gemini-3.1-flash-image-preview');

function printUsageAndExit(code: number): never {
  const msg =
    'Usage: ai-img-cli --output <file> [--prompt <text>]\n' +
    '       echo "a prompt" | ai-img-cli --output <file>\n' +
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
    },
    allowPositionals: false,
  });

  if (values.help) printUsageAndExit(0);
  if (!values.output) {
    process.stderr.write('Error: --output <file> is required.\n');
    printUsageAndExit(1);
  }

  const prompt = values.prompt ?? (await readStdin()).trim();
  if (!prompt) {
    process.stderr.write('Error: prompt is required (via --prompt or stdin).\n');
    printUsageAndExit(1);
  }

  const result = await generateText({ model: MODEL, prompt });

  const image = result.files.find((f) => f.mediaType.startsWith('image/'));
  if (!image) {
    process.stderr.write('Error: model returned no image.\n');
    if (result.text) process.stderr.write(`Model text: ${result.text}\n`);
    process.exit(2);
  }

  await writeFile(values.output, image.uint8Array);
  process.stdout.write(`Wrote ${image.uint8Array.byteLength} bytes (${image.mediaType}) to ${values.output}\n`);
}

main().catch((err) => {
  process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
