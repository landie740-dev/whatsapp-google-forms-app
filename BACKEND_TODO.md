# 🚀 Backend To-Do App with Node.js & Express

Add a backend to your to-do app for multi-device sync and cloud storage.

## Setup

```bash
npm init -y
npm install express mongoose dotenv cors
npm install --save-dev nodemon
```

## server.js

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB error:', err));

// Task Schema
const taskSchema = new mongoose.Schema({
    userId: String,
    text: {
        type: String,
        required: true,
        maxlength: 100
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    category: String,
    dueDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model('Task', taskSchema);

// Routes

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create task
app.post('/api/tasks', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## Updated Frontend Script

```javascript
const API_URL = 'http://localhost:5000/api';

// Replace saveTasks with API call
async function saveTasks() {
    for (const task of tasks) {
        if (!task.id.startsWith('temp_')) {
            await fetch(`${API_URL}/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            });
        }
    }
}

// Replace addTask with API call
async function addTask() {
    const text = todoInput.value.trim();
    if (!text) return;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                priority: 'medium',
                completed: false
            })
        });

        const task = await response.json();
        tasks.push(task);
        todoInput.value = '';
        render();
    } catch (err) {
        console.error('Error adding task:', err);
    }
}

// Load tasks from API
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        tasks = await response.json();
    } catch (err) {
        // Fallback to localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        tasks = saved ? JSON.parse(saved) : [];
    }
}
```

## package.json

```json
{
  "name": "todo-app-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",
    "dotenv": "^16.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
```

## .env

```
MONGODB_URI=mongodb://localhost:27017/todoapp
PORT=5000
NODE_ENV=development
```

---

Your to-do app now supports:
✅ Cloud storage
✅ Multi-device sync
✅ Persistent data
✅ API-based architecture
