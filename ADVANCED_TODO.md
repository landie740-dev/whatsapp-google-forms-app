# 💡 Advanced To-Do App Features

Enhance your to-do app with professional features.

## Table of Contents
1. [Recurring Tasks](#recurring-tasks)
2. [Due Date Reminders](#due-date-reminders)
3. [Subtasks](#subtasks)
4. [Tags](#tags)
5. [Collaboration](#collaboration)
6. [Analytics](#analytics)
7. [Dark Mode](#dark-mode)
8. [Themes](#themes)

---

## Recurring Tasks

### HTML

```html
<div class="input-group">
    <input type="text" id="todoInput" class="todo-input">
    <select id="recurrenceSelect" class="priority-select">
        <option value="none">Once</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
    </select>
    <button class="add-btn" id="addBtn">Add Task</button>
</div>
```

### JavaScript

```javascript
function createTask(text, priority = 'medium', recurrence = 'none') {
    return {
        id: Date.now(),
        text: text,
        completed: false,
        priority: priority,
        recurrence: recurrence,
        dueDate: new Date(),
        createdAt: new Date().toLocaleDateString()
    };
}

function getNextRecurrence(task) {
    const date = new Date(task.dueDate);
    
    switch(task.recurrence) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
    }
    
    return date;
}

function completeRecurringTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task && task.recurrence !== 'none') {
        // Create new task for next occurrence
        const nextTask = createTask(
            task.text,
            task.priority,
            task.recurrence
        );
        nextTask.dueDate = getNextRecurrence(task);
        tasks.push(nextTask);
    }
    toggleTask(id);
}
```

---

## Due Date Reminders

### JavaScript

```javascript
function checkDueDates() {
    const today = new Date().toDateString();
    
    tasks.forEach(task => {
        if (!task.completed && task.dueDate) {
            const dueDate = new Date(task.dueDate).toDateString();
            
            if (dueDate === today) {
                showNotification(`Reminder: ${task.text}`);
            }
        }
    });
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('To-Do Reminder', {
            body: message,
            icon: '📋'
        });
    }
}

// Request permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Check every minute
setInterval(checkDueDates, 60000);
```

---

## Subtasks

### HTML

```html
<div class="task-item">
    <input type="checkbox" class="checkbox">
    <span class="task-text">Main Task</span>
    <button class="expand-btn">Show Subtasks</button>
    <div class="subtasks" style="display: none;">
        <div class="subtask-item">
            <input type="checkbox" class="subtask-checkbox">
            <span class="subtask-text">Subtask 1</span>
        </div>
    </div>
</div>
```

### JavaScript

```javascript
function createTask(text, priority = 'medium', parentId = null) {
    return {
        id: Date.now(),
        text: text,
        completed: false,
        priority: priority,
        parentId: parentId,
        subtasks: [],
        createdAt: new Date().toLocaleDateString()
    };
}

function addSubtask(parentId, text) {
    const parent = tasks.find(t => t.id === parentId);
    if (parent) {
        const subtask = createTask(text, 'low', parentId);
        parent.subtasks.push(subtask);
        saveTasks();
        render();
    }
}

function toggleSubtask(parentId, subtaskId) {
    const parent = tasks.find(t => t.id === parentId);
    if (parent) {
        const subtask = parent.subtasks.find(s => s.id === subtaskId);
        if (subtask) {
            subtask.completed = !subtask.completed;
            saveTasks();
            render();
        }
    }
}
```

---

## Tags

### HTML

```html
<input type="text" id="tagsInput" placeholder="Add tags (comma separated)">
```

### JavaScript

```javascript
function createTask(text, priority = 'medium', tags = []) {
    return {
        id: Date.now(),
        text: text,
        completed: false,
        priority: priority,
        tags: tags,
        createdAt: new Date().toLocaleDateString()
    };
}

function parseTags(tagString) {
    return tagString.split(',').map(tag => tag.trim()).filter(tag => tag);
}

function addTask() {
    const text = todoInput.value.trim();
    const tagsInput = document.getElementById('tagsInput').value;
    const tags = parseTags(tagsInput);
    
    const task = createTask(text, 'medium', tags);
    tasks.push(task);
    saveTasks();
    render();
}

function filterByTag(tag) {
    return tasks.filter(t => t.tags.includes(tag));
}

function getAllTags() {
    const tagSet = new Set();
    tasks.forEach(t => t.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
}
```

---

## Collaboration

### HTML

```html
<input type="text" id="shareEmail" placeholder="Share with email">
<button id="shareBtn">Share Task</button>
```

### JavaScript

```javascript
const sharedTasks = new Map();

function shareTask(taskId, email) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (!sharedTasks.has(taskId)) {
        sharedTasks.set(taskId, []);
    }
    
    sharedTasks.get(taskId).push(email);
    localStorage.setItem('sharedTasks', JSON.stringify(Object.fromEntries(sharedTasks)));
    
    // Send notification to user
    console.log(`Task shared with ${email}`);
}

function unshareTask(taskId, email) {
    const shared = sharedTasks.get(taskId) || [];
    sharedTasks.set(taskId, shared.filter(e => e !== email));
    localStorage.setItem('sharedTasks', JSON.stringify(Object.fromEntries(sharedTasks)));
}
```

---

## Analytics

### JavaScript

```javascript
function getAnalytics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    
    const byPriority = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
    };
    
    const today = new Date().toDateString();
    const todaysCompleted = tasks.filter(t => 
        t.completed && new Date(t.createdAt).toDateString() === today
    ).length;
    
    return {
        total,
        completed,
        completionRate,
        byPriority,
        todaysCompleted,
        productivity: Math.round(todaysCompleted / total * 100 || 0)
    };
}

function displayAnalytics() {
    const stats = getAnalytics();
    console.log('Analytics:', stats);
    // Display in UI
}
```

---

## Dark Mode

### HTML

```html
<button id="darkModeToggle" class="dark-mode-btn">🌙</button>
```

### CSS

```css
body.dark-mode {
    background: #1a1a1a;
    color: #fff;
}

body.dark-mode .container {
    background: #2d2d2d;
    color: #fff;
}

body.dark-mode .task-item {
    background: #333;
}

body.dark-mode .todo-input {
    background: #333;
    color: #fff;
    border-color: #555;
}
```

### JavaScript

```javascript
const darkModeToggle = document.getElementById('darkModeToggle');
const isDarkMode = localStorage.getItem('darkMode') === 'true';

if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
}

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
});
```

---

## Themes

### CSS

```css
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --success: #4caf50;
    --danger: #f44336;
    --warning: #ff9800;
}

body.theme-ocean {
    --primary: #006994;
    --secondary: #4db8ff;
}

body.theme-forest {
    --primary: #2d5016;
    --secondary: #558b2f;
}

body.theme-sunset {
    --primary: #ff6b6b;
    --secondary: #ffa94d;
}

.header {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
}
```

### JavaScript

```javascript
function setTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme') || 'default';
setTheme(savedTheme);
```

---

## Performance Tips

✅ Debounce save operations
✅ Use virtual scrolling for large lists
✅ Lazy load subtasks
✅ Cache frequently accessed data
✅ Use IndexedDB for large datasets

---

Enjoy building! 🚀
