import {setupVerticalBoard} from './drag.js';
import {createTaskCard, updateStats} from './ui.js';

const boardContainer = document.getElementById('board-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const addTaskBtn = document.getElementById('add-task-btn');
const quickTaskInput = document.getElementById('quick-task-input');
const taskModal = document.getElementById('task-modal');
const confirmModal = document.getElementById('confirm-modal');
const taskForm = document.getElementById('task-form');
const categoriesList = document.getElementById('categories-list');

let tasks = [];
let currentTaskId = null;
let searchTerm = '';
let selectedCategory = '';

init();

async function init(){
  await loadTasks();
  generateRecurringTasks();
  setupEventListeners();
  requestNotificationPermission();
  scheduleNotifications();
  setupVerticalBoard(boardContainer, id => tasks.find(t=>t.id===id), updateTask);
}

function setupEventListeners(){
  searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value.toLowerCase();
    filterTasks();
  });
  categoryFilter.addEventListener('change', () => {
    selectedCategory = categoryFilter.value;
    filterTasks();
  });
  exportBtn.addEventListener('click', exportTasks);
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', importTasks);
  addTaskBtn.addEventListener('click', () => openTaskModal());
  quickTaskInput.addEventListener('keydown', e => {
    if(e.key === 'Enter'){
      const title = quickTaskInput.value.trim();
      if(title){
        addTask({
          id: generateId(),
          title,
          description: null,
          dueDate: null,
          priority: 'medium',
          category: null,
          recurrence: null,
          quadrant: 4,
          y: 0,
          createdAt: new Date().toISOString()
        });
        quickTaskInput.value='';
      }
    }
  });
  document.getElementById('close-modal').addEventListener('click', closeTaskModal);
  document.getElementById('cancel-task').addEventListener('click', closeTaskModal);
  taskForm.addEventListener('submit', saveTask);
  document.getElementById('close-confirm-modal').addEventListener('click', closeConfirmModal);
  document.getElementById('cancel-delete').addEventListener('click', closeConfirmModal);
  document.getElementById('confirm-delete').addEventListener('click', deleteTaskConfirmed);
  document.getElementById('clear-category').addEventListener('click', () => {
    document.getElementById('task-category').value='';
  });
}

async function loadTasks(){
  tasks = await storage.loadTasks();
  renderTasks();
  updateStats(tasks);
  updateCategoryFilter();
}

async function saveTasks(){
  await storage.saveTasks(tasks);
  updateStats(tasks);
  updateCategoryFilter();
}

function addTask(task){
  tasks.push(task);
  saveTasks();
  renderTasks();
}

