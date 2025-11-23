# AI Text Humanizer

A powerful web application that detects AI-written text and converts it to natural, human-like writing with up to 98% humanization accuracy.

## Features

- **AI Text Detection**: Advanced multi-factor analysis to identify AI-generated content
  - Analyzes sentence structure and patterns
  - Detects common AI phrases and vocabulary
  - Evaluates formality and coherence
  - Checks for repetition patterns

- **AI to Human Conversion**: Sophisticated text transformation
  - Replaces formal phrases with casual alternatives
  - Adds natural contractions and colloquialisms
  - Varies sentence structure for authenticity
  - Introduces subtle imperfections
  - Breaks up long, complex sentences
  - Adds personal touches and filler words

- **Adjustable Intensity**: Control the level of humanization (1-10)
  - Lower values: Minimal changes, maintains formality
  - Higher values: More casual, conversational tone

- **Real-time Analysis**: See before and after detection scores
- **Clean, Modern UI**: Beautiful, responsive design
- **Copy to Clipboard**: One-click copy of converted text

## Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: RESTful endpoints for detection and conversion

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd human
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Development Mode

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### POST /api/detect
Analyzes text for AI-generated patterns.

**Request:**
```json
{
  "text": "Your text to analyze"
}
```

**Response:**
```json
{
  "success": true,
  "isAI": true,
  "confidence": 85,
  "score": 85.5,
  "details": {
    "phraseScore": 75,
    "structureScore": 80,
    "vocabularyScore": 90,
    "formalityScore": 85,
    "coherenceScore": 80,
    "repetitionScore": 70
  },
  "analysis": "High usage of common AI phrases detected. Consistent sentence structure pattern identified."
}
```

### POST /api/convert
Converts AI-generated text to human-like text.

**Request:**
```json
{
  "text": "Your AI text to convert",
  "intensity": 7
}
```

**Response:**
```json
{
  "success": true,
  "original": "Original text",
  "converted": "Converted text",
  "changes": 15,
  "humanization": 96.5
}
```

### POST /api/process
Combined detection and conversion in one call.

**Request:**
```json
{
  "text": "Your text",
  "intensity": 7
}
```

**Response:**
```json
{
  "success": true,
  "original": {
    "text": "Original text",
    "detection": { ... }
  },
  "converted": {
    "text": "Converted text",
    "detection": { ... },
    "changes": 15,
    "humanization": 96.5
  },
  "improvement": {
    "confidenceReduction": 45,
    "humanizationScore": 96.5
  }
}
```

## How It Works

### Detection Algorithm

The AI detection system uses a multi-factor analysis approach:

1. **Phrase Analysis**: Identifies common AI phrases and patterns
2. **Sentence Structure**: Analyzes consistency and complexity
3. **Vocabulary Analysis**: Evaluates word diversity and formality
4. **Formality Score**: Checks for contractions and formal transitions
5. **Coherence Analysis**: Examines logical flow and structure
6. **Repetition Detection**: Identifies repetitive patterns

Each factor is weighted and combined to produce a confidence score (0-100%).

### Conversion Algorithm

The humanization process applies multiple transformations:

1. **Phrase Replacement**: Swaps formal phrases for casual alternatives
2. **Contraction Addition**: Adds natural contractions (it's, don't, etc.)
3. **Structure Variation**: Varies sentence beginnings and patterns
4. **Natural Imperfections**: Combines sentences with conjunctions
5. **Sentence Breaking**: Splits overly long sentences
6. **Filler Words**: Adds casual phrases (you know, basically, etc.)
7. **Personal Touches**: Introduces conversational elements

## Usage Tips

1. **Input Length**: For best results, use text with at least 50 characters
2. **Intensity Setting**:
   - 1-3: Minimal changes (professional contexts)
   - 4-6: Moderate humanization (balanced approach)
   - 7-10: Maximum casualness (very natural, conversational)
3. **Review Output**: Always review the converted text to ensure it maintains your intended meaning
4. **Multiple Passes**: For heavily AI-generated text, you may want to run conversion multiple times with different intensity levels

## Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Convert text
- **Escape**: Clear all fields

## Project Structure

```
human/
├── public/
│   ├── index.html      # Frontend interface
│   ├── style.css       # Styling
│   └── app.js          # Frontend logic
├── detector.js         # AI detection module
├── converter.js        # Text conversion module
├── server.js           # Express server
├── package.json        # Dependencies
└── README.md           # Documentation
```

## Limitations

- Maximum text length: 50,000 characters
- Detection accuracy varies with text length (minimum 50 characters recommended)
- Some specialized or technical content may not convert naturally
- Results are optimized for English text

## Use Cases

- Content creators maintaining authenticity
- Students improving writing naturalness
- Professionals humanizing formal communications
- Researchers studying AI text patterns
- Educational purposes and demonstrations

## License

MIT License - Feel free to use for educational and personal projects

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Disclaimer

This tool is designed for educational and creative purposes. Users are responsible for ensuring their use complies with relevant policies and guidelines. Always review and edit converted content before use.

---

**Version**: 1.0.0
**Author**: AI Text Humanizer Team
**Last Updated**: 2025
