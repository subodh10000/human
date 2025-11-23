# Quick Setup Guide

Follow these steps to get the AI Text Humanizer up and running with Claude API integration.

## Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Anthropic API Key** (optional but recommended) - [Get it here](https://console.anthropic.com/)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- Express (web server)
- Anthropic SDK (Claude API)
- CORS, body-parser (middleware)
- dotenv (environment variables)

### 2. Configure Claude API (Recommended)

#### Option A: Using the example file

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your favorite text editor
nano .env   # or vim, code, etc.
```

#### Option B: Create .env manually

Create a file named `.env` in the project root with:

```env
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-sonnet-4-5-20250929
PORT=3000
ENABLE_FALLBACK=true
```

#### Getting your API key:

1. Visit [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Go to **API Keys** section
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-...`)
6. Paste it in your `.env` file

**Important:** Never share your API key or commit it to git!

### 3. Start the Server

```bash
npm start
```

You should see:

```
✅ Claude API initialized successfully
╔════════════════════════════════════════════════════════════╗
║          AI Text Humanizer Server                          ║
║          Server running on: http://localhost:3000          ║
╚════════════════════════════════════════════════════════════╝
```

### 4. Open the Application

Open your browser and go to:

```
http://localhost:3000
```

## Verification

### Test Without API Key

If you see:
```
⚠️  No ANTHROPIC_API_KEY found - using pattern-based detection only
```

The app will still work, but use less accurate pattern-based detection.

### Test With API Key

If you see:
```
✅ Claude API initialized successfully
```

Congratulations! You have full Claude API integration for maximum accuracy.

## Common Issues

### "Cannot find module 'express'"

**Solution:** Run `npm install` again

### "Invalid API key"

**Solutions:**
- Check that your API key starts with `sk-ant-`
- Verify there are no extra spaces in `.env`
- Make sure you copied the entire key
- Check your key is active at console.anthropic.com

### "Port 3000 already in use"

**Solution:** Change the port in `.env`:
```env
PORT=3001
```

### "ENOENT: no such file or directory, open '.env'"

**Solution:** Create the `.env` file:
```bash
cp .env.example .env
```

## Testing the Application

### Test Detection

1. Paste AI-generated text into the input box
2. Click "Detect Only"
3. You should see a confidence score

### Test Conversion

1. Paste AI-generated text
2. Adjust intensity slider (try 7)
3. Click "Convert to Human"
4. Compare before/after scores

### Example AI Text for Testing

```
In today's digital age, it is important to note that leveraging cutting-edge technology can revolutionize the way businesses operate. Furthermore, implementing robust solutions enables organizations to streamline their processes and enhance productivity. Moreover, this paradigm shift has been a game-changer for the industry.
```

## Development Mode

For auto-reload during development:

```bash
npm run dev
```

This uses `nodemon` to restart the server when files change.

## Model Selection

You can choose different Claude models in `.env`:

```env
# Recommended - Best balance
CLAUDE_MODEL=claude-sonnet-4-5-20250929

# Highest quality (slower, more expensive)
CLAUDE_MODEL=claude-opus-4-1-20250805

# Fastest (good quality, cheaper)
CLAUDE_MODEL=claude-haiku-4-5-20251001
```

## Cost Considerations

Claude API pricing (as of 2025):
- **Sonnet 4.5**: ~$3 per million input tokens, ~$15 per million output tokens
- **Haiku**: Cheaper, faster
- **Opus**: More expensive, highest quality

For typical use (500-word texts):
- Detection: ~$0.001-0.003 per request
- Conversion: ~$0.003-0.008 per request

Monitor usage at: [https://console.anthropic.com/](https://console.anthropic.com/)

## Next Steps

1. ✅ Bookmark the application
2. ✅ Try different intensity levels
3. ✅ Test with various text types
4. ✅ Share with colleagues!

## Support

- Issues: [GitHub Issues](https://github.com/subodh10000/human/issues)
- Documentation: See `README.md`
- API Docs: [Anthropic Documentation](https://docs.anthropic.com/)

---

**Happy Humanizing!** 🎉
