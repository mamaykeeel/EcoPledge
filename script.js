// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// User authentication state
let currentUser = null;
let isLoginMode = true;

// DOM Elements
const userSection = document.getElementById('userSection');
const authSection = document.getElementById('authSection');
const userName = document.getElementById('userName');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const registerBtnHero = document.getElementById('registerBtnHero');
const logoutBtn = document.getElementById('logoutBtn');
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const confirmPassword = document.getElementById('confirmPassword');
const confirmPasswordSection = document.getElementById('confirmPasswordSection');
const passwordRequirements = document.getElementById('passwordRequirements');
const authModalTitle = document.getElementById('authModalTitle');
const authSubmitText = document.getElementById('authSubmitText');
const authSwitchText = document.getElementById('authSwitchText');
const authSwitchBtn = document.getElementById('authSwitchBtn');
const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const passwordStrength = document.getElementById('passwordStrength');
const passwordStrengthText = document.getElementById('passwordStrengthText');

// Password requirement elements
const lengthReq = document.getElementById('lengthReq');
const uppercaseReq = document.getElementById('uppercaseReq');
const lowercaseReq = document.getElementById('lowercaseReq');
const numberReq = document.getElementById('numberReq');
const specialReq = document.getElementById('specialReq');

// Community stats elements
const totalActions = document.getElementById('totalActions');
const communityImpact = document.getElementById('communityImpact');
const activeUsers = document.getElementById('activeUsers');
const totalTrees = document.getElementById('totalTrees');
const waterSaved = document.getElementById('waterSaved');
const carbonReduced = document.getElementById('carbonReduced');
const leaderboardList = document.getElementById('leaderboardList');

// Check authentication state
function checkAuthState() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    userSection.classList.remove('hidden');
    authSection.classList.add('hidden');
    userName.textContent = currentUser.email.split('@')[0];
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    userSection.classList.add('hidden');
    authSection.classList.remove('hidden');
}

// Show authentication modal
function showAuthModal(mode = 'login') {
    authModalTitle.textContent = mode === 'login' ? 'Welcome Back' : 'Create Account';
    document.getElementById('authModalSubtitle').textContent = mode === 'login' ? 
        'Please sign in to your account' : 'Join our eco-friendly community';
    authSubmitText.textContent = mode === 'login' ? 'Sign in' : 'Create Account';
    authSwitchText.textContent = mode === 'login' ? "Don't have an account?" : 'Already have an account?';
    authSwitchBtn.textContent = mode === 'login' ? 'Register' : 'Sign in';
    confirmPasswordSection.classList.toggle('hidden', mode === 'login');
    passwordRequirements.classList.toggle('hidden', mode === 'login');
    authModal.classList.remove('hidden');
}

// Hide authentication modal
function hideAuthModal() {
    authModal.classList.add('hidden');
    authForm.reset();
    passwordStrength.classList.add('hidden');
    confirmPasswordSection.classList.add('hidden');
    passwordRequirements.classList.add('hidden');
}

// Validate password strength
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Update UI
    Object.entries(requirements).forEach(([req, met]) => {
        const icon = document.querySelector(`#${req}Req i`);
        if (met) {
            icon.classList.remove('text-gray-300', 'fa-circle');
            icon.classList.add('text-green-500', 'fa-check-circle');
        } else {
            icon.classList.remove('text-green-500', 'fa-check-circle');
            icon.classList.add('text-gray-300', 'fa-circle');
        }
    });

    // Calculate strength
    const strength = Object.values(requirements).filter(Boolean).length;
    const strengthText = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][strength - 1];
    const strengthColor = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-green-600'][strength - 1];

    passwordStrengthText.textContent = strengthText;
    passwordStrengthText.className = `font-medium ${strengthColor}`;
    passwordStrength.classList.remove('hidden');

    return Object.values(requirements).every(Boolean);
}

// Show success toast
function showSuccessToast(message) {
    const toast = document.getElementById('successToast');
    toast.querySelector('span').textContent = message;
    toast.classList.remove('translate-y-full', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
    }, 3000);
}

// Show error toast
function showErrorToast(message) {
    alert(message); // You can implement a proper error toast UI if needed
}

// Handle Login
function handleLogin(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('userEmail', email);
        showSuccessToast('Login successful!');
        hideAuthModal();
        setTimeout(() => {
            window.location.href = 'userLand.html';
        }, 1000);
    } else {
        showErrorToast('Invalid email or password');
    }
}

