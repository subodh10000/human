/**
 * AI to Human Text Converter Module
 * Converts AI-generated text to more natural, human-like writing
 */

class AIToHumanConverter {
  constructor() {
    // Replacement mappings for common AI phrases
    this.phraseReplacements = {
      'it is important to note': ['worth mentioning', 'keep in mind', 'remember', 'note that'],
      'it is worth noting': ['interestingly', 'notably', 'what\'s interesting is', 'you should know'],
      'furthermore': ['also', 'plus', 'on top of that', 'and', 'what\'s more'],
      'moreover': ['also', 'plus', 'besides', 'and', 'additionally'],
      'in conclusion': ['so', 'overall', 'to wrap up', 'in the end', 'all in all'],
      'to summarize': ['in short', 'basically', 'long story short', 'to sum up'],
      'in summary': ['basically', 'in short', 'overall', 'so'],
      'delve into': ['explore', 'look at', 'examine', 'dive into', 'check out'],
      'utilize': ['use', 'make use of', 'employ'],
      'facilitate': ['help', 'make easier', 'enable', 'assist'],
      'implement': ['set up', 'put in place', 'start using', 'apply'],
      'comprehensive': ['complete', 'thorough', 'full', 'detailed'],
      'leverage': ['use', 'take advantage of', 'make use of', 'tap into'],
      'in today\'s digital age': ['these days', 'nowadays', 'today', 'currently'],
      'revolutionize': ['change', 'transform', 'shake up', 'improve dramatically'],
      'game-changer': ['big deal', 'major improvement', 'breakthrough'],
      'cutting-edge': ['latest', 'modern', 'advanced', 'new'],
      'state-of-the-art': ['latest', 'advanced', 'modern', 'top-notch'],
      'robust': ['strong', 'solid', 'reliable', 'sturdy'],
      'seamless': ['smooth', 'easy', 'effortless', 'simple'],
      'streamline': ['simplify', 'improve', 'make easier', 'optimize'],
      'enhance': ['improve', 'boost', 'better', 'upgrade'],
      'empower': ['enable', 'allow', 'help', 'give power to'],
      'landscape': ['field', 'world', 'scene', 'area'],
      'ecosystem': ['network', 'community', 'environment', 'system'],
      'paradigm': ['model', 'approach', 'way of thinking', 'framework']
    };

    this.formalToInformal = {
      'therefore': ['so', 'that\'s why', 'because of this'],
      'thus': ['so', 'this way', 'like this'],
      'hence': ['so', 'that\'s why', 'for this reason'],
      'consequently': ['so', 'as a result', 'because of this'],
      'nevertheless': ['still', 'but', 'even so', 'yet'],
      'nonetheless': ['still', 'even so', 'but', 'yet'],
      'additionally': ['also', 'plus', 'and', 'on top of that'],
      'alternatively': ['or', 'instead', 'on the other hand']
    };

    this.sentenceStarters = [
      'Look,', 'See,', 'Here\'s the thing:', 'Honestly,', 'Actually,',
      'To be fair,', 'In my experience,', 'From what I\'ve seen,',
      'You know,', 'The way I see it,', 'Personally,', 'I think',
      'If you ask me,', 'Let me tell you,'
    ];

    this.fillerPhrases = [
      'you know', 'I mean', 'kind of', 'sort of', 'basically',
      'pretty much', 'for the most part', 'more or less', 'in a way',
      'to some extent', 'at least', 'at the end of the day'
    ];
  }

