// Check if user is logged in
const userEmail = localStorage.getItem('userEmail');
if (!userEmail) {
    window.location.href = 'index.html';
}

// Set user name from email
const userName = userEmail.split('@')[0];
document.getElementById('userName').textContent = userName;
document.getElementById('userNameWelcome').textContent = userName;

// Function to get user data
function getUserData() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.email === userEmail) || { tasks: [] };
}

// Function to calculate total tasks and points
function calculateStats(tasks) {
    const totalTasks = tasks.length;
    const totalPoints = tasks.reduce((total, task) => total + (task.impact || 0), 0);
    
    // Calculate day streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = today;
    
    // Sort tasks by date
    const sortedTasks = [...tasks].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    for (const task of sortedTasks) {
        const taskDate = new Date(task.timestamp);
        taskDate.setHours(0, 0, 0, 0);
        
        if (taskDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (taskDate.getTime() === currentDate.getTime() - 86400000) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return { totalTasks, totalPoints, dayStreak: streak };
}

// Function to update all dashboard stats
function updateDashboardStats() {
    const user = getUserData();
    const stats = calculateStats(user.tasks || []);

    // Update stats in the dashboard
    document.getElementById('totalTasks').textContent = stats.totalTasks;
    document.getElementById('totalImpact').textContent = stats.totalPoints;
    document.getElementById('streak').textContent = stats.dayStreak;
}

// Function to update recent tasks
function updateRecentTasks() {
    const user = getUserData();
    const recentTasksContainer = document.getElementById('recentTasks');
    
    if (recentTasksContainer) {
        const recentTasks = (user.tasks || [])
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        recentTasksContainer.innerHTML = recentTasks.map(task => `
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                    <h3 class="font-semibold text-gray-900">${formatTaskType(task.type)}</h3>
                    <p class="text-sm text-gray-600">${new Date(task.timestamp).toLocaleDateString()}</p>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-primary">${task.impact || 0} pts</p>
                    ${task.amount ? `<p class="text-sm text-gray-600">${task.amount} ${getTaskUnit(task.type)}</p>` : ''}
                </div>
            </div>
        `).join('');
    }
}

// Function to format task type for display
function formatTaskType(type) {
    return type
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Function to get task unit based on type
function getTaskUnit(type) {
    const units = {
        'carbon-transport': 'km',
        'carbon-walk': 'km',
        'carbon-bike': 'km',
        'carbon-energy': 'kWh',
        'carbon-food': 'meals',
        'carbon-waste': 'kg',
        'water-shower': 'minutes',
        'water-fix': 'faucets',
        'water-reuse': 'liters',
        'water-efficient': 'fixtures',
        'planted-tree': 'trees',
        'planted-vegetable': 'plants',
        'planted-flower': 'plants',
        'planted-herb': 'plants',
        'recycle-paper': 'kg',
        'recycle-plastic': 'kg',
        'recycle-metal': 'kg',
        'recycle-glass': 'kg',
        'recycle-electronics': 'items'
    };
    return units[type] || 'items';
}

// Badge definitions
const BADGES = {
    treePlanter: {
        id: 'tree-planter',
        title: 'Tree Planter',
        description: 'Successfully planted 10 trees',
        icon: 'tree',
        color: 'green',
        requirement: {
            type: 'planted-tree',
            target: 10,
            unit: 'trees'
        }
    },
    cyclist: {
        id: 'cyclist',
        title: 'Cyclist',
        description: 'Cycled 100km',
        icon: 'bicycle',
        color: 'blue',
        requirement: {
            type: 'carbon-bike',
            target: 100,
            unit: 'km'
        }
    },
    solarHero: {
        id: 'solar-hero',
        title: 'Solar Hero',
        description: 'Used 100kWh of solar energy',
        icon: 'sun',
        color: 'purple',
        requirement: {
            type: 'carbon-energy',
            target: 100,
            unit: 'kWh'
        }
    },
    recyclingPro: {
        id: 'recycling-pro',
        title: 'Recycling Pro',
        description: 'Recycled 50kg of materials',
        icon: 'recycle',
        color: 'orange',
        requirement: {
            type: ['recycle-paper', 'recycle-plastic', 'recycle-metal', 'recycle-glass', 'recycle-electronics'],
            target: 50,
            unit: 'kg'
        }
    }
};

// Function to check and award badges
function checkAndAwardBadges() {
    const user = getUserData();
    const tasks = user.tasks || [];
    const earnedBadges = user.earnedBadges || [];
    
    // Calculate progress for each badge requirement
    for (const [key, badge] of Object.entries(BADGES)) {
        if (!earnedBadges.includes(badge.id)) {
            let progress = 0;
            
            if (Array.isArray(badge.requirement.type)) {
                // For badges with multiple task types
                progress = tasks.reduce((total, task) => {
                    if (badge.requirement.type.includes(task.type)) {
                        return total + (Number(task.amount) || 0);
                    }
                    return total;
                }, 0);
            } else {
                // For badges with single task type
                progress = tasks.reduce((total, task) => {
                    if (task.type === badge.requirement.type) {
                        return total + (Number(task.amount) || 0);
                    }
                    return total;
                }, 0);
            }
            
            // Award badge if requirement is met
            if (progress >= badge.requirement.target) {
                earnedBadges.push(badge.id);
                showBadgeNotification(badge);
            }
        }
    }
    
    // Update user's earned badges
    user.earnedBadges = earnedBadges;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === userEmail);
    if (userIndex !== -1) {
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Function to show badge notification
function showBadgeNotification(badge) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3 animate-fade-in-up';
    notification.innerHTML = `
        <div class="bg-${badge.color}-100 p-2 rounded-full">
            <i class="fas fa-${badge.icon} text-${badge.color}-600"></i>
        </div>
        <div>
            <h3 class="font-semibold text-gray-900">New Badge Earned!</h3>
            <p class="text-sm text-gray-600">${badge.title}</p>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Function to update badges display
function updateBadgesDisplay() {
    const user = getUserData();
    const earnedBadges = user.earnedBadges || [];
    const badgesContainer = document.querySelector('#awardsModal .grid');
    
    if (badgesContainer) {
        badgesContainer.innerHTML = Object.values(BADGES).map(badge => `
            <div class="bg-white rounded-lg shadow-sm p-4 text-center ${earnedBadges.includes(badge.id) ? 'opacity-100' : 'opacity-50'}">
                <div class="bg-${badge.color}-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-${badge.icon} text-${badge.color}-600 text-2xl"></i>
                </div>
                <h3 class="font-semibold text-gray-900">${badge.title}</h3>
                <p class="text-sm text-gray-600 mt-1">${badge.description}</p>
                ${!earnedBadges.includes(badge.id) ? `
                    <div class="mt-2 text-sm text-gray-500">
                        <i class="fas fa-lock mr-1"></i>Locked
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
}

// Function to update all data
function updateAllData() {
    const user = getUserData();
    if (!user) {
        console.error('User not found');
        return;
    }

    // Update leaderboard
    updateLeaderboard();
    
    // Update achievements
    updateAchievements();
    
    // Update achievements modal
    updateAchievementsModal();
    
    // Check and award badges
    checkAndAwardBadges();
}

// Function to update leaderboard
function updateLeaderboard() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const leaderboardData = users
        .map(user => ({
            name: user.email.split('@')[0],
            points: (user.tasks || []).reduce((total, task) => total + (task.impact || 0), 0)
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 2);

    const leaderboardContainer = document.querySelector('.bg-white.rounded-xl.shadow-sm.p-6 .space-y-4');
    if (leaderboardContainer) {
        if (leaderboardData.length === 0) {
            leaderboardContainer.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    No users found. Start adding tasks to see the leaderboard!
                </div>
            `;
        } else {
            leaderboardContainer.innerHTML = leaderboardData.map((user, index) => `
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full ${index === 0 ? 'bg-yellow-100' : 'bg-gray-100'} flex items-center justify-center">
                        <span class="text-sm font-bold ${index === 0 ? 'text-yellow-600' : 'text-gray-600'}">${index + 1}</span>
                    </div>
                    <div class="ml-4 flex-1">
                        <p class="font-semibold text-gray-900">${user.name}</p>
                        <p class="text-sm text-gray-600">${user.points} points</p>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Function to update achievements
function updateAchievements() {
    const user = getUserData();
    const tasks = user.tasks || [];
    
    // Initialize achievement counters
    const achievements = {
        treePlanter: {
            current: 0,
            target: 10,
            unit: 'trees',
            taskTypes: ['planted-tree']
        },
        cyclist: {
            current: 0,
            target: 100,
            unit: 'km',
            taskTypes: ['carbon-bike']
        },
        solarHero: {
            current: 0,
            target: 100,
            unit: 'kWh',
            taskTypes: ['carbon-energy']
        },
        recyclingPro: {
            current: 0,
            target: 50,
            unit: 'kg',
            taskTypes: ['recycle-paper', 'recycle-plastic', 'recycle-metal', 'recycle-glass', 'recycle-electronics']
        }
    };

    // Calculate progress for each achievement
    tasks.forEach(task => {
        if (achievements.treePlanter.taskTypes.includes(task.type)) {
            achievements.treePlanter.current += Number(task.amount || 1);
        }
        if (achievements.cyclist.taskTypes.includes(task.type)) {
            achievements.cyclist.current += Number(task.amount || 0);
        }
        if (achievements.solarHero.taskTypes.includes(task.type)) {
            achievements.solarHero.current += Number(task.amount || 0);
        }
        if (achievements.recyclingPro.taskTypes.includes(task.type)) {
            achievements.recyclingPro.current += Number(task.amount || 0);
        }
    });

    // Update UI for each achievement
    const achievementElements = {
        treePlanter: document.querySelector('.bg-green-50'),
        cyclist: document.querySelector('.bg-blue-50'),
        solarHero: document.querySelector('.bg-purple-50'),
        recyclingPro: document.querySelector('.bg-orange-50')
    };

    for (const [key, achievement] of Object.entries(achievements)) {
        const element = achievementElements[key];
        if (element) {
            const progressBar = element.querySelector('.bg-primary');
            const progressText = element.querySelector('.text-gray-600.mt-1');
            const progress = Math.min((achievement.current / achievement.target) * 100, 100);
            
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}% complete (${achievement.current}/${achievement.target} ${achievement.unit})`;
        }
    }
}

// Function to update achievements display in modal
function updateAchievementsModal() {
    const user = getUserData();
    const tasks = user.tasks || [];
    
    // Initialize achievement counters
    const achievements = {
        treePlanter: {
            title: 'Tree Planter',
            description: 'Plant 10 trees to earn this badge',
            current: 0,
            target: 10,
            unit: 'trees',
            taskTypes: ['planted-tree'],
            icon: 'tree',
            bgColor: 'green'
        },
        cyclist: {
            title: 'Cyclist',
            description: 'Cycle 100km to earn this badge',
            current: 0,
            target: 100,
            unit: 'km',
            taskTypes: ['carbon-bike'],
            icon: 'bicycle',
            bgColor: 'blue'
        },
        solarHero: {
            title: 'Solar Hero',
            description: 'Use 100kWh of solar energy',
            current: 0,
            target: 100,
            unit: 'kWh',
            taskTypes: ['carbon-energy'],
            icon: 'sun',
            bgColor: 'purple'
        },
        recyclingPro: {
            title: 'Recycling Pro',
            description: 'Recycle 50kg of materials',
            current: 0,
            target: 50,
            unit: 'kg',
            taskTypes: ['recycle-paper', 'recycle-plastic', 'recycle-metal', 'recycle-glass', 'recycle-electronics'],
            icon: 'recycle',
            bgColor: 'orange'
        }
    };

    // Calculate progress for each achievement
    tasks.forEach(task => {
        if (achievements.treePlanter.taskTypes.includes(task.type)) {
            achievements.treePlanter.current += Number(task.amount || 1);
        }
        if (achievements.cyclist.taskTypes.includes(task.type)) {
            achievements.cyclist.current += Number(task.amount || 0);
        }
        if (achievements.solarHero.taskTypes.includes(task.type)) {
            achievements.solarHero.current += Number(task.amount || 0);
        }
        if (achievements.recyclingPro.taskTypes.includes(task.type)) {
            achievements.recyclingPro.current += Number(task.amount || 0);
        }
    });

    // Separate completed and in-progress achievements
    const completedAchievements = [];
    const inProgressAchievements = [];

    for (const [key, achievement] of Object.entries(achievements)) {
        const progress = Math.min((achievement.current / achievement.target) * 100, 100);
        const achievementElement = `
            <div class="p-4 bg-${achievement.bgColor}-50 rounded-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-gray-900">${achievement.title}</h3>
                        <p class="text-sm text-gray-600 mt-1">${achievement.description}</p>
                        <div class="mt-2">
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-primary h-2 rounded-full" style="width: ${progress}%"></div>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">${Math.round(progress)}% complete (${achievement.current}/${achievement.target} ${achievement.unit})</p>
                        </div>
                    </div>
                    <i class="fas fa-${achievement.icon} text-primary text-xl"></i>
                </div>
            </div>
        `;

        if (progress >= 100) {
            completedAchievements.push(achievementElement);
        } else {
            inProgressAchievements.push(achievementElement);
        }
    }

    // Update the modal content
    document.getElementById('completedAchievements').innerHTML = completedAchievements.join('');
    document.getElementById('inProgressAchievements').innerHTML = inProgressAchievements.join('');
}

// Add event listeners for awards modal
document.getElementById('viewAwardsBtn').addEventListener('click', () => {
    const modal = document.getElementById('awardsModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    updateBadgesDisplay();
});

document.getElementById('closeAwardsModal').addEventListener('click', () => {
    const modal = document.getElementById('awardsModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
});

// Close modal when clicking outside
document.getElementById('awardsModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        e.currentTarget.classList.add('hidden');
        e.currentTarget.classList.remove('flex');
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateAllData();
    setupRealTimeUpdates();
});

// Set up real-time updates
function setupRealTimeUpdates() {
    // Update every 30 seconds
    setInterval(updateAllData, 30000);

    // Listen for storage changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'users') {
            updateAllData();
        }
    });
}

// Function to clear all data
window.clearAllData = function() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.clear();
        window.location.reload();
    }
}

// Add event listener for logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}); 