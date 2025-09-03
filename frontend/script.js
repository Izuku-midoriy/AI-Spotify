// Global variables
let currentUser = null;
let isListening = false;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// Initialize application
function initializeApp() {
    animatePlaceholder();
    setupMobileNav();
    setupFormValidation();
    document.documentElement.style.scrollBehavior = 'smooth';
}

// Animate placeholder text
function animatePlaceholder() {
    const phrases = [
        "Feeling happy today...",
        "A bit melancholy...",
        "Energetic and ready to go!",
        "Need something calming...",
        "Motivated to conquer the world!",
        "Nostalgic vibes...",
        "Ready to dance!",
        "Contemplative mood...",
        "Feeling romantic...",
        "Need focus music..."
    ];
    
    let phraseIndex = 0;
    const inputElement = document.getElementById('moodInput');
    
    if (inputElement) {
        setInterval(() => {
            inputElement.placeholder = phrases[phraseIndex];
            phraseIndex = (phraseIndex + 1) % phrases.length;
        }, 3000);
    }
}

// Setup event listeners
function setupEventListeners() {
    document.addEventListener('keydown', function(e) {
        const moodInput = document.getElementById('moodInput');
        if (e.key === 'Enter' && moodInput && moodInput === document.activeElement) {
            detectMood();
        }
    });
    
    const moodInput = document.getElementById('moodInput');
    if (moodInput) {
        moodInput.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        moodInput.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    }
}

// Setup mobile navigation
function setupMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Mood detection function
function detectMood() {
    const moodInput = document.getElementById('moodInput');
    const text = moodInput ? moodInput.value.trim() : '';
    
    if (!text) {
        showError("Please enter your mood or thoughts first!");
        return;
    }

    showLoading();

    setTimeout(() => {
        fetch('https://ai-spotify.onrender.com/detectMood', {   // ✅ FIXED: now points to /detectMood
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        })
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            showResult(data.mood, data.playlistUrl);
            logMoodEntry(text, data.mood);
        })
        .catch(error => {
            console.error("Error:", error);
            showError("Failed to analyze your mood. Please try again!");
        });
    }, 1000);
}

// Voice input function
function startVoice() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showError("Voice recognition is not supported in your browser!");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    const voiceBtn = document.querySelector('.btn-secondary');
    const originalText = voiceBtn.innerHTML;
    voiceBtn.innerHTML = '<i class="fas fa-microphone pulse"></i> Listening...';
    voiceBtn.style.background = 'linear-gradient(135deg, #ff9a9e, #fad0c4)';
    isListening = true;

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const moodInput = document.getElementById('moodInput');
        if (moodInput) {
            moodInput.value = transcript;
            moodInput.focus();
            
            moodInput.style.background = 'linear-gradient(135deg, #a8edea, #fed6e3)';
            setTimeout(() => {
                moodInput.style.background = 'rgba(255, 255, 255, 0.9)';
            }, 1000);
        }
    };

    recognition.onerror = function(event) {
        showError("Voice recognition error. Please try again!");
        console.error('Speech recognition error:', event.error);
    };

    recognition.onend = function() {
        voiceBtn.innerHTML = originalText;
        voiceBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
        isListening = false;
    };

    recognition.start();
}

// Show loading state
function showLoading() {
    const player = document.getElementById('player');
    if (player) {
        player.innerHTML = `
            <div class="result-card">
                <div class="loading">
                    <div class="spinner"></div>
                </div>
                <p style="text-align: center; margin-top: 20px; color: #666;">
                    Analyzing your mood and curating the perfect playlist...
                </p>
            </div>
        `;
    }
}

// Show result
function showResult(mood, playlistUrl) {
    const player = document.getElementById('player');
    if (player) {
        player.innerHTML = `
            <div class="result-card">
                <div class="mood-display">
                    <div class="mood-label">Your Mood</div>
                    <div class="mood-value">${mood}</div>
                </div>
                <div class="playlist-container">
                    <iframe 
                        class="playlist-frame"
                        src="${playlistUrl}" 
                        width="300" 
                        height="380" 
                        frameborder="0" 
                        allow="encrypted-media">
                    </iframe>
                </div>
                <div class="result-actions">
                    <button class="btn btn-secondary" onclick="savePlaylist('${mood}', '${playlistUrl}')">
                        <i class="fas fa-heart"></i> Save Playlist
                    </button>
                    <button class="btn btn-primary" onclick="sharePlaylist('${mood}')">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
            </div>
        `;
    }
}

// Show error
function showError(message) {
    const player = document.getElementById('player');
    if (player) {
        player.innerHTML = `
            <div class="result-card">
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${message}
                </div>
            </div>
        `;
    }
}

// Suggestion functions
function setSuggestion(mood) {
    const moodInput = document.getElementById('moodInput');
    if (moodInput) {
        moodInput.value = mood;
        moodInput.focus();
    }
}

function setMoodCategory(category) {
    const moodInput = document.getElementById('moodInput');
    if (moodInput) {
        moodInput.value = `I'm feeling ${category} today`;
        detectMood();
    }
}

// Playlist functions
function savePlaylist(mood, playlistUrl) {
    if (!currentUser) {
        alert('Please login to save playlists');
        return;
    }
    
    const savedPlaylists = JSON.parse(localStorage.getItem('saved_playlists') || '[]');
    savedPlaylists.push({
        mood: mood,
        url: playlistUrl,
        date: new Date().toISOString(),
        userId: currentUser.id
    });
    localStorage.setItem('saved_playlists', JSON.stringify(savedPlaylists));
    
    showTemporaryMessage('Playlist saved!', 'success');
}

function sharePlaylist(mood) {
    if (navigator.share) {
        navigator.share({
            title: `My ${mood} Playlist - MoodTunes`,
            text: `Check out this ${mood} playlist created just for me!`,
            url: window.location.href
        });
    } else {
        const text = `Check out this ${mood} playlist created just for me on MoodTunes!`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            showTemporaryMessage('Link copied to clipboard!', 'success');
        } else {
            alert(text);
        }
    }
}

function showTemporaryMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `temp-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#2ed573' : '#3742fa'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function logMoodEntry(text, mood) {
    const moodEntries = JSON.parse(localStorage.getItem('mood_entries') || '[]');
    moodEntries.push({
        text: text,
        mood: mood,
        timestamp: new Date().toISOString(),
        userId: currentUser?.id || 'anonymous'
    });
    localStorage.setItem('mood_entries', JSON.stringify(moodEntries));
}