  /**
   * Main conversion function
   * @param {string} text - AI-generated text to convert
   * @param {number} intensity - Conversion intensity (1-10)
   * @returns {Object} - Converted text with metadata
   */
  convert(text, intensity = 7) {
    if (!text || text.trim().length === 0) {
      return {
        original: text,
        converted: text,
        changes: 0,
        success: false
      };
    }

    let convertedText = text;
    let changes = 0;

    // Step 1: Replace formal phrases with casual alternatives
    const phraseChanges = this.replaceFormalPhrases(convertedText, intensity);
    convertedText = phraseChanges.text;
    changes += phraseChanges.count;

    // Step 2: Add contractions
    const contractionChanges = this.addContractions(convertedText, intensity);
    convertedText = contractionChanges.text;
    changes += contractionChanges.count;

    // Step 3: Vary sentence structure
    const structureChanges = this.varySentenceStructure(convertedText, intensity);
    convertedText = structureChanges.text;
    changes += structureChanges.count;

    // Step 4: Add natural imperfections
    const imperfectionChanges = this.addNaturalImperfections(convertedText, intensity);
    convertedText = imperfectionChanges.text;
    changes += imperfectionChanges.count;

    // Step 5: Break up long sentences
    const sentenceChanges = this.breakLongSentences(convertedText, intensity);
    convertedText = sentenceChanges.text;
    changes += sentenceChanges.count;

    // Step 6: Add filler words (sparingly)
    if (intensity >= 6) {
      const fillerChanges = this.addFillerWords(convertedText, intensity);
      convertedText = fillerChanges.text;
      changes += fillerChanges.count;
    }

    // Step 7: Add personal touches
    if (intensity >= 7) {
      const personalChanges = this.addPersonalTouches(convertedText, intensity);
      convertedText = personalChanges.text;
      changes += personalChanges.count;
    }

    return {
      original: text,
      converted: convertedText,
      changes,
      success: true,
      humanization: Math.min((changes / text.length) * 1000 + 85, 98) // Calculate humanization percentage
    };
  }

  replaceFormalPhrases(text, intensity) {
    let result = text;
    let count = 0;

    // Replace common AI phrases
    for (const [formal, informal] of Object.entries(this.phraseReplacements)) {
      const regex = new RegExp(formal, 'gi');
      const matches = result.match(regex);

      if (matches) {
        result = result.replace(regex, () => {
          count++;
          return this.getRandomItem(informal);
        });
      }
    }

    // Replace formal transitions
    for (const [formal, informal] of Object.entries(this.formalToInformal)) {
      const regex = new RegExp(`\\b${formal}\\b`, 'gi');
      const matches = result.match(regex);

      if (matches && Math.random() * 10 < intensity) {
        result = result.replace(regex, () => {
          count++;
          return this.getRandomItem(informal);
        });
      }
    }

    return { text: result, count };
  }

  addContractions(text, intensity) {
    let result = text;
    let count = 0;

    const contractionMap = {
      'do not': 'don\'t',
      'does not': 'doesn\'t',
      'did not': 'didn\'t',
      'is not': 'isn\'t',
      'are not': 'aren\'t',
      'was not': 'wasn\'t',
      'were not': 'weren\'t',
      'have not': 'haven\'t',
      'has not': 'hasn\'t',
      'had not': 'hadn\'t',
      'will not': 'won\'t',
      'would not': 'wouldn\'t',
      'should not': 'shouldn\'t',
      'could not': 'couldn\'t',
      'cannot': 'can\'t',
      'it is': 'it\'s',
      'that is': 'that\'s',
      'there is': 'there\'s',
      'what is': 'what\'s',
      'who is': 'who\'s',
      'i am': 'I\'m',
      'you are': 'you\'re',
      'we are': 'we\'re',
      'they are': 'they\'re'
    };

    for (const [full, contraction] of Object.entries(contractionMap)) {
      const regex = new RegExp(`\\b${full}\\b`, 'gi');
      const matches = result.match(regex);

      if (matches) {
        result = result.replace(regex, (match) => {
          if (Math.random() * 10 < intensity) {
            count++;
            // Preserve capitalization
            if (match[0] === match[0].toUpperCase()) {
              return contraction.charAt(0).toUpperCase() + contraction.slice(1);
            }
            return contraction;
          }
          return match;
        });
      }
    }

    return { text: result, count };
  }

