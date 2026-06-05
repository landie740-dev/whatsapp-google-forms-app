# 📝 To-Do List Application with Local Storage

A complete guide to creating a full-stack to-do list application with local storage functionality.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Frontend (HTML/CSS/JS)](#frontend)
3. [Backend (Node.js/Express)](#backend)
4. [Local Storage Implementation](#local-storage)
5. [Features](#features)
6. [Deployment](#deployment)

---

## Quick Start

Create a new directory:

```bash
mkdir todo-app
cd todo-app
```

Your app structure will be:
```
todo-app/
├── index.html
├── style.css
├── script.js
└── README.md
```

That's it! No build tools needed for the basic version.

---

## Frontend

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My To-Do List</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <h1>📋 My To-Do List</h1>
            <p class="subtitle">Stay organized and productive</p>
        </header>

        <!-- Input Section -->
        <div class="input-section">
            <div class="input-group">
                <input 
                    type="text" 
                    id="todoInput" 
                    class="todo-input" 
                    placeholder="Add a new task..."
                    autocomplete="off"
                >
                <button class="add-btn" id="addBtn">Add Task</button>
            </div>
        </div>

        <!-- Filter Buttons -->
        <div class="filter-section">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="active">Active</button>
            <button class="filter-btn" data-filter="completed">Completed</button>
        </div>

        <!-- Task Stats -->
        <div class="stats">
            <span>Total: <strong id="totalCount">0</strong></span>
            <span>Completed: <strong id="completedCount">0</strong></span>
            <span>Remaining: <strong id="remainingCount">0</strong></span>
        </div>

        <!-- Tasks List -->
        <div class="tasks-section">
            <ul class="tasks-list" id="tasksList">
                <!-- Tasks will be added here -->
            </ul>
            <div class="empty-state" id="emptyState">
                <p>📭 No tasks yet. Add one to get started!</p>
            </div>
        </div>

        <!-- Actions -->
        <div class="actions">
            <button class="action-btn" id="clearCompletedBtn">Clear Completed</button>
            <button class="action-btn danger" id="clearAllBtn">Clear All</button>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

### style.css

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
    color: #333;
}

.container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header */
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px 20px;
    text-align: center;
}

.header h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
}

.subtitle {
    font-size: 0.95em;
    opacity: 0.9;
}

/* Input Section */
.input-section {
    padding: 20px;
    border-bottom: 2px solid #f0f0f0;
}

.input-group {
    display: flex;
    gap: 10px;
}

.todo-input {
    flex: 1;
    padding: 12px 15px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1em;
    transition: all 0.3s ease;
}

.todo-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.add-btn {
    padding: 12px 25px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.add-btn:active {
    transform: translateY(0);
}

/* Filter Section */
.filter-section {
    display: flex;
    gap: 10px;
    padding: 15px 20px;
    border-bottom: 1px solid #f0f0f0;
    justify-content: center;
}

.filter-btn {
    padding: 8px 16px;
    border: 2px solid #e0e0e0;
    background: white;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    color: #666;
}

.filter-btn:hover {
    border-color: #667eea;
    color: #667eea;
}

.filter-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
}

/* Stats */
.stats {
    display: flex;
    gap: 20px;
    padding: 15px 20px;
    background: #f8f9fa;
    justify-content: center;
    font-size: 0.95em;
    color: #666;
}

.stats strong {
    color: #667eea;
    font-size: 1.1em;
}

/* Tasks Section */
.tasks-section {
    min-height: 200px;
    padding: 20px;
    max-height: 400px;
    overflow-y: auto;
}

.tasks-list {
    list-style: none;
}

.task-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 10px;
    transition: all 0.3s ease;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateX(-10px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.task-item:hover {
    background: #eef2ff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
    opacity: 0.6;
}

.task-item.completed .task-text {
    text-decoration: line-through;
    color: #999;
}

.checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #667eea;
}

.task-text {
    flex: 1;
    word-break: break-word;
    font-size: 1em;
}

.priority {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    font-weight: 600;
    text-transform: uppercase;
}

.priority.high {
    background: #ffebee;
    color: #c62828;
}

.priority.medium {
    background: #fff3e0;
    color: #e65100;
}

.priority.low {
    background: #e8f5e9;
    color: #2e7d32;
}

.task-date {
    font-size: 0.85em;
    color: #999;
}

.delete-btn {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.3s ease;
}

.delete-btn:hover {
    background: #ff5252;
    transform: scale(1.05);
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #ccc;
    font-size: 1.1em;
    display: none;
}

.empty-state.show {
    display: block;
}

/* Actions */
.actions {
    display: flex;
    gap: 10px;
    padding: 20px;
    border-top: 2px solid #f0f0f0;
    justify-content: center;
}

.action-btn {
    padding: 10px 20px;
    border: 2px solid #e0e0e0;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

.action-btn:hover {
    border-color: #667eea;
    color: #667eea;
}

.action-btn.danger {
    border-color: #ff6b6b;
    color: #ff6b6b;
}

.action-btn.danger:hover {
    background: #ffebee;
}

/* Scrollbar */
.tasks-section::-webkit-scrollbar {
    width: 8px;
}

.tasks-section::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.tasks-section::-webkit-scrollbar-thumb {
    background: #667eea;
    border-radius: 10px;
}

.tasks-section::-webkit-scrollbar-thumb:hover {
    background: #764ba2;
}

/* Responsive */
@media (max-width: 600px) {
    .container {
        border-radius: 0;
    }

    .header h1 {
        font-size: 1.8em;
    }

    .input-group {
        flex-direction: column;
    }

    .add-btn {
        width: 100%;
    }

    .stats {
        flex-wrap: wrap;
        gap: 10px;
    }

    .filter-section {
        flex-wrap: wrap;
    }
}
```

### script.js

```javascript
// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
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
function createTask(text, priority = 'medium') {
    return {
        id: Date.now(),
        text: text,
        completed: false,
        priority: priority,
        createdAt: new Date().toLocaleDateString()
    };
}

function addTask() {
    const text = todoInput.value.trim();
    
    if (!text) {
        alert('Please enter a task!');
        return;
    }

    if (text.length > 100) {
        alert('Task is too long (max 100 characters)');
        return;
    }

    const task = createTask(text, 'medium');
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
            <span class="priority ${task.priority}">${task.priority}</span>
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
```

---

## Local Storage

### What is Local Storage?

Local Storage is a browser API that allows you to store data on the user's device.

**Key Features:**
- Data persists even after browser closes
- ~5-10MB storage per domain
- Simple key-value storage
- Synchronous API
- No expiration (until manually cleared)

### How Our App Uses Local Storage

```javascript
// Save data
localStorage.setItem('key', JSON.stringify(data));

// Load data
const data = JSON.parse(localStorage.getItem('key'));

// Remove data
localStorage.removeItem('key');

// Clear all
localStorage.clear();
```

### Data Flow

```
User Action
    ↓
Modify tasks array
    ↓
Call saveTasks()
    ↓
localStorage.setItem()
    ↓
Data saved to browser
    ↓
Page reload
    ↓
loadTasks()
    ↓
Data restored from localStorage
```

---

## Features

✅ **Core Features:**
- Add tasks
- Mark tasks as complete
- Delete tasks
- Filter (All, Active, Completed)
- View statistics
- Clear completed tasks
- Clear all tasks

✅ **Persistence:**
- Auto-save to Local Storage
- Restore on page reload
- Remember filter preference

✅ **UI/UX:**
- Beautiful gradient design
- Smooth animations
- Responsive mobile design
- Empty state message
- Task counters
- Priority indicators
- Date created display

✅ **Accessibility:**
- Semantic HTML
- Keyboard support (Enter to add)
- Focus states
- Color contrast

---

## Advanced Features (Optional)

### Add Priority Selector

Update HTML input section:

```html
<div class="input-group">
    <input 
        type="text" 
        id="todoInput" 
        class="todo-input" 
        placeholder="Add a new task..."
    >
    <select id="prioritySelect" class="priority-select">
        <option value="low">Low</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High</option>
    </select>
    <button class="add-btn" id="addBtn">Add Task</button>
</div>
```

Update addTask function:

```javascript
function addTask() {
    const text = todoInput.value.trim();
    const priority = document.getElementById('prioritySelect').value;
    
    if (!text) return;
    
    const task = createTask(text, priority);
    tasks.push(task);
    saveTasks();
    
    todoInput.value = '';
    render();
}
```

### Add Due Dates

```javascript
function createTask(text, priority = 'medium', dueDate = null) {
    return {
        id: Date.now(),
        text: text,
        completed: false,
        priority: priority,
        dueDate: dueDate,
        createdAt: new Date().toLocaleDateString()
    };
}
```

### Add Search/Filter

```javascript
const searchInput = document.getElementById('searchInput');

function filterTasks(searchTerm) {
    return tasks.filter(task => 
        task.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

searchInput.addEventListener('input', (e) => {
    const filtered = filterTasks(e.target.value);
    // Render filtered tasks
});
```

### Add Drag & Drop

```javascript
const tasksList = document.getElementById('tasksList');
let draggedItem = null;

tasksList.addEventListener('dragstart', (e) => {
    draggedItem = e.target.closest('.task-item');
    e.target.closest('.task-item').style.opacity = '0.5';
});

tasksList.addEventListener('dragend', (e) => {
    e.target.closest('.task-item').style.opacity = '1';
    draggedItem = null;
});

tasksList.addEventListener('dragover', (e) => {
    e.preventDefault();
});

tasksList.addEventListener('drop', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(tasksList, e.clientY);
    if (afterElement == null) {
        tasksList.appendChild(draggedItem);
    } else {
        tasksList.insertBefore(draggedItem, afterElement);
    }
});
```

### Add Categories

```javascript
function createTask(text, priority = 'medium', category = 'general') {
    return {
        id: Date.now(),
        text: text,
        completed: false,
        priority: priority,
        category: category,
        createdAt: new Date().toLocaleDateString()
    };
}

const CATEGORIES = ['general', 'work', 'personal', 'shopping', 'health'];
```

### Add Export/Import

```javascript
function exportTasks() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks_${new Date().toISOString()}.json`;
    link.click();
}

function importTasks(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            tasks = [...tasks, ...imported];
            saveTasks();
            render();
        } catch (error) {
            alert('Invalid file format');
        }
    };
    reader.readAsText(file);
}
```

---

## Deployment

### Option 1: GitHub Pages (Free)

1. Create GitHub repository `username.github.io` (or `repo-name`)
2. Push your files
3. Enable GitHub Pages in settings
4. Visit `https://username.github.io` or `https://username.github.io/repo-name`

### Option 2: Netlify (Free)

1. Go to https://netlify.com
2. Drag and drop your folder
3. Or connect GitHub repo
4. Done! Your app is live

### Option 3: Vercel (Free)

1. Go to https://vercel.com
2. Import your GitHub repository
3. Deploy with one click

### Option 4: Simple Server

For local testing:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npm install -g http-server)
http-server

# Using Node.js built-in
node -e "require('http').createServer((req,res)=>require('fs').createReadStream('.'+req.url).pipe(res)).listen(8000)"
```

Then visit `http://localhost:8000`

---

## Project Structure

### Simple Version (File-based)
```
todo-app/
├── index.html
├── style.css
├── script.js
└── README.md
```

### Advanced Version (With Backend)
```
todo-app/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── models/
│   │   └── Task.js
│   └── routes/
│       └── tasks.js
└── README.md
```

---

## Browser Support

✅ Chrome 4+
✅ Firefox 3.5+
✅ Safari 4+
✅ IE 8+
✅ Edge
✅ Opera 10.5+
✅ Mobile browsers

---

## Tips & Best Practices

✅ **Always validate input** - Check for empty strings, length limits
✅ **Escape HTML** - Prevent XSS attacks
✅ **Handle errors** - Try/catch for JSON parsing
✅ **Backup important data** - Export regularly
✅ **Use meaningful IDs** - Use timestamps or UUIDs
✅ **Test across browsers** - Especially Safari and Firefox
✅ **Optimize performance** - Don't save on every keystroke
✅ **Consider quota** - Local Storage has limits

---

## Troubleshooting

**Tasks not saving?**
- Check browser's privacy settings
- Try private/incognito mode
- Check localStorage is enabled

**Data lost?**
- Browser may clear localStorage in private mode
- Try exporting before clearing browser data

**Performance issues?**
- Limit number of tasks
- Use pagination
- Consider moving to IndexedDB for large datasets

---

## Next Steps

1. **Add Database** - Use Firebase, MongoDB, or PostgreSQL
2. **Add Authentication** - User accounts, login
3. **Add Sync** - Sync across devices
4. **Add Offline Support** - Service Workers, Progressive Web App
5. **Add Notifications** - Browser push notifications
6. **Add Collaboration** - Share tasks with others
7. **Add Mobile App** - React Native, Flutter

---

## License

Free to use and modify for personal or commercial projects.

---

Happy organizing! 📝✨
