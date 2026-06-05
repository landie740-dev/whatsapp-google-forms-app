// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const exportBtn = document.getElementById('exportBtn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const remainingCount = document.getElementById('remainingCount');

// State
let tasks = [];
let currentFilter = 'all';

const STORAGE_KEY = 'todoTasks';
const FILTER_KEY = 'todoFilter';

// Local Storage Functions
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    tasks = saved ? JSON.parse(saved) : [];
}

function loadFilter() {
    const saved = localStorage.getItem(FILTER_KEY);
    currentFilter = saved || 'all';
}

// Task Functions
function createTask(text) {
    return {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleDateString()
    };
}

function addTask() {
    const text = todoInput.value.trim();
    
    if (!text) {
        alert('Please enter a task!');
        todoInput.focus();
        return;
    }

    if (text.length > 100) {
        alert('Task is too long (max 100 characters)');
        return;
    }

    const task = createTask(text);
    tasks.push(task);
    saveTasks();
    
    todoInput.value = '';
    todoInput.focus();
    
    render();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    render();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        render();
    }
}

function clearCompleted() {
    if (confirm('Clear all completed tasks?')) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        render();
    }
}

function clearAll() {
    if (confirm('Are you sure? This will delete all tasks!')) {
        tasks = [];
        saveTasks();
        render();
    }
}

function exportTasks() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Filter Functions
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

function setFilter(filter) {
    currentFilter = filter;
    localStorage.setItem(FILTER_KEY, filter);
    
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    render();
}

// Render Functions
function renderTasks() {
    tasksList.innerHTML = '';
    const filtered = getFilteredTasks();
    
    if (filtered.length === 0) {
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    
    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                data-id="${task.id}"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <span class="task-date">${task.createdAt}</span>
            <button class="delete-btn" data-id="${task.id}">Delete</button>
        `;
        tasksList.appendChild(li);
    });
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    
    totalCount.textContent = total;
    completedCount.textContent = completed;
    remainingCount.textContent = remaining;
}

function render() {
    renderTasks();
    updateStats();
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
addBtn.addEventListener('click', addTask);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

clearCompletedBtn.addEventListener('click', clearCompleted);
clearAllBtn.addEventListener('click', clearAll);
exportBtn.addEventListener('click', exportTasks);

tasksList.addEventListener('change', (e) => {
    if (e.target.classList.contains('checkbox')) {
        toggleTask(parseInt(e.target.dataset.id));
    }
});

tasksList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        deleteTask(parseInt(e.target.dataset.id));
    }
});

// Initialize
loadTasks();
loadFilter();
render();

// Set active filter button
filterBtns.forEach(btn => {
    if (btn.dataset.filter === currentFilter) {
        btn.classList.add('active');
    }
});

console.log('To-Do App Loaded! Tasks stored in Local Storage.');