// Handle Register
function handleRegister(email, password, confirmPass) {
    if (password !== confirmPass) {
        showErrorToast('Passwords do not match');
        return;
    }

    if (!validatePassword(password)) {
        showErrorToast('Password does not meet requirements');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.email === email)) {
        showErrorToast('Email already registered');
        return;
    }

    const newUser = {
        email,
        password,
        tasks: [],
        totalImpact: 0,
        streak: 0
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('userEmail', email);
    
    showSuccessToast('Registration successful!');
    hideAuthModal();
    setTimeout(() => {
        window.location.href = 'userLand.html';
    }, 1000);
}

// Update community statistics
function updateCommunityStats() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const today = new Date().toDateString();
    
    // Calculate total actions and impact
    let totalActionsCount = 0;
    let totalImpactCount = 0;
    let activeUsersCount = 0;
    let totalTreesCount = 0;
    let totalWaterSaved = 0;
    let totalCarbonReduced = 0;

    users.forEach(user => {
        if (user.tasks) {
            user.tasks.forEach(task => {
                totalActionsCount++;
                totalImpactCount += task.impact || 0;

                // Calculate environmental impact
                if (task.type.startsWith('planted')) {
                    totalTreesCount += task.amount || 0;
                } else if (task.type.startsWith('water')) {
                    totalWaterSaved += task.amount || 0;
                } else if (task.type.startsWith('carbon')) {
                    totalCarbonReduced += task.amount || 0;
                }

                // Count active users
                if (new Date(task.timestamp).toDateString() === today) {
                    activeUsersCount++;
                }
            });
        }
    });

    // Update UI
    totalActions.textContent = totalActionsCount;
    communityImpact.textContent = totalImpactCount;
    activeUsers.textContent = activeUsersCount;
    totalTrees.textContent = totalTreesCount;
    waterSaved.textContent = totalWaterSaved;
    carbonReduced.textContent = totalCarbonReduced;

    // Update leaderboard
    updateLeaderboard(users);
}

// Update leaderboard
function updateLeaderboard(users) {
    // Calculate total points for each user from their tasks
    const usersWithPoints = users.map(user => ({
        ...user,
        totalPoints: (user.tasks || []).reduce((sum, task) => sum + (task.impact || 0), 0)
    }));

    // Sort users by total points and get top 5
    const sortedUsers = usersWithPoints
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 5);

    // Update the leaderboard display
    leaderboardList.innerHTML = sortedUsers.map((user, index) => `
        <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full ${index === 0 ? 'bg-yellow-100' : 'bg-gray-100'} flex items-center justify-center">
                    <span class="text-sm font-bold ${index === 0 ? 'text-yellow-600' : 'text-gray-600'}">${index + 1}</span>
                </div>
                <span class="font-medium">${user.email.split('@')[0]}</span>
            </div>
            <span class="text-primary font-semibold">${user.totalPoints} pts</span>
        </div>
    `).join('');
}

// Handle social login
function handleSocialLogin(provider) {
    showToast(`${provider} login is coming soon!`, 'success');
}

// Event Listeners
loginBtn.addEventListener('click', () => showAuthModal('login'));
registerBtn.addEventListener('click', () => showAuthModal('register'));
registerBtnHero.addEventListener('click', () => showAuthModal('register'));
closeAuthModal.addEventListener('click', hideAuthModal);
authSwitchBtn.addEventListener('click', () => {
    const isLogin = authSubmitText.textContent === 'Sign in';
    showAuthModal(isLogin ? 'register' : 'login');
});

togglePassword.addEventListener('click', () => {
    const type = authPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    authPassword.setAttribute('type', type);
    togglePassword.querySelector('i').classList.toggle('fa-eye');
    togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
});

toggleConfirmPassword.addEventListener('click', () => {
    const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPassword.setAttribute('type', type);
    toggleConfirmPassword.querySelector('i').classList.toggle('fa-eye');
    toggleConfirmPassword.querySelector('i').classList.toggle('fa-eye-slash');
});

authPassword.addEventListener('input', () => {
    if (authSubmitText.textContent === 'Create Account') {
        validatePassword(authPassword.value);
    }
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const confirmPass = confirmPassword.value;

    if (!email || !password) {
        showErrorToast('Please fill in all fields');
        return;
    }

    if (authSubmitText.textContent === 'Sign in') {
        handleLogin(email, password);
    } else {
        handleRegister(email, password, confirmPass);
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userEmail');
    showSuccessToast('Logged out successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
});

// Add social login event listeners
document.querySelectorAll('.social-login-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const provider = btn.dataset.provider;
        handleSocialLogin(provider);
    });
});

// Close modal when clicking outside
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        hideAuthModal();
    }
});

// Add keyboard event listener for Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !authModal.classList.contains('hidden')) {
        hideAuthModal();
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    updateCommunityStats();
});