function updateTask(id, updates){
  const idx = tasks.findIndex(t=>t.id===id);
  if(idx!==-1){
    tasks[idx] = {...tasks[idx], ...updates};
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id){
  tasks = tasks.filter(t=>t.id!==id);
  saveTasks();
  renderTasks();
}

function generateRecurringTasks(){
  const now = new Date();
  let changed=false;
  tasks.forEach(t=>{
    if(!t.recurrence || !t.dueDate) return;
    const due = new Date(t.dueDate);
    if(due<=now){
      if(t.recurrence==='daily') due.setDate(due.getDate()+1);
      else if(t.recurrence==='weekly') due.setDate(due.getDate()+7);
      else if(t.recurrence==='monthly') due.setMonth(due.getMonth()+1);
      t.dueDate = formatDate(due, 'YYYY-MM-DD');
      changed=true;
    }
  });
  if(changed) saveTasks();
}

function requestNotificationPermission(){
  if('Notification' in window && Notification.permission==='default'){
    Notification.requestPermission();
  }
}

function scheduleNotifications(){
  if(Notification.permission!=='granted') return;
  tasks.forEach(t=>{
    if(!t.dueDate) return;
    const diff = new Date(t.dueDate).getTime() - Date.now();
    if(diff>0 && diff<=24*60*60*1000){
      setTimeout(()=> new Notification('Task due',{body:t.title}), diff);
    }
  });
}

function openTaskModal(task=null){
  const modalTitle = document.getElementById('modal-title');
  const taskIdInput = document.getElementById('task-id');
  const taskQuadrantInput = document.getElementById('task-quadrant');
  const taskTitleInput = document.getElementById('task-title');
  const taskDescriptionInput = document.getElementById('task-description');
  const taskDueDateInput = document.getElementById('task-due-date');
  const taskPriorityInput = document.getElementById('task-priority');
  const taskCategoryInput = document.getElementById('task-category');
  const taskRecurrenceInput = document.getElementById('task-recurrence');

  if(task){
    modalTitle.textContent='Edit Task';
    currentTaskId = task.id;
    taskIdInput.value=task.id;
    taskQuadrantInput.value=task.quadrant;
    taskTitleInput.value=task.title;
    taskDescriptionInput.value=task.description||'';
    taskDueDateInput.value=task.dueDate||'';
    taskPriorityInput.value=task.priority||'medium';
    taskCategoryInput.value=task.category||'';
    taskRecurrenceInput.value=task.recurrence||'';
  }else{
    modalTitle.textContent='Add New Task';
    currentTaskId=null;
    taskIdInput.value='';
    taskQuadrantInput.value='';
    taskTitleInput.value='';
    taskDescriptionInput.value='';
    const today = new Date().toISOString().split('T')[0];
    taskDueDateInput.value=today;
    taskPriorityInput.value='medium';
    taskCategoryInput.value='';
    taskRecurrenceInput.value='';
  }
  taskModal.classList.remove('hidden');
}

function closeTaskModal(){
  taskModal.classList.add('hidden');
  taskForm.reset();
}

function saveTask(e){
  e.preventDefault();
  const taskId = document.getElementById('task-id').value;
  const quadrant = document.getElementById('task-quadrant').value;
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  const dueDate = document.getElementById('task-due-date').value;
  const priority = document.getElementById('task-priority').value;
  const category = document.getElementById('task-category').value.trim();
  const recurrence = document.getElementById('task-recurrence').value;
  if(!title){ alert('Please enter a task title'); return; }
  const data = {
    id: taskId || generateId(),
    title,
    description: description || null,
    dueDate: dueDate || null,
    priority,
    category: category || null,
    recurrence: recurrence || null,
    quadrant: quadrant? parseInt(quadrant): calculateQuadrant(priority, dueDate),
    y: taskId ? (tasks.find(t=>t.id===taskId)?.y || 0) : 0,
    createdAt: new Date().toISOString()
  };
  if(taskId) updateTask(taskId, data); else addTask(data);
  closeTaskModal();
}

function openConfirmModal(id){
  currentTaskId=id;
  confirmModal.classList.remove('hidden');
}

function closeConfirmModal(){
  confirmModal.classList.add('hidden');
}

function deleteTaskConfirmed(){
  if(currentTaskId){
    deleteTask(currentTaskId);
    closeConfirmModal();
  }
}

function renderTasks(){
  boardContainer.innerHTML='';
  const filtered = tasks.filter(task=>{
    const matchesSearch = searchTerm==='' ||
      task.title.toLowerCase().includes(searchTerm) ||
      (task.description && task.description.toLowerCase().includes(searchTerm));
    const matchesCategory = selectedCategory==='' ||
      (task.category && task.category===selectedCategory);
    return matchesSearch && matchesCategory;
  });
  filtered.forEach(task=>{
    const card = createTaskCard(task, {
      onEdit: id=>{ const t = tasks.find(t=>t.id===id); if(t) openTaskModal(t); },
      onDelete: id=>openConfirmModal(id)
    });
    card.style.top = (task.y||0)+'px';
    boardContainer.appendChild(card);
  });
}

function filterTasks(){
  renderTasks();
}

function updateCategoryFilter(){
  const categories = new Set();
  tasks.forEach(task=>{ if(task.category) categories.add(task.category); });
  categoryFilter.innerHTML = `<option value="">All Categories</option>` + Array.from(categories).map(c=>`<option value="${c}">${c}</option>`).join('');
  categoriesList.innerHTML = Array.from(categories).map(c=>`<option value="${c}">${c}</option>`).join('');
}

function exportTasks(){
  const dataStr = JSON.stringify(tasks,null,2);
  const dataUri = 'data:application/json;charset=utf-8,'+encodeURIComponent(dataStr);
  const fileName = `eisenhower-tasks-${formatDate(new Date(),'YYYY-MM-DD')}.json`;
  const link=document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', fileName);
  link.click();
}

function importTasks(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    try{
      const imported = JSON.parse(evt.target.result);
      if(Array.isArray(imported)){
        const existingIds = tasks.map(t=>t.id);
        const newTasks = imported.filter(t=>!existingIds.includes(t.id));
        tasks = [...tasks, ...newTasks];
        saveTasks();
        renderTasks();
        alert(`Successfully imported ${newTasks.length} tasks`);
      }else{
        alert('Invalid file format');
      }
    }catch(err){
      alert('Error parsing JSON: '+err.message);
    }
  };
  reader.readAsText(file);
  importFile.value='';
}

function generateId(){
  return Date.now().toString(36)+Math.random().toString(36).substr(2);
}

function calculateQuadrant(priority, dueDate){
  const isImportant = priority==='high' || priority==='medium';
  const isUrgent = isTaskUrgent(dueDate);
  if(isImportant && isUrgent) return 1;
  if(isImportant && !isUrgent) return 2;
  if(!isImportant && isUrgent) return 3;
  return 4;
}

function isTaskUrgent(dueDate){
  if(!dueDate) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const taskDate = new Date(dueDate); taskDate.setHours(0,0,0,0);
  return taskDate <= today || (taskDate.getTime()-today.getTime()) <= 24*60*60*1000;
}

function formatDate(date, format='YYYY-MM-DD'){
  const year = date.getFullYear();
  const month = String(date.getMonth()+1).padStart(2,'0');
  const day = String(date.getDate()).padStart(2,'0');
  return format.replace('YYYY',year).replace('MM',month).replace('DD',day);
}
