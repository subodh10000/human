/**
 * Grammar Checker Module
 * Uses Claude API to check and correct grammar, spelling, and punctuation
 */

class GrammarChecker {
  constructor(anthropicClient = null) {
    this.anthropic = anthropicClient;
    this.model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';
  }

  /**
   * Check grammar and provide corrections
   * @param {string} text - Text to check
   * @returns {Object} - Grammar check results with corrections
   */
  async check(text) {
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'Text is required'
      };
    }

    // If no Claude API, return basic check
    if (!this.anthropic) {
      return {
        success: true,
        hasIssues: false,
        message: 'Claude API required for grammar checking',
        original: text,
        corrected: text,
        issues: [],
        method: 'unavailable'
      };
    }

    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Check the following text for grammar, spelling, and punctuation errors. Provide corrections and explanations.

Return your response in this exact JSON format:
{
  "hasIssues": true/false,
  "correctedText": "<fully corrected version of the text>",
  "issues": [
    {
      "type": "grammar|spelling|punctuation",
      "original": "<incorrect text>",
      "correction": "<corrected text>",
      "explanation": "<brief explanation>",
      "position": <character position in text>
    }
  ],
  "summary": "<brief summary of issues found>"
}

Text to check:
"""
${text}
"""

Respond ONLY with the JSON object, no other text.`
        }]
      });

      const responseText = message.content[0].text;
      const result = JSON.parse(responseText);

      return {
        success: true,
        hasIssues: result.hasIssues,
        original: text,
        corrected: result.correctedText,
        issues: result.issues || [],
        summary: result.summary,
        issueCount: result.issues ? result.issues.length : 0,
        method: 'claude-api'
      };
    } catch (error) {
      console.error('Grammar check error:', error.message);
      return {
        success: false,
        error: 'Grammar check failed',
        details: error.message,
        original: text,
        corrected: text
      };
    }
  }

  /**
   * Quick grammar fix without detailed analysis
   * @param {string} text - Text to fix
   * @returns {Object} - Corrected text
   */
  async quickFix(text) {
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'Text is required'
      };
    }

    if (!this.anthropic) {
      return {
        success: false,
        error: 'Claude API required for grammar fixing',
        original: text,
        corrected: text
      };
    }

    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Fix all grammar, spelling, and punctuation errors in this text. Maintain the original meaning and tone.

Return ONLY the corrected text, no explanations or meta-commentary.

Text:
"""
${text}
"""`
        }]
      });

      const correctedText = message.content[0].text.trim();

      return {
        success: true,
        original: text,
        corrected: correctedText,
        method: 'claude-api'
      };
    } catch (error) {
      console.error('Quick fix error:', error.message);
      return {
        success: false,
        error: 'Grammar fix failed',
        details: error.message,
        original: text,
        corrected: text
      };
    }
  }
}

module.exports = GrammarChecker;