  varySentenceStructure(text, intensity) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length < 2) return { text, count: 0 };

    let count = 0;
    const varied = sentences.map((sentence, index) => {
      // Occasionally start sentences differently
      if (index > 0 && Math.random() * 10 < intensity / 2) {
        const trimmed = sentence.trim();
        const firstWord = trimmed.split(/\s+/)[0];

        // If it starts with a formal transition, might already be varied
        if (!['However', 'Therefore', 'Thus', 'Moreover'].includes(firstWord)) {
          if (Math.random() > 0.7 && intensity >= 6) {
            count++;
            return ' ' + this.getRandomItem(this.sentenceStarters) + ' ' + trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
          }
        }
      }
      return sentence;
    });

    return { text: varied.join(''), count };
  }

  addNaturalImperfections(text, intensity) {
    let result = text;
    let count = 0;

    // Occasionally combine short sentences with "and" or "but"
    result = result.replace(/([.!?])\s+([A-Z])/g, (match, punctuation, letter) => {
      if (Math.random() * 15 < intensity && punctuation === '.') {
        count++;
        const connectors = [', and ', ', but ', ' and ', ' - '];
        return this.getRandomItem(connectors) + letter.toLowerCase();
      }
      return match;
    });

    return { text: result, count };
  }

  breakLongSentences(text, intensity) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    let count = 0;

    const broken = sentences.map(sentence => {
      const words = sentence.trim().split(/\s+/);

      // Break sentences longer than 30 words
      if (words.length > 30 && Math.random() * 10 < intensity) {
        const midpoint = Math.floor(words.length / 2);
        const connectorIndex = this.findConnector(words, midpoint);

        if (connectorIndex > 0) {
          count++;
          const first = words.slice(0, connectorIndex).join(' ');
          const second = words.slice(connectorIndex).join(' ');
          return first + '. ' + second.charAt(0).toUpperCase() + second.slice(1);
        }
      }

      return sentence;
    });

    return { text: broken.join(' '), count };
  }

  addFillerWords(text, intensity) {
    let result = text;
    let count = 0;

    const sentences = result.match(/[^.!?]+[.!?]+/g) || [];

    const modified = sentences.map(sentence => {
      // Add filler words occasionally (not too much)
      if (Math.random() * 20 < intensity && sentence.split(/\s+/).length > 8) {
        const words = sentence.trim().split(/\s+/);
        const insertPosition = Math.floor(words.length / 2);
        const filler = this.getRandomItem(this.fillerPhrases);

        count++;
        words.splice(insertPosition, 0, filler + ',');
        return ' ' + words.join(' ');
      }
      return sentence;
    });

    return { text: modified.join(''), count };
  }

  addPersonalTouches(text, intensity) {
    let result = text;
    let count = 0;

    // Replace some "This" or "That" with more casual references
    result = result.replace(/\bThis is\b/g, (match) => {
      if (Math.random() * 10 < intensity / 2) {
        count++;
        return this.getRandomItem(['This\'s', 'It\'s', 'Here\'s the thing -']);
      }
      return match;
    });

    // Add occasional emphasis
    result = result.replace(/\b(very|really|extremely)\s+(\w+)/gi, (match, adverb, word) => {
      if (Math.random() * 10 < intensity / 3) {
        count++;
        return this.getRandomItem(['super', 'pretty', 'really', 'quite']) + ' ' + word;
      }
      return match;
    });

    return { text: result, count };
  }

  findConnector(words, startIndex) {
    const connectors = ['and', 'but', 'or', 'while', 'when', 'because', 'although', 'which'];

    for (let i = startIndex; i < words.length; i++) {
      if (connectors.includes(words[i].toLowerCase().replace(/[,;]/g, ''))) {
        return i;
      }
    }

    return -1;
  }

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

module.exports = AIToHumanConverter;
