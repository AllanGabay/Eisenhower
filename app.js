        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const matrixContainer = document.getElementById('matrix-container');
            const searchInput = document.getElementById('search-input');
            const categoryFilter = document.getElementById('category-filter');
            const exportBtn = document.getElementById('export-btn');
            const importBtn = document.getElementById('import-btn');
            const importFile = document.getElementById('import-file');
            const taskModal = document.getElementById('task-modal');
            const confirmModal = document.getElementById('confirm-modal');
            const taskForm = document.getElementById('task-form');
            const categoriesList = document.getElementById('categories-list');
            
            // State
            let tasks = [];
            let currentTaskId = null;
            let draggedTask = null;
            let searchTerm = '';
            let selectedCategory = '';
            
            // Initialize the app
            init();

            async function init() {
                await loadTasks();
                generateRecurringTasks();
                setupEventListeners();
                requestNotificationPermission();
                scheduleNotifications();
            }
            
            function setupEventListeners() {
                // Search and filter
                searchInput.addEventListener('input', function() {
                    searchTerm = this.value.toLowerCase();
                    filterTasks();
                });
                
                categoryFilter.addEventListener('change', function() {
                    selectedCategory = this.value;
                    filterTasks();
                });
                
                // Import/Export
                exportBtn.addEventListener('click', exportTasks);
                importBtn.addEventListener('click', () => importFile.click());
                importFile.addEventListener('change', importTasks);
                
                // Task modal
                document.getElementById('new-task').addEventListener('click', function() {
                    openTaskModal();
                });
                
                document.getElementById('close-modal').addEventListener('click', closeTaskModal);
                document.getElementById('cancel-task').addEventListener('click', closeTaskModal);
                taskForm.addEventListener('submit', saveTask);
                
                // Confirm modal
                document.getElementById('close-confirm-modal').addEventListener('click', closeConfirmModal);
                document.getElementById('cancel-delete').addEventListener('click', closeConfirmModal);
                document.getElementById('confirm-delete').addEventListener('click', deleteTaskConfirmed);
                
                // Clear category button
                document.getElementById('clear-category').addEventListener('click', function() {
                    document.getElementById('task-category').value = '';
                });
                
                // Drag and drop setup
                setupDragAndDrop();
            }
            
            // Task CRUD Operations
            async function loadTasks() {
                tasks = await storage.loadTasks();
                renderTasks();
                updateStats();
                updateCategoryFilter();
            }

            async function saveTasks() {
                await storage.saveTasks(tasks);
                updateStats();
                updateCategoryFilter();
            }
            
            function addTask(task) {
                tasks.push(task);
                saveTasks();
                renderTasks();
            }
            
            function updateTask(id, updates) {
                const taskIndex = tasks.findIndex(t => t.id === id);
                if (taskIndex !== -1) {
                    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
                    saveTasks();
                    renderTasks();
                }
            }
            
            function deleteTask(id) {
                tasks = tasks.filter(t => t.id !== id);
                saveTasks();
                renderTasks();
            }

            function generateRecurringTasks() {
                const now = new Date();
                let changed = false;
                tasks.forEach(t => {
                    if (!t.recurrence || !t.dueDate) return;
                    const due = new Date(t.dueDate);
                    if (due <= now) {
                        if (t.recurrence === 'daily') due.setDate(due.getDate() + 1);
                        else if (t.recurrence === 'weekly') due.setDate(due.getDate() + 7);
                        else if (t.recurrence === 'monthly') due.setMonth(due.getMonth() + 1);
                        t.dueDate = formatDate(due, 'YYYY-MM-DD');
                        changed = true;
                    }
                });
                if (changed) saveTasks();
            }

            function requestNotificationPermission() {
                if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission();
                }
            }

            function scheduleNotifications() {
                if (Notification.permission !== 'granted') return;
                tasks.forEach(t => {
                    if (!t.dueDate) return;
                    const diff = new Date(t.dueDate).getTime() - Date.now();
                    if (diff > 0 && diff <= 24*60*60*1000) {
                        setTimeout(() => new Notification('Task due', { body: t.title }), diff);
                    }
                });
            }
            
            // Task Modal Functions
            function openTaskModal(task = null, quadrant = null) {
                const modalTitle = document.getElementById('modal-title');
                const taskIdInput = document.getElementById('task-id');
                const taskQuadrantInput = document.getElementById('task-quadrant');
                const taskTitleInput = document.getElementById('task-title');
                const taskDescriptionInput = document.getElementById('task-description');
                const taskDueDateInput = document.getElementById('task-due-date');
                const taskPriorityInput = document.getElementById('task-priority');
                const taskCategoryInput = document.getElementById('task-category');
                const taskRecurrenceInput = document.getElementById('task-recurrence');
                
                if (task) {
                    // Edit existing task
                    modalTitle.textContent = 'Edit Task';
                    currentTaskId = task.id;
                    taskIdInput.value = task.id;
                    taskQuadrantInput.value = task.quadrant;
                    taskTitleInput.value = task.title;
                    taskDescriptionInput.value = task.description || '';
                    taskDueDateInput.value = task.dueDate || '';
                    taskPriorityInput.value = task.priority || 'medium';
                    taskCategoryInput.value = task.category || '';
                    taskRecurrenceInput.value = task.recurrence || '';
                } else {
                    // Add new task
                    modalTitle.textContent = 'Add New Task';
                    currentTaskId = null;
                    taskIdInput.value = '';
                    taskQuadrantInput.value = quadrant;
                    taskTitleInput.value = '';
                    taskDescriptionInput.value = '';
                    
                    // Set default due date to today
                    const today = new Date();
                    const formattedDate = today.toISOString().split('T')[0];
                    taskDueDateInput.value = formattedDate;
                    
                    taskPriorityInput.value = 'medium';
                    taskCategoryInput.value = '';
                    taskRecurrenceInput.value = '';
                }
                
                taskModal.classList.remove('hidden');
            }
            
            function closeTaskModal() {
                taskModal.classList.add('hidden');
                taskForm.reset();
            }
            
            function saveTask(e) {
                e.preventDefault();
                
                const taskId = document.getElementById('task-id').value;
                const quadrant = document.getElementById('task-quadrant').value;
                const title = document.getElementById('task-title').value.trim();
                const description = document.getElementById('task-description').value.trim();
                const dueDate = document.getElementById('task-due-date').value;
                const priority = document.getElementById('task-priority').value;
                const category = document.getElementById('task-category').value.trim();
                const recurrence = document.getElementById('task-recurrence').value;
                
                if (!title) {
                    alert('Please enter a task title');
                    return;
                }
                
                const taskData = {
                    id: taskId || generateId(),
                    title,
                    description: description || null,
                    dueDate: dueDate || null,
                    priority,
                    category: category || null,
                    recurrence: recurrence || null,
                    quadrant: parseInt(quadrant),
                    createdAt: new Date().toISOString()
                };
                
                // Calculate quadrant if not specified (for new tasks)
                if (!quadrant) {
                    taskData.quadrant = calculateQuadrant(priority, dueDate);
                }
                
                if (taskId) {
                    updateTask(taskId, taskData);
                } else {
                    addTask(taskData);
                }
                
                closeTaskModal();
            }
            
            function openConfirmModal(taskId) {
                currentTaskId = taskId;
                confirmModal.classList.remove('hidden');
            }
            
            function closeConfirmModal() {
                confirmModal.classList.add('hidden');
            }
            
            function deleteTaskConfirmed() {
                if (currentTaskId) {
                    deleteTask(currentTaskId);
                    closeConfirmModal();
                }
            }
            
            // Task Rendering
            function renderTasks() {
                // Clear all quadrants
                for (let i = 1; i <= 4; i++) {
                    const container = document.getElementById(`quadrant-${i}-tasks`);
                    container.innerHTML = '';
                }
                
                // Filter tasks based on search and category
                const filteredTasks = tasks.filter(task => {
                    const matchesSearch = searchTerm === '' || 
                        task.title.toLowerCase().includes(searchTerm) || 
                        (task.description && task.description.toLowerCase().includes(searchTerm));
                    
                    const matchesCategory = selectedCategory === '' || 
                        (task.category && task.category === selectedCategory);
                    
                    return matchesSearch && matchesCategory;
                });
                
                // Render each task in its quadrant
                filteredTasks.forEach(task => {
                    const container = document.getElementById(`quadrant-${task.quadrant}-tasks`);
                    if (container) {
                        container.appendChild(createTaskCard(task));
                    }
                });
                
                // Show empty state if no tasks in a quadrant
                for (let i = 1; i <= 4; i++) {
                    const container = document.getElementById(`quadrant-${i}-tasks`);
                    if (container.children.length === 0) {
                        const emptyMsg = document.createElement('div');
                        emptyMsg.className = 'text-center text-gray-500 py-4';
                        emptyMsg.textContent = '(No tasks)';
                        container.appendChild(emptyMsg);
                    }
                }
            }
            
            function createTaskCard(task) {
                const card = document.createElement('div');
                card.className = `task-card bg-white rounded-lg shadow p-3 border-l-4 cursor-move`;
                card.setAttribute('draggable', 'true');
                card.setAttribute('data-task-id', task.id);
                
                // Set border color based on quadrant
                if (task.quadrant === 1) {
                    card.classList.add('border-l-red-500');
                } else if (task.quadrant === 2) {
                    card.classList.add('border-l-blue-500');
                } else if (task.quadrant === 3) {
                    card.classList.add('border-l-yellow-500');
                } else {
                    card.classList.add('border-l-green-500');
                }
                
                // Task content
                let html = `
                    <div class="flex justify-between items-start">
                        <div class="flex-grow">
                            <div class="font-medium">${task.title}</div>
                            ${task.description ? `<div class="text-sm text-gray-600 mt-1 line-clamp-2">${task.description}</div>` : ''}
                        </div>
                        <div class="flex space-x-2 ml-2">
                            <button class="edit-task text-blue-500 hover:text-blue-700" data-task-id="${task.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-task text-red-500 hover:text-red-700" data-task-id="${task.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                // Bottom row with metadata
                html += `<div class="flex justify-between items-center mt-2 text-xs text-gray-500">`;
                
                // Due date
                if (task.dueDate) {
                    const dueDate = new Date(task.dueDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    let dateClass = '';
                    if (dueDate < today) {
                        dateClass = 'text-red-500';
                    } else if (dueDate.getTime() === today.getTime()) {
                        dateClass = 'text-yellow-600';
                    }
                    
                    html += `<div class="${dateClass}">
                        <i class="far fa-calendar-alt mr-1"></i>${formatDate(dueDate)}
                    </div>`;
                } else {
                    html += `<div></div>`;
                }
                
                // Category and recurrence
                html += `<div class="flex items-center space-x-2">`;
                if (task.category) {
                    html += `<span class="bg-gray-100 px-2 py-1 rounded">${task.category}</span>`;
                }
                if (task.recurrence) {
                    html += `<span class="text-blue-500">
                        <i class="fas fa-sync-alt"></i>
                    </span>`;
                }
                html += `</div>`;
                
                html += `</div>`;
                
                card.innerHTML = html;
                
                // Add event listeners for edit and delete
                card.querySelector('.edit-task').addEventListener('click', function() {
                    const taskId = this.getAttribute('data-task-id');
                    const task = tasks.find(t => t.id === taskId);
                    if (task) {
                        openTaskModal(task);
                    }
                });
                
                card.querySelector('.delete-task').addEventListener('click', function() {
                    const taskId = this.getAttribute('data-task-id');
                    openConfirmModal(taskId);
                });
                
                return card;
            }
            
            function filterTasks() {
                renderTasks();
            }
            
            function updateStats() {
                for (let i = 1; i <= 4; i++) {
                    const count = tasks.filter(t => t.quadrant === i).length;
                    document.getElementById(`quadrant-${i}-count`).textContent = count;
                }
                const ordered = tasks.slice().sort((a,b) => {
                    if (a.quadrant !== b.quadrant) return a.quadrant - b.quadrant;
                    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
                    return 0;
                });
                document.getElementById('ordered-tasks').innerHTML = ordered.map(t => `<li>${t.title}</li>`).join('');
            }
            
            function updateCategoryFilter() {
                // Get all unique categories from tasks
                const categories = new Set();
                tasks.forEach(task => {
                    if (task.category) {
                        categories.add(task.category);
                    }
                });
                
                // Update category filter dropdown
                categoryFilter.innerHTML = `
                    <option value="">All Categories</option>
                    ${Array.from(categories).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                `;
                
                // Update datalist for category suggestions
                categoriesList.innerHTML = Array.from(categories).map(cat => 
                    `<option value="${cat}">${cat}</option>`
                ).join('');
            }
            
            // Import/Export
            function exportTasks() {
                const dataStr = JSON.stringify(tasks, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `eisenhower-tasks-${formatDate(new Date(), 'YYYY-MM-DD')}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
            }
            
            function importTasks(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const importedTasks = JSON.parse(e.target.result);
                        if (Array.isArray(importedTasks)) {
                            // Merge with existing tasks, keeping existing ones if IDs match
                            const existingIds = tasks.map(t => t.id);
                            const newTasks = importedTasks.filter(t => !existingIds.includes(t.id));
                            
                            tasks = [...tasks, ...newTasks];
                            saveTasks();
                            renderTasks();
                            
                            alert(`Successfully imported ${newTasks.length} tasks`);
                        } else {
                            alert('Invalid file format: Expected an array of tasks');
                        }
                    } catch (error) {
                        alert('Error parsing JSON file: ' + error.message);
                    }
                };
                reader.readAsText(file);
                importFile.value = ''; // Reset file input
            }
            
            // Drag and Drop
            function setupDragAndDrop() {
                // Add event listeners to all task cards
                matrixContainer.addEventListener('dragstart', function(e) {
                    if (e.target.classList.contains('task-card')) {
                        draggedTask = e.target;
                        e.target.classList.add('dragging');
                        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-task-id'));
                        e.dataTransfer.effectAllowed = 'move';
                    }
                });
                
                matrixContainer.addEventListener('dragend', function(e) {
                    if (e.target.classList.contains('task-card')) {
                        e.target.classList.remove('dragging');
                        draggedTask = null;
                    }
                });
                
                // Handle drag over quadrants
                document.querySelectorAll('.quadrant').forEach(quadrant => {
                    quadrant.addEventListener('dragover', function(e) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        this.classList.add('highlight');
                        if (draggedTask) {
                            const q = parseInt(this.getAttribute('data-quadrant'));
                            draggedTask.classList.remove('border-l-red-500','border-l-blue-500','border-l-yellow-500','border-l-green-500');
                            if (q === 1) draggedTask.classList.add('border-l-red-500');
                            else if (q === 2) draggedTask.classList.add('border-l-blue-500');
                            else if (q === 3) draggedTask.classList.add('border-l-yellow-500');
                            else draggedTask.classList.add('border-l-green-500');
                        }
                    });
                    
                    quadrant.addEventListener('dragleave', function() {
                        this.classList.remove('highlight');
                        if (draggedTask) {
                            draggedTask.classList.remove('border-l-red-500','border-l-blue-500','border-l-yellow-500','border-l-green-500');
                        }
                    });
                    
                    quadrant.addEventListener('drop', function(e) {
                        e.preventDefault();
                        this.classList.remove('highlight');
                        
                        if (draggedTask) {
                            const taskId = e.dataTransfer.getData('text/plain');
                            const newQuadrant = parseInt(this.getAttribute('data-quadrant'));

                            // Find the task and update its quadrant
                            const task = tasks.find(t => t.id === taskId);
                            if (task && task.quadrant !== newQuadrant) {
                                updateTask(taskId, { quadrant: newQuadrant });
                            }
                            draggedTask.classList.remove('border-l-red-500','border-l-blue-500','border-l-yellow-500','border-l-green-500');
                        }
                    });
                });
            }
            
            // Helper Functions
            function generateId() {
                return Date.now().toString(36) + Math.random().toString(36).substr(2);
            }
            
            function calculateQuadrant(priority, dueDate) {
                const isImportant = priority === 'high' || priority === 'medium';
                const isUrgent = isTaskUrgent(dueDate);
                
                if (isImportant && isUrgent) return 1;
                if (isImportant && !isUrgent) return 2;
                if (!isImportant && isUrgent) return 3;
                return 4;
            }
            
            function isTaskUrgent(dueDate) {
                if (!dueDate) return false;
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const taskDate = new Date(dueDate);
                taskDate.setHours(0, 0, 0, 0);
                
                // Urgent if due today or overdue
                return taskDate <= today || 
                    (taskDate.getTime() - today.getTime()) <= 24 * 60 * 60 * 1000; // Within 24 hours
            }
            
            function formatDate(date, format = 'YYYY-MM-DD') {
                if (!date) return '';
                
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                
                return format
                    .replace('YYYY', year)
                    .replace('MM', month)
                    .replace('DD', day);
            }
        });
