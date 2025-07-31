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
    // Animate placeholder text
    animatePlaceholder();
    
    // Setup mobile navigation
    setupMobileNav();
    
    // Setup form validations
    setupFormValidation();
    
    // Add smooth scroll behavior
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
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        const moodInput = document.getElementById('moodInput');
        if (e.key === 'Enter' && moodInput && moodInput === document.activeElement) {
            detectMood();
        }
    });
    
    // Input field animations
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

    // Simulate API call with timeout
    setTimeout(() => {
        fetch('https://backend.onrender.com/detectMood', {
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

    // Visual feedback for voice input
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
            
            // Animate input field
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

// Login/Signup Functions
function showLogin() {
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');
    
    if (loginCard && signupCard) {
        signupCard.style.display = 'none';
        loginCard.style.display = 'block';
        clearFormErrors();
    }
}

function showSignup() {
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');
    
    if (loginCard && signupCard) {
        loginCard.style.display = 'none';
        signupCard.style.display = 'block';
        clearFormErrors();
    }
}

// Password toggle function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    const icon = toggle.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Form validation setup
function setupFormValidation() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
        
        // Real-time password strength checking
        const signupPassword = document.getElementById('signupPassword');
        if (signupPassword) {
            signupPassword.addEventListener('input', checkPasswordStrength);
        }
        
        // Real-time password confirmation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', checkPasswordMatch);
        }
    }
    
    // Real-time email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmail);
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Clear previous errors
    clearFormErrors();
    
    // Validate inputs
    if (!validateLoginForm(email, password)) {
        return;
    }
    
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    showButtonLoading(submitBtn, true);
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Demo credentials
        if (email === 'demo@moodtunes.com' && password === 'password123') {
            // Success
            currentUser = {
                email: email,
                name: 'Demo User',
                id: 'demo123'
            };
            
            if (rememberMe) {
                localStorage.setItem('moodtunes_user', JSON.stringify(currentUser));
            }
            
            showModal('successModal');
        } else {
            // Invalid credentials
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        showModal('errorModal');
        document.getElementById('errorModalText').textContent = 
            'Invalid email or password. Try demo@moodtunes.com / password123';
    } finally {
        showButtonLoading(submitBtn, false);
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Clear previous errors
    clearFormErrors();
    
    // Validate inputs
    if (!validateSignupForm(name, email, password, confirmPassword, agreeTerms)) {
        return;
    }
    
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    showButtonLoading(submitBtn, true);
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Success
        currentUser = {
            email: email,
            name: name,
            id: 'user_' + Date.now()
        };
        
        showModal('successModal');
    } catch (error) {
        showModal('errorModal');
        document.getElementById('errorModalText').textContent = 
            'Failed to create account. Please try again.';
    } finally {
        showButtonLoading(submitBtn, false);
    }
}

// Validation functions
function validateLoginForm(email, password) {
    let isValid = true;
    
    if (!email) {
        showFieldError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('emailError', 'Please enter a valid email');
        isValid = false;
    }
    
    if (!password) {
        showFieldError('passwordError', 'Password is required');
        isValid = false;
    }
    
    return isValid;
}

function validateSignupForm(name, email, password, confirmPassword, agreeTerms) {
    let isValid = true;
    
    if (!name || name.length < 2) {
        showFieldError('nameError', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    if (!email) {
        showFieldError('signupEmailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('signupEmailError', 'Please enter a valid email');
        isValid = false;
    }
    
    if (!password) {
        showFieldError('signupPasswordError', 'Password is required');
        isValid = false;
    } else if (!isStrongPassword(password)) {
        showFieldError('signupPasswordError', 'Password must be at least 8 characters with uppercase, lowercase, and number');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showFieldError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }
    
    if (!agreeTerms) {
        alert('Please agree to the terms and conditions');
        isValid = false;
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isStrongPassword(password) {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
}

function validateEmail(e) {
    const email = e.target.value;
    const errorId = e.target.id === 'loginEmail' ? 'emailError' : 'signupEmailError';
    
    if (email && !isValidEmail(email)) {
        showFieldError(errorId, 'Please enter a valid email');
    } else {
        clearFieldError(errorId);
    }
}

function checkPasswordStrength(e) {
    const password = e.target.value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (!password) {
        strengthDiv.innerHTML = '';
        return;
    }
    
    let strength = 0;
    let feedback = [];
    
    if (password.length >= 8) strength++;
    else feedback.push('8+ characters');
    
    if (/[a-z]/.test(password)) strength++;
    else feedback.push('lowercase');
    
    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('uppercase');
    
    if (/\d/.test(password)) strength++;
    else feedback.push('number');
    
    const strengthLevels = ['Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#ff4757', '#ffa502', '#2ed573', '#5352ed'];
    
    strengthDiv.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill" style="width: ${(strength / 4) * 100}%; background: ${strengthColors[strength - 1] || '#ff4757'}"></div>
        </div>
        <span class="strength-text" style="color: ${strengthColors[strength - 1] || '#ff4757'}">
            ${strengthLevels[strength - 1] || 'Too weak'}
            ${feedback.length ? ' - Need: ' + feedback.join(', ') : ''}
        </span>
    `;
}

function checkPasswordMatch(e) {
    const confirmPassword = e.target.value;
    const password = document.getElementById('signupPassword').value;
    
    if (confirmPassword && password !== confirmPassword) {
        showFieldError('confirmPasswordError', 'Passwords do not match');
    } else {
        clearFieldError('confirmPasswordError');
    }
}

// Utility functions
function showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearFieldError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function clearFormErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

function showButtonLoading(button, loading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        button.disabled = true;
    } else {
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
    
    // If success modal was closed, redirect to home
    if (currentUser) {
        window.location.href = 'index.html';
    }
}

function checkAuthStatus() {
    const savedUser = localStorage.getItem('moodtunes_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    loginLinks.forEach(link => {
        link.textContent = currentUser.name;
        link.href = '#';
        link.onclick = showUserMenu;
    });
}

function showUserMenu() {
    // Implement user menu functionality
    console.log('Show user menu for:', currentUser.name);
}

// Playlist functions
function savePlaylist(mood, playlistUrl) {
    if (!currentUser) {
        alert('Please login to save playlists');
        return;
    }
    
    // Save to localStorage (in real app, would save to backend)
    const savedPlaylists = JSON.parse(localStorage.getItem('saved_playlists') || '[]');
    savedPlaylists.push({
        mood: mood,
        url: playlistUrl,
        date: new Date().toISOString(),
        userId: currentUser.id
    });
    localStorage.setItem('saved_playlists', JSON.stringify(savedPlaylists));
    
    // Show feedback
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
        // Fallback for browsers without Web Share API
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
    // Log mood entry for analytics (in real app, would send to backend)
    const moodEntries = JSON.parse(localStorage.getItem('mood_entries') || '[]');
    moodEntries.push({
        text: text,
        mood: mood,
        timestamp: new Date().toISOString(),
        userId: currentUser?.id || 'anonymous'
    });
    localStorage.setItem('mood_entries', JSON.stringify(moodEntries));
}