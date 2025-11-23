/**
 * AI Text Humanizer - Frontend Application
 * Handles user interactions and API communication
 */

// DOM Elements
const inputText = document.getElementById('inputText');
const charCount = document.getElementById('charCount');
const intensitySlider = document.getElementById('intensity');
const intensityValue = document.getElementById('intensityValue');
const detectBtn = document.getElementById('detectBtn');
const convertBtn = document.getElementById('convertBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const resultsSection = document.getElementById('resultsSection');
const outputCard = document.getElementById('outputCard');
const outputText = document.getElementById('outputText');
const loadingOverlay = document.getElementById('loadingOverlay');

// API Base URL
const API_URL = window.location.origin;

// Event Listeners
inputText.addEventListener('input', updateCharCount);
intensitySlider.addEventListener('input', updateIntensityValue);
detectBtn.addEventListener('click', handleDetect);
convertBtn.addEventListener('click', handleConvert);
clearBtn.addEventListener('click', handleClear);
copyBtn.addEventListener('click', handleCopy);

// Initialize
updateCharCount();

/**
 * Update character count display
 */
function updateCharCount() {
    const count = inputText.value.length;
    charCount.textContent = `${count.toLocaleString()} characters`;

    // Enable/disable buttons based on input
    const hasText = count >= 50;
    detectBtn.disabled = !hasText;
    convertBtn.disabled = !hasText;
}

/**
 * Update intensity value display
 */
function updateIntensityValue() {
    intensityValue.textContent = intensitySlider.value;
}

/**
 * Handle detect button click
 */
async function handleDetect() {
    const text = inputText.value.trim();

    if (!text || text.length < 50) {
        showNotification('Please enter at least 50 characters for accurate detection', 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_URL}/api/detect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        const result = await response.json();

        if (result.success) {
            displayDetectionOnly(result);
        } else {
            showNotification(result.error || 'Detection failed', 'error');
        }
    } catch (error) {
        console.error('Detection error:', error);
        showNotification('Failed to connect to server. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Handle convert button click
 */
async function handleConvert() {
    const text = inputText.value.trim();
    const intensity = parseInt(intensitySlider.value);

    if (!text || text.length < 50) {
        showNotification('Please enter at least 50 characters for conversion', 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_URL}/api/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, intensity })
        });

        const result = await response.json();

        if (result.success) {
            displayFullResults(result);
        } else {
            showNotification(result.error || 'Conversion failed', 'error');
        }
    } catch (error) {
        console.error('Conversion error:', error);
        showNotification('Failed to connect to server. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Handle clear button click
 */
function handleClear() {
    inputText.value = '';
    updateCharCount();
    resultsSection.style.display = 'none';
    outputCard.style.display = 'none';
}

/**
 * Handle copy button click
 */
function handleCopy() {
    const text = outputText.textContent;

    navigator.clipboard.writeText(text).then(() => {
        showNotification('Text copied to clipboard!', 'success');
        copyBtn.innerHTML = '<span class="btn-icon">✓</span> Copied!';

        setTimeout(() => {
            copyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy';
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
        showNotification('Failed to copy text', 'error');
    });
}

/**
 * Display detection-only results
 */
function displayDetectionOnly(result) {
    resultsSection.style.display = 'block';
    outputCard.style.display = 'none';

    updateDetectionDisplay('original', result);
}

/**
 * Display full conversion results
 */
function displayFullResults(result) {
    resultsSection.style.display = 'block';
    outputCard.style.display = 'block';

    // Display original detection
    updateDetectionDisplay('original', result.original.detection);

    // Display converted text
    outputText.textContent = result.converted.text;

    // Display converted detection
    updateDetectionDisplay('converted', result.converted.detection);

    // Display statistics
    document.getElementById('changesCount').textContent = result.converted.changes;
    document.getElementById('humanizationScore').textContent =
        Math.round(result.converted.humanization) + '%';
    document.getElementById('improvement').textContent =
        (result.improvement.confidenceReduction > 0 ? '-' : '+') +
        Math.abs(Math.round(result.improvement.confidenceReduction)) + '%';

    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

/**
 * Update detection display
 */
function updateDetectionDisplay(type, detection) {
    const scoreCircle = document.getElementById(`${type}Score`);
    const scoreValue = document.getElementById(`${type}ScoreValue`);
    const verdict = document.getElementById(`${type}Verdict`);
    const breakdown = document.getElementById(`${type}Breakdown`);

    // Update score
    scoreValue.textContent = detection.confidence + '%';

    // Update circle color
    scoreCircle.className = 'score-circle';
    if (detection.isAI) {
        scoreCircle.classList.add('ai-detected');
    } else {
        scoreCircle.classList.add('human-detected');
    }

    // Update verdict
    verdict.className = 'verdict';
    if (detection.isAI) {
        verdict.classList.add('ai');
        verdict.innerHTML = `
            <span class="verdict-icon">🤖</span>
            <span class="verdict-text">Likely AI-Generated</span>
        `;
    } else {
        verdict.classList.add('human');
        verdict.innerHTML = `
            <span class="verdict-icon">👤</span>
            <span class="verdict-text">Likely Human-Written</span>
        `;
    }

    // Update breakdown (only for original)
    if (breakdown && detection.analysis) {
        breakdown.textContent = detection.analysis;
    }
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';

    // Disable buttons while loading
    detectBtn.disabled = show;
    convertBtn.disabled = show;
    clearBtn.disabled = show;
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '10px',
        backgroundColor: type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#667eea',
        color: 'white',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 10000,
        animation: 'slideIn 0.3s ease-out'
    });

    // Add to document
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to convert
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!convertBtn.disabled) {
            handleConvert();
        }
    }

    // Escape to clear
    if (e.key === 'Escape') {
        handleClear();
    }
});

// Add example text button functionality (optional)
const examples = [
    `In today's digital age, it is important to note that leveraging cutting-edge technology can revolutionize the way businesses operate. Furthermore, implementing robust solutions enables organizations to streamline their processes and enhance productivity. This paradigm shift has been a game-changer for the industry, facilitating unprecedented growth and innovation.`,

    `It is worth noting that comprehensive analysis of the data reveals significant patterns. Moreover, the implementation of these methodologies has proven to be highly effective in optimizing outcomes. In conclusion, the results demonstrate a clear correlation between the variables under investigation.`,

    `Artificial intelligence has become increasingly sophisticated in recent years. However, there are still fundamental differences between AI-generated and human-written content. Therefore, it is essential to understand these distinctions to maintain authenticity in communication.`
];

// Log ready state
console.log('AI Text Humanizer - Ready');
console.log('Keyboard shortcuts:');
console.log('  - Ctrl/Cmd + Enter: Convert text');
console.log('  - Escape: Clear all');
