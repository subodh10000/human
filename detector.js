/**
 * AI Text Detection Module
 * Analyzes text for AI-generated patterns with multi-factor analysis
 * Supports both Claude API-based detection and pattern-based fallback
 */

class AITextDetector {
  constructor(anthropicClient = null) {
    this.anthropic = anthropicClient;
    this.model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';
    this.enableFallback = process.env.ENABLE_FALLBACK !== 'false';
    // Common AI phrases and patterns
    this.aiPhrases = [
      'it is important to note',
      'it is worth noting',
      'furthermore',
      'moreover',
      'in conclusion',
      'to summarize',
      'in summary',
      'delve into',
      'dive into',
      'it\'s important to understand',
      'comprehensive',
      'leverage',
      'utilize',
      'facilitate',
      'in today\'s digital age',
      'in this day and age',
      'revolutionize',
      'game-changer',
      'cutting-edge',
      'state-of-the-art',
      'robust',
      'seamless',
      'streamline',
      'optimize',
      'enhance',
      'empower',
      'embark on',
      'journey',
      'landscape',
      'ecosystem',
      'holistic',
      'paradigm',
      'multifaceted'
    ];

    this.aiPatterns = {
      formalTransitions: /\b(however|therefore|thus|hence|consequently|nevertheless|nonetheless|furthermore|moreover|additionally|alternatively)\b/gi,
      perfectGrammar: /[.!?]\s+[A-Z]/g,
      longSentences: 25, // average words per sentence threshold
      vocabularyDiversity: 0.6, // unique words ratio threshold
      structureRepetition: 0.7 // similar sentence structure threshold
    };
  }

