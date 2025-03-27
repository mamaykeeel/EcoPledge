// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// User authentication state
let currentUser = null;

// Dashboard elements
const userSection = document.getElementById('userSection');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const taskForm = document.getElementById('taskForm');
const taskType = document.getElementById('taskType');
const amountInput = document.getElementById('amountInput');
const taskAmount = document.getElementById('taskAmount');
const unitLabel = document.getElementById('unitLabel');
const otherTaskInput = document.getElementById('otherTaskInput');
const otherTask = document.getElementById('otherTask');
const recentTasks = document.getElementById('recentTasks');
const totalTasks = document.getElementById('totalTasks');
const totalImpact = document.getElementById('totalImpact');
const streak = document.getElementById('streak');

// Task type units and descriptions
const taskUnits = {
    // Carbon Reduction
    'carbon-transport': 'km',
    'carbon-walk': 'km',
    'carbon-bike': 'km',
    'carbon-energy': 'kWh',
    'carbon-food': 'meals',
    'carbon-waste': 'kg',
    
    // Water Conservation
    'water-shower': 'minutes',
    'water-fix': 'faucets',
    'water-reuse': 'liters',
    'water-efficient': 'fixtures',
    
    // Tree Planting
    'planted-tree': 'trees',
    'planted-vegetable': 'plants',
    'planted-flower': 'plants',
    'planted-herb': 'plants',
    
    // Recycling
    'recycle-paper': 'kg',
    'recycle-plastic': 'kg',
    'recycle-metal': 'kg',
    'recycle-glass': 'kg',
    'recycle-electronics': 'items'
};

// Task descriptions
const taskDescriptions = {
    // Carbon Reduction
    'carbon-transport': 'Used public transport instead of driving',
    'carbon-walk': 'Walked instead of using a vehicle',
    'carbon-bike': 'Cycled instead of using a vehicle',
    'carbon-energy': 'Reduced energy consumption',
    'carbon-food': 'Reduced meat consumption',
    'carbon-waste': 'Reduced food waste',
    
    // Water Conservation
    'water-shower': 'Shortened shower time',
    'water-fix': 'Fixed leaking faucet',
    'water-reuse': 'Reused water',
    'water-efficient': 'Installed water-efficient fixtures',
    
    // Tree Planting
    'planted-tree': 'Planted a tree',
    'planted-vegetable': 'Planted vegetables',
    'planted-flower': 'Planted flowers',
    'planted-herb': 'Planted herbs',
    
    // Recycling
    'recycle-paper': 'Recycled paper',
    'recycle-plastic': 'Recycled plastic',
    'recycle-metal': 'Recycled metal',
    'recycle-glass': 'Recycled glass',
    'recycle-electronics': 'Recycled electronics'
};

// Task impact points (base points per unit)
const taskImpact = {
    // Carbon Reduction
    'carbon-transport': 2, // 2 points per km
    'carbon-walk': 3, // 3 points per km
    'carbon-bike': 2, // 2 points per km
    'carbon-energy': 5, // 5 points per kWh
    'carbon-food': 4, // 4 points per meal
    'carbon-waste': 3, // 3 points per kg
    
    // Water Conservation
    'water-shower': 2, // 2 points per minute
    'water-fix': 10, // 10 points per faucet
    'water-reuse': 1, // 1 point per liter
    'water-efficient': 15, // 15 points per fixture
    
    // Tree Planting
    'planted-tree': 15, // 15 points per tree
    'planted-vegetable': 5, // 5 points per plant
    'planted-flower': 3, // 3 points per plant
    'planted-herb': 2, // 2 points per plant
    
    // Recycling
    'recycle-paper': 2, // 2 points per kg
    'recycle-plastic': 3, // 3 points per kg
    'recycle-metal': 4, // 4 points per kg
    'recycle-glass': 2, // 2 points per kg
    'recycle-electronics': 10, // 10 points per item
    'other': 5 // 5 points for other actions
};

