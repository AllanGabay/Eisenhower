export function createTaskCard(task, {onEdit, onDelete}){
  const card = document.createElement('div');
  card.className = 'task-card rounded-lg shadow p-3 border-l-4 cursor-move';
  if (task.quadrant === 1) card.classList.add('bg-red-50','border-l-red-500');
  else if (task.quadrant === 2) card.classList.add('bg-blue-50','border-l-blue-500');
  else if (task.quadrant === 3) card.classList.add('bg-yellow-50','border-l-yellow-500');
  else card.classList.add('bg-green-50','border-l-green-500');
  card.setAttribute('draggable', 'true');
  card.setAttribute('data-task-id', task.id);


  const top = document.createElement('div');
  top.className = 'flex justify-between items-start';

  const content = document.createElement('div');
  content.className = 'flex-grow';
  const title = document.createElement('div');
  title.className = 'font-medium';
  title.textContent = task.title;
  content.appendChild(title);
  if (task.description) {
    const desc = document.createElement('div');
    desc.className = 'text-sm text-gray-600 mt-1 line-clamp-2';
    desc.textContent = task.description;
    content.appendChild(desc);
  }

  const actions = document.createElement('div');
  actions.className = 'flex space-x-2 ml-2';
  const editBtn = document.createElement('button');
  editBtn.className = 'edit-task text-blue-500 hover:text-blue-700';
  editBtn.setAttribute('data-task-id', task.id);
  const editIcon = document.createElement('i');
  editIcon.className = 'fas fa-edit';
  editBtn.appendChild(editIcon);
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-task text-red-500 hover:text-red-700';
  deleteBtn.setAttribute('data-task-id', task.id);
  const deleteIcon = document.createElement('i');
  deleteIcon.className = 'fas fa-trash';
  deleteBtn.appendChild(deleteIcon);
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  top.appendChild(content);
  top.appendChild(actions);

  const bottom = document.createElement('div');
  bottom.className = 'flex justify-between items-center mt-2 text-xs text-gray-500';

  const dateInfo = document.createElement('div');
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let dateClass = '';
    if (dueDate < today) dateClass = 'text-red-500';
    else if (dueDate.getTime() === today.getTime()) dateClass = 'text-yellow-600';
    dateInfo.className = dateClass;
    const icon = document.createElement('i');
    icon.className = 'far fa-calendar-alt mr-1';
    dateInfo.appendChild(icon);
    dateInfo.appendChild(document.createTextNode(dueDate.toISOString().split('T')[0]));
  }
  bottom.appendChild(dateInfo);

  const meta = document.createElement('div');
  meta.className = 'flex items-center space-x-2';
  if (task.category) {
    const cat = document.createElement('span');
    cat.className = 'bg-gray-100 px-2 py-1 rounded';
    cat.textContent = task.category;
    meta.appendChild(cat);
  }
  if (task.recurrence) {
    const rec = document.createElement('span');
    rec.className = 'text-blue-500';
    const recIcon = document.createElement('i');
    recIcon.className = 'fas fa-sync-alt';
    rec.appendChild(recIcon);
    meta.appendChild(rec);
  }
  bottom.appendChild(meta);

  card.appendChild(top);
  card.appendChild(bottom);

  editBtn.addEventListener('click', () => onEdit(task.id));
  deleteBtn.addEventListener('click', () => onDelete(task.id));

  return card;
}

export function updateStats(tasks){
  for(let i=1;i<=4;i++){
    const count = tasks.filter(t=>t.quadrant===i).length;
    document.getElementById(`quadrant-${i}-count`).textContent = count;
  }
  const ordered = tasks.slice().sort((a,b)=>{
    if(a.quadrant!==b.quadrant) return a.quadrant-b.quadrant;
    if(a.dueDate && b.dueDate) return new Date(a.dueDate)-new Date(b.dueDate);
    return 0;
  });
  document.getElementById('ordered-tasks').innerHTML = ordered.map(t=>{
    const info = [];
    info.push(`<strong>${t.title}</strong>`);
    if(t.dueDate) info.push(`due ${t.dueDate}`);
    info.push(`priority ${t.priority}`);
    if(t.category) info.push(t.category);
    return `<li>${info.join(' - ')}</li>`;
  }).join('');
}