  /**
   * Claude API-based detection (most accurate)
   * @param {string} text - Text to analyze
   * @returns {Object} - Detection results with confidence score
   */
  async detectWithClaude(text) {
    if (!this.anthropic) {
      throw new Error('Claude API client not initialized');
    }

    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze the following text and determine if it was written by AI or a human.

Consider these factors:
- Writing style and tone
- Sentence structure patterns
- Vocabulary choices
- Natural imperfections or lack thereof
- Common AI phrases and patterns
- Coherence and flow

Provide your analysis in this exact JSON format:
{
  "isAI": true/false,
  "confidence": <number 0-100>,
  "reasoning": "<brief explanation>",
  "keyIndicators": ["<indicator1>", "<indicator2>", ...]
}

Text to analyze:
"""
${text}
"""

Respond ONLY with the JSON object, no other text.`
        }]
      });

      const responseText = message.content[0].text;
      const analysis = JSON.parse(responseText);

      return {
        isAI: analysis.isAI,
        confidence: analysis.confidence,
        score: analysis.confidence,
        details: {
          reasoning: analysis.reasoning,
          keyIndicators: analysis.keyIndicators
        },
        analysis: analysis.reasoning,
        method: 'claude-api'
      };
    } catch (error) {
      console.error('Claude API detection error:', error.message);
      if (this.enableFallback) {
        console.log('Falling back to pattern-based detection');
        return this.detectWithPatterns(text);
      }
      throw error;
    }
  }

  /**
   * Pattern-based detection (fallback method)
   * @param {string} text - Text to analyze
   * @returns {Object} - Detection results with confidence score
   */
  detectWithPatterns(text) {
    if (!text || text.trim().length < 50) {
      return {
        isAI: false,
        confidence: 0,
        score: 0,
        details: 'Text too short for accurate analysis'
      };
    }

    const scores = {
      phraseScore: this.analyzePhrases(text),
      structureScore: this.analyzeSentenceStructure(text),
      vocabularyScore: this.analyzeVocabulary(text),
      formalityScore: this.analyzeFormality(text),
      coherenceScore: this.analyzeCoherence(text),
      repetitionScore: this.analyzeRepetition(text)
    };

    // Weighted average of all scores
    const weights = {
      phraseScore: 0.25,
      structureScore: 0.20,
      vocabularyScore: 0.15,
      formalityScore: 0.15,
      coherenceScore: 0.15,
      repetitionScore: 0.10
    };

    let totalScore = 0;
    for (const [key, score] of Object.entries(scores)) {
      totalScore += score * weights[key];
    }

    const confidence = Math.round(totalScore);
    const isAI = confidence >= 50;

    return {
      isAI,
      confidence,
      score: totalScore,
      details: scores,
      analysis: this.generateAnalysis(scores, confidence),
      method: 'pattern-based'
    };
  }

  /**
   * Main detection function - uses Claude API if available, falls back to patterns
   * @param {string} text - Text to analyze
   * @returns {Object} - Detection results with confidence score
   */
  async detect(text) {
    if (!text || text.trim().length < 50) {
      return {
        isAI: false,
        confidence: 0,
        score: 0,
        details: 'Text too short for accurate analysis',
        method: 'none'
      };
    }

    // Use Claude API if available
    if (this.anthropic) {
      try {
        return await this.detectWithClaude(text);
      } catch (error) {
        console.error('Detection error:', error.message);
        if (this.enableFallback) {
          return this.detectWithPatterns(text);
        }
        throw error;
      }
    }

    // Fall back to pattern-based detection
    return this.detectWithPatterns(text);
  }

  analyzePhrases(text) {
    const lowerText = text.toLowerCase();
    let matchCount = 0;

    for (const phrase of this.aiPhrases) {
      if (lowerText.includes(phrase)) {
        matchCount++;
      }
    }

    // Calculate percentage of AI phrases found
    const percentage = (matchCount / this.aiPhrases.length) * 100;
    return Math.min(percentage * 3, 100); // Amplify the score
  }

  analyzeSentenceStructure(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length < 3) return 0;

    let totalWords = 0;
    let longSentences = 0;
    const structurePatterns = [];

    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/).length;
      totalWords += words;

      if (words > this.aiPatterns.longSentences) {
        longSentences++;
      }

      // Analyze sentence structure pattern
      const pattern = this.getSentencePattern(sentence);
      structurePatterns.push(pattern);
    });

    const avgWords = totalWords / sentences.length;
    const uniformity = this.calculateUniformity(structurePatterns);

    // AI text tends to have consistent sentence length and structure
    let score = 0;
    if (avgWords > 18) score += 30;
    if (uniformity > 0.6) score += 40;
    if (longSentences / sentences.length > 0.5) score += 30;

    return Math.min(score, 100);
  }

  analyzeVocabulary(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    const diversityRatio = uniqueWords.size / words.length;

    // AI tends to have high vocabulary diversity (uses varied words)
    let score = 0;
    if (diversityRatio > 0.7) {
      score = 80;
    } else if (diversityRatio > 0.6) {
      score = 60;
    } else if (diversityRatio > 0.5) {
      score = 40;
    } else {
      score = 20;
    }

    // Check for formal vocabulary
    const formalWords = ['utilize', 'facilitate', 'implement', 'comprehensive', 'leverage'];
    const formalCount = formalWords.filter(word => text.toLowerCase().includes(word)).length;
    score += formalCount * 10;

    return Math.min(score, 100);
  }

  analyzeFormality(text) {
    let score = 0;

    // Check for contractions (less formal, more human)
    const contractions = text.match(/\b(can't|won't|don't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't)\b/gi);
    if (!contractions || contractions.length < 2) {
      score += 40; // AI rarely uses contractions
    }

    // Check for formal transitions
    const transitions = text.match(this.aiPatterns.formalTransitions) || [];
    score += Math.min(transitions.length * 8, 40);

    // Check for passive voice indicators
    const passiveIndicators = text.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/gi) || [];
    if (passiveIndicators.length > 3) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  analyzeCoherence(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length < 3) return 50;

    // AI text is highly coherent and well-structured
    // Check for logical flow indicators
    let coherenceScore = 60; // Base score

    // Check for paragraph structure (AI often structures perfectly)
    const paragraphs = text.split(/\n\s*\n/);
    if (paragraphs.length > 1) {
      const evenParas = paragraphs.every(p => {
        const sents = p.match(/[^.!?]+[.!?]+/g) || [];
        return sents.length >= 2 && sents.length <= 6;
      });
      if (evenParas) coherenceScore += 20;
    }

    return Math.min(coherenceScore, 100);
  }

  analyzeRepetition(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length < 3) return 0;

    const startWords = sentences.map(s => {
      const words = s.trim().split(/\s+/);
      return words[0].toLowerCase();
    });

    const uniqueStarts = new Set(startWords);
    const repetitionRatio = 1 - (uniqueStarts.size / startWords.length);

    // AI text has less repetition (varied sentence starts)
    return Math.max(0, 100 - (repetitionRatio * 100));
  }

  getSentencePattern(sentence) {
    // Simple pattern: classify by length and first word type
    const words = sentence.trim().split(/\s+/);
    const firstWord = words[0].toLowerCase();
    const length = words.length;

    const transitions = ['however', 'therefore', 'thus', 'furthermore', 'moreover'];
    const isTransition = transitions.includes(firstWord);

    return `${isTransition ? 'T' : 'S'}-${length < 15 ? 'S' : length < 25 ? 'M' : 'L'}`;
  }

  calculateUniformity(patterns) {
    const patternCounts = {};
    patterns.forEach(p => {
      patternCounts[p] = (patternCounts[p] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(patternCounts));
    return maxCount / patterns.length;
  }

  generateAnalysis(scores, confidence) {
    const insights = [];

    if (scores.phraseScore > 60) {
      insights.push('High usage of common AI phrases detected');
    }
    if (scores.structureScore > 60) {
      insights.push('Consistent sentence structure pattern identified');
    }
    if (scores.vocabularyScore > 60) {
      insights.push('Formal vocabulary and high diversity detected');
    }
    if (scores.formalityScore > 60) {
      insights.push('Highly formal tone with minimal contractions');
    }

    if (insights.length === 0) {
      insights.push('Text shows natural human writing patterns');
    }

    return insights.join('. ');
  }
}

module.exports = AITextDetector;