// Amount descriptions
const amountDescriptions = {
    // Carbon Reduction
    'carbon-transport': 'Enter the distance traveled in kilometers',
    'carbon-walk': 'Enter the distance walked in kilometers',
    'carbon-bike': 'Enter the distance cycled in kilometers',
    'carbon-energy': 'Enter the energy saved in kilowatt-hours',
    'carbon-food': 'Enter the number of meat-free meals',
    'carbon-waste': 'Enter the amount of food waste reduced in kilograms',
    
    // Water Conservation
    'water-shower': 'Enter the time saved in minutes',
    'water-fix': 'Enter the number of faucets fixed',
    'water-reuse': 'Enter the amount of water reused in liters',
    'water-efficient': 'Enter the number of fixtures installed',
    
    // Tree Planting
    'planted-tree': 'Enter the number of trees planted',
    'planted-vegetable': 'Enter the number of vegetable plants',
    'planted-flower': 'Enter the number of flower plants',
    'planted-herb': 'Enter the number of herb plants',
    
    // Recycling
    'recycle-paper': 'Enter the amount of paper recycled in kilograms',
    'recycle-plastic': 'Enter the amount of plastic recycled in kilograms',
    'recycle-metal': 'Enter the amount of metal recycled in kilograms',
    'recycle-glass': 'Enter the amount of glass recycled in kilograms',
    'recycle-electronics': 'Enter the number of electronic items recycled'
};

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    toast.classList.remove('translate-y-full', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
    }, 3000);
}

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        window.location.href = 'index.html';
        return;
    }

    // Set user name
    document.getElementById('userName').textContent = userEmail.split('@')[0];

    // Initialize dashboard data
    updateUserStats();
    loadRecentTasks();
});

// Update user statistics
function updateUserStats() {
    const userEmail = localStorage.getItem('userEmail');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === userEmail);
    
    if (!user) return;

    // Calculate total tasks
    const totalTasks = user.tasks ? user.tasks.length : 0;
    
    // Calculate total impact
    const totalImpact = user.tasks ? user.tasks.reduce((sum, task) => sum + (task.impact || 0), 0) : 0;
    
    // Calculate streak
    const streak = calculateStreak(user.tasks || []);

    // Update UI
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('totalImpact').textContent = totalImpact;
    document.getElementById('streak').textContent = streak;
}

// Calculate user streak
function calculateStreak(tasks) {
    if (!tasks.length) return 0;
    
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
    
    return streak;
}

