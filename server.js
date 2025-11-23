/**
 * AI Text Humanizer - Backend Server
 * Express API server for AI text detection and conversion
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const AITextDetector = require('./detector');
const AIToHumanConverter = require('./converter');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize detector and converter
const detector = new AITextDetector();
const converter = new AIToHumanConverter();

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
app.post('/api/detect', (req, res) => {
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

    const result = detector.detect(text);

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
app.post('/api/convert', (req, res) => {
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

    const result = converter.convert(text, parsedIntensity);

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
app.post('/api/process', (req, res) => {
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
    const detection = detector.detect(text);

    // Then convert
    const conversion = converter.convert(text, parseInt(intensity));

    // Detect the converted text to show improvement
    const convertedDetection = detector.detect(conversion.converted);

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
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
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
║          AI Text Humanizer Server                          ║
║          Version 1.0.0                                     ║
║                                                            ║
║          Server running on: http://localhost:${PORT}        ║
║                                                            ║
║          Available endpoints:                              ║
║          - POST /api/detect    (Detect AI text)           ║
║          - POST /api/convert   (Convert to human)         ║
║          - POST /api/process   (Detect + Convert)         ║
║          - GET  /api/health    (Health check)             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
