/**
 * AI Text Humanizer - Backend Server
 * Express API server for AI text detection and conversion
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const AITextDetector = require('./detector');
const AIToHumanConverter = require('./converter');
const GrammarChecker = require('./grammar');
const StyleConverter = require('./styleConverter');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Anthropic client if API key is available
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  try {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    console.log('✅ Claude API initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Claude API:', error.message);
  }
} else {
  console.log('⚠️  No ANTHROPIC_API_KEY found - using pattern-based detection only');
  console.log('   Set up your API key in .env file for enhanced accuracy');
}

// Initialize all modules with Anthropic client
const detector = new AITextDetector(anthropic);
const converter = new AIToHumanConverter(anthropic);
const grammarChecker = new GrammarChecker(anthropic);
const styleConverter = new StyleConverter(anthropic);

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the public directory
app.use(express.static('public'));

// Root route - serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * POST /api/detect
 * Analyzes text for AI-generated patterns
 */
app.post('/api/detect', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long (max 50,000 characters)'
      });
    }

    const result = await detector.detect(text);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Detection error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during detection',
      details: error.message
    });
  }
});

/**
 * POST /api/convert
 * Converts AI-generated text to human-like text
 */
app.post('/api/convert', async (req, res) => {
  try {
    const { text, intensity = 7 } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long (max 50,000 characters)'
      });
    }

    const parsedIntensity = parseInt(intensity);
    if (isNaN(parsedIntensity) || parsedIntensity < 1 || parsedIntensity > 10) {
      return res.status(400).json({
        success: false,
        error: 'Intensity must be between 1 and 10'
      });
    }

    const result = await converter.convert(text, parsedIntensity);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during conversion',
      details: error.message
    });
  }
});

/**
 * POST /api/process
 * Combined endpoint: detect and convert in one call
 */
app.post('/api/process', async (req, res) => {
  try {
    const { text, intensity = 7 } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long (max 50,000 characters)'
      });
    }

    // First detect
    const detection = await detector.detect(text);

    // Then convert
    const conversion = await converter.convert(text, parseInt(intensity));

    // Detect the converted text to show improvement
    const convertedDetection = await detector.detect(conversion.converted);

    res.json({
      success: true,
      original: {
        text: text,
        detection: detection
      },
      converted: {
        text: conversion.converted,
        detection: convertedDetection,
        changes: conversion.changes,
        humanization: conversion.humanization
      },
      improvement: {
        confidenceReduction: detection.confidence - convertedDetection.confidence,
        humanizationScore: conversion.humanization
      }
    });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during processing',
      details: error.message
    });
  }
});

/**
 * POST /api/grammar/check
 * Check grammar and get detailed corrections
 */
app.post('/api/grammar/check', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long (max 50,000 characters)'
      });
    }

    const result = await grammarChecker.check(text);

    res.json(result);
  } catch (error) {
    console.error('Grammar check error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during grammar check',
      details: error.message
    });
  }
});

/**
 * POST /api/grammar/fix
 * Quick grammar fix without detailed analysis
 */
app.post('/api/grammar/fix', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long (max 50,000 characters)'
      });
    }

    const result = await grammarChecker.quickFix(text);

    res.json(result);
  } catch (error) {
    console.error('Grammar fix error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during grammar fix',
      details: error.message
    });
  }
});

/**
 * GET /api/styles
 * Get available writing styles
 */
app.get('/api/styles', (req, res) => {
  try {
    const styles = styleConverter.getAvailableStyles();
    res.json({
      success: true,
      styles
    });
  } catch (error) {
    console.error('Get styles error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred',
      details: error.message
    });
  }
});

/**
 * POST /api/style/convert
 * Convert text to specified writing style
 */
app.post('/api/style/convert', async (req, res) => {
  try {
    const { text, style = 'casual', options = {} } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long (max 50,000 characters)'
      });
    }

    const result = await styleConverter.convert(text, style, options);

    res.json(result);
  } catch (error) {
    console.error('Style conversion error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during style conversion',
      details: error.message
    });
  }
});

/**
 * POST /api/style/convert-multiple
 * Convert text to multiple styles at once
 */
app.post('/api/style/convert-multiple', async (req, res) => {
  try {
    const { text, styles = ['casual', 'professional', 'academic'] } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long (max 50,000 characters)'
      });
    }

    const result = await styleConverter.convertMultiple(text, styles);

    res.json(result);
  } catch (error) {
    console.error('Multiple style conversion error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during style conversion',
      details: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: {
      aiDetection: !!anthropic,
      humanization: !!anthropic,
      grammarCheck: !!anthropic,
      styleConversion: !!anthropic
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          AI Text Humanizer Pro - v2.0                      ║
║          Powered by Claude API                             ║
║                                                            ║
║          Server running on: http://localhost:${PORT}        ║
║                                                            ║
║          🤖 AI Detection:                                  ║
║          - POST /api/detect                                ║
║          - POST /api/convert                               ║
║          - POST /api/process                               ║
║                                                            ║
║          ✍️  Grammar & Writing:                            ║
║          - POST /api/grammar/check                         ║
║          - POST /api/grammar/fix                           ║
║          - GET  /api/styles                                ║
║          - POST /api/style/convert                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