// Load recent tasks
function loadRecentTasks() {
    const userEmail = localStorage.getItem('userEmail');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === userEmail);
    
    if (!user || !user.tasks) return;

    const recentTasksContainer = document.getElementById('recentTasks');
    const recentTasks = user.tasks
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

    recentTasksContainer.innerHTML = recentTasks.map(task => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-4">
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <i class="fas ${getTaskIcon(task.type)} text-primary"></i>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-900">${formatTaskType(task.type)}</h3>
                    <p class="text-sm text-gray-600">${new Date(task.timestamp).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="text-right">
                <span class="text-primary font-semibold">${task.impact || 0} pts</span>
                ${task.amount ? `<p class="text-sm text-gray-600">${task.amount} ${getTaskUnit(task.type)}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Get task icon based on type
function getTaskIcon(type) {
    const icons = {
        'carbon-transport': 'fa-bus',
        'carbon-walk': 'fa-walking',
        'carbon-bike': 'fa-bicycle',
        'carbon-energy': 'fa-bolt',
        'carbon-food': 'fa-utensils',
        'carbon-waste': 'fa-trash',
        'water-shower': 'fa-shower',
        'water-fix': 'fa-wrench',
        'water-reuse': 'fa-recycle',
        'water-efficient': 'fa-tint',
        'planted-tree': 'fa-tree',
        'planted-vegetable': 'fa-seedling',
        'planted-flower': 'fa-flower',
        'planted-herb': 'fa-leaf',
        'recycle-paper': 'fa-file-alt',
        'recycle-plastic': 'fa-bottle-water',
        'recycle-metal': 'fa-cog',
        'recycle-glass': 'fa-glass-martini',
        'recycle-electronics': 'fa-laptop',
        'other': 'fa-star'
    };
    return icons[type] || 'fa-star';
}

// Format task type for display
function formatTaskType(type) {
    return type
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Get task unit based on type
function getTaskUnit(type) {
    const units = {
        'carbon-transport': 'km',
        'carbon-walk': 'km',
        'carbon-bike': 'km',
        'carbon-energy': 'kWh',
        'carbon-food': 'kg',
        'carbon-waste': 'kg',
        'water-shower': 'min',
        'water-fix': 'liters',
        'water-reuse': 'liters',
        'water-efficient': 'liters',
        'planted-tree': 'trees',
        'planted-vegetable': 'plants',
        'planted-flower': 'flowers',
        'planted-herb': 'herbs',
        'recycle-paper': 'kg',
        'recycle-plastic': 'kg',
        'recycle-metal': 'kg',
        'recycle-glass': 'kg',
        'recycle-electronics': 'items'
    };
    return units[type] || '';
}

// Handle task form submission
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        showToast('Please log in to add tasks', 'error');
        return;
    }

    const type = taskType.value;
    if (!type) {
        showToast('Please select a task type', 'error');
        return;
    }

    let amount = null;
    let impact = 0;

    if (type === 'other') {
        const description = otherTask.value.trim();
        if (!description) {
            showToast('Please enter a task description', 'error');
            return;
        }
        impact = taskImpact.other;
    } else {
        amount = parseFloat(taskAmount.value);
        if (isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }
        impact = calculateTaskImpact(type, amount);
    }

    // Get current users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find or create user
    let user = users.find(u => u.email === userEmail);
    if (!user) {
        user = { email: userEmail, tasks: [] };
        users.push(user);
    }

    // Add new task
    const newTask = {
        type,
        amount,
        impact,
        timestamp: new Date().toISOString(),
        description: type === 'other' ? otherTask.value.trim() : null
    };

    user.tasks.push(newTask);

    // Update localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Update UI
    updateUserStats();
    loadRecentTasks();

    // Show success message
    showToast('Task added successfully!');

    // Reset form
    taskForm.reset();
    amountInput.classList.add('hidden');
    otherTaskInput.classList.add('hidden');
});

// Calculate task impact
function calculateTaskImpact(type, amount) {
    const impactValues = {
        'carbon-transport': 10,
        'carbon-walk': 5,
        'carbon-bike': 8,
        'carbon-energy': amount ? amount * 0.5 : 5,
        'carbon-food': amount ? amount * 2 : 5,
        'carbon-waste': amount ? amount * 1.5 : 5,
        'water-shower': amount ? amount * 0.5 : 5,
        'water-fix': 10,
        'water-reuse': amount ? amount * 0.3 : 5,
        'water-efficient': 8,
        'planted-tree': 15,
        'planted-vegetable': 5,
        'planted-flower': 3,
        'planted-herb': 2,
        'recycle-paper': amount ? amount * 2 : 5,
        'recycle-plastic': amount ? amount * 3 : 5,
        'recycle-metal': amount ? amount * 4 : 5,
        'recycle-glass': amount ? amount * 2 : 5,
        'recycle-electronics': 10,
        'other': 5
    };
    
    return impactValues[type] || 5;
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
});

// Handle task type change
taskType.addEventListener('change', () => {
    const selectedType = taskType.value;
    amountInput.classList.toggle('hidden', !selectedType || selectedType === 'other');
    otherTaskInput.classList.toggle('hidden', selectedType !== 'other');
    
    if (selectedType && selectedType !== 'other') {
        unitLabel.textContent = taskUnits[selectedType];
        document.getElementById('amountDescription').textContent = amountDescriptions[selectedType];
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
}); 