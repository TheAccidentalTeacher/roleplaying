// Quick test: verify Claude API key + model name
const path = require('path');
const fs = require('fs');
// Load .env manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}
const Anthropic = require('@anthropic-ai/sdk');

async function test() {
  const key = process.env.ANTHROPIC_API_KEY;
  console.log('API key present:', !!key);
  console.log('API key prefix:', key ? key.substring(0, 12) + '...' : 'MISSING');
  
  const client = new Anthropic({ apiKey: key });

  // Test claude-sonnet-4-6
  const modelsToTry = [
    'claude-sonnet-4-6',
    'claude-sonnet-4-20250514',
    'claude-3-5-sonnet-latest',
    'claude-3-5-sonnet-20241022',
    'claude-sonnet-4-20250514',
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`\nTrying model: ${model}...`);
      const response = await client.messages.create({
        model,
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Reply with exactly: {"ok":true}' }],
      });
      const text = response.content[0]?.text || '';
      console.log(`  SUCCESS: ${text.substring(0, 80)}`);
    } catch (err) {
      console.log(`  FAILED: ${err.message.substring(0, 120)}`);
    }
  }
}

test().catch(console.error);
