/**
 * Style Converter Module
 * Converts text to different writing styles using Claude API
 */

class StyleConverter {
  constructor(anthropicClient = null) {
    this.anthropic = anthropicClient;
    this.model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';

    // Available writing styles
    this.styles = {
      academic: {
        name: 'Academic',
        description: 'Formal, scholarly writing suitable for research papers and academic contexts',
        icon: '📚',
        prompt: `Rewrite this text in an academic style:
- Use formal, scholarly language
- Include appropriate terminology
- Maintain objectivity and precision
- Use complex sentence structures
- Cite-ready format
- Avoid contractions and colloquialisms
- Focus on clarity and rigor`
      },
      casual: {
        name: 'Casual',
        description: 'Friendly, conversational writing for informal communication',
        icon: '💬',
        prompt: `Rewrite this text in a casual, conversational style:
- Use friendly, approachable language
- Include contractions (it's, don't, can't)
- Add personality and warmth
- Use simple, everyday words
- Make it feel like a conversation
- Natural flow and rhythm
- Relatable and engaging`
      },
      professional: {
        name: 'Professional',
        description: 'Polished, business-appropriate writing for workplace communication',
        icon: '💼',
        prompt: `Rewrite this text in a professional business style:
- Use clear, concise language
- Maintain professional tone
- Be courteous and respectful
- Focus on key points
- Appropriate for workplace communication
- Balanced formality
- Action-oriented where applicable`
      },
      creative: {
        name: 'Creative',
        description: 'Engaging, expressive writing with storytelling elements',
        icon: '🎭',
        prompt: `Rewrite this text in a creative, engaging style:
- Use vivid, descriptive language
- Add storytelling elements
- Include metaphors and imagery
- Engage emotions
- Create a narrative flow
- Make it memorable and impactful
- Expressive and dynamic`
      },
      technical: {
        name: 'Technical',
        description: 'Precise, clear writing for technical documentation and explanations',
        icon: '🔧',
        prompt: `Rewrite this text in a technical style:
- Use precise, unambiguous language
- Include technical terminology where appropriate
- Focus on accuracy and clarity
- Logical structure and organization
- Step-by-step when applicable
- Objective and informative
- Suitable for documentation`
      },
      persuasive: {
        name: 'Persuasive',
        description: 'Compelling writing designed to convince and influence',
        icon: '🎯',
        prompt: `Rewrite this text in a persuasive style:
- Use compelling arguments
- Include emotional appeals
- Add supporting evidence
- Create urgency or importance
- Use rhetorical techniques
- Call to action where appropriate
- Engaging and convincing`
      },
      simplified: {
        name: 'Simplified',
        description: 'Easy-to-understand writing for general audiences',
        icon: '📖',
        prompt: `Rewrite this text in a simplified style:
- Use simple, everyday words
- Short, clear sentences
- Avoid jargon and technical terms
- Easy to understand for anyone
- Explain complex ideas simply
- Accessible to all reading levels
- Clear and straightforward`
      }
    };
  }

  /**
   * Get available writing styles
   * @returns {Object} - Available styles with metadata
   */
  getAvailableStyles() {
    return Object.keys(this.styles).map(key => ({
      id: key,
      name: this.styles[key].name,
      description: this.styles[key].description,
      icon: this.styles[key].icon
    }));
  }

  /**
   * Convert text to specified style
   * @param {string} text - Text to convert
   * @param {string} style - Target style (academic, casual, etc.)
   * @param {Object} options - Additional options
   * @returns {Object} - Converted text with metadata
   */
  async convert(text, style = 'casual', options = {}) {
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'Text is required'
      };
    }

    if (!this.styles[style]) {
      return {
        success: false,
        error: `Invalid style. Available: ${Object.keys(this.styles).join(', ')}`
      };
    }

    if (!this.anthropic) {
      return {
        success: false,
        error: 'Claude API required for style conversion',
        original: text,
        converted: text,
        style: style
      };
    }

    try {
      const styleConfig = this.styles[style];
      const { maintainLength = false, targetAudience = 'general' } = options;

      let additionalInstructions = '';
      if (maintainLength) {
        additionalInstructions += '\n- Maintain approximately the same length as the original';
      }
      if (targetAudience !== 'general') {
        additionalInstructions += `\n- Target audience: ${targetAudience}`;
      }

      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `${styleConfig.prompt}${additionalInstructions}

Original text:
"""
${text}
"""

Respond with ONLY the rewritten text, no explanations or meta-commentary.`
        }]
      });

      const convertedText = message.content[0].text.trim();

      return {
        success: true,
        original: text,
        converted: convertedText,
        style: style,
        styleName: styleConfig.name,
        method: 'claude-api',
        characterChange: convertedText.length - text.length,
        wordChange: this.countWords(convertedText) - this.countWords(text)
      };
    } catch (error) {
      console.error('Style conversion error:', error.message);
      return {
        success: false,
        error: 'Style conversion failed',
        details: error.message,
        original: text,
        converted: text,
        style: style
      };
    }
  }

  /**
   * Convert text to multiple styles at once
   * @param {string} text - Text to convert
   * @param {Array} styles - Array of style IDs
   * @returns {Object} - Results for each style
   */
  async convertMultiple(text, styles = ['casual', 'professional', 'academic']) {
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'Text is required'
      };
    }

    const results = {};

    for (const style of styles) {
      if (this.styles[style]) {
        results[style] = await this.convert(text, style);
      }
    }

    return {
      success: true,
      original: text,
      styles: results
    };
  }

  /**
   * Count words in text
   * @param {string} text - Text to count
   * @returns {number} - Word count
   */
  countWords(text) {
    return text.trim().split(/\s+/).length;
  }
}

module.exports = StyleConverter;
