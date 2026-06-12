// ===========================
// To-Do List Application
// Local Storage Management
// ===========================

class TodoApp {
    constructor() {
        // DOM Elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.totalCountEl = document.getElementById('totalCount');
        this.activeCountEl = document.getElementById('activeCount');
        this.completedCountEl = document.getElementById('completedCount');

        // State
        this.todos = this.loadFromLocalStorage();
        this.currentFilter = 'all';

        // Initialize
        this.init();
    }

    // ===========================
    // Initialization
    // ===========================
    init() {
        this.attachEventListeners();
        this.render();
        this.updateStats();
    }

    attachEventListeners() {
        // Add task on button click
        this.addBtn.addEventListener('click', () => this.addTodo());

        // Add task on Enter key
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Clear buttons
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
    }

    // ===========================
    // CRUD Operations
    // ===========================
    addTodo() {
        const text = this.todoInput.value.trim();

        if (text === '') {
            this.showNotification('Please enter a task');
            return;
        }

        if (text.length > 100) {
            this.showNotification('Task is too long (max 100 characters)');
            return;
        }

        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        this.todos.push(newTodo);
        this.saveToLocalStorage();
        this.todoInput.value = '';
        this.todoInput.focus();
        this.render();
        this.updateStats();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToLocalStorage();
        this.render();
        this.updateStats();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
            this.updateStats();
        }
    }

    clearCompleted() {
        if (this.todos.some(t => t.completed)) {
            if (confirm('Are you sure you want to clear all completed tasks?')) {
                this.todos = this.todos.filter(t => !t.completed);
                this.saveToLocalStorage();
                this.render();
                this.updateStats();
            }
        } else {
            this.showNotification('No completed tasks to clear');
        }
    }

    clearAll() {
        if (this.todos.length > 0) {
            if (confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
                this.todos = [];
                this.saveToLocalStorage();
                this.render();
                this.updateStats();
            }
        } else {
            this.showNotification('No tasks to clear');
        }
    }

    // ===========================
    // Local Storage
    // ===========================
    saveToLocalStorage() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showNotification('Failed to save tasks');
        }
    }

    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('todos');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return [];
        }
    }

    // ===========================
    // Filtering
    // ===========================
    setFilter(filter) {
        this.currentFilter = filter;
        this.updateFilterButtons();
        this.render();
    }

    updateFilterButtons() {
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
        });
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    // ===========================
    // Rendering
    // ===========================
    render() {
        const filteredTodos = this.getFilteredTodos();
        this.todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            this.emptyState.classList.remove('hidden');
            return;
        }

        this.emptyState.classList.add('hidden');

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    data-id="${todo.id}"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <span class="todo-date">${todo.createdAt}</span>
                <button class="delete-btn" data-id="${todo.id}">Delete</button>
            `;

            // Checkbox event
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

            // Delete button event
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

            this.todoList.appendChild(li);
        });
    }

    // ===========================
    // Statistics
    // ===========================
    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;

        this.totalCountEl.textContent = total;
        this.activeCountEl.textContent = active;
        this.completedCountEl.textContent = completed;

        // Enable/disable buttons
        this.clearCompletedBtn.disabled = completed === 0;
        this.clearAllBtn.disabled = total === 0;
    }

    // ===========================
    // Utilities
    // ===========================
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message) {
        // Simple notification (can be enhanced with a toast library)
        console.log(message);
    }
}

// ===========================
// Initialize App
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
