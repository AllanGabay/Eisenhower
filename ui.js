export function createTaskCard(task, {onEdit, onDelete}){
  const card = document.createElement('div');
  card.className = 'task-card bg-white rounded-lg shadow p-3 border-l-4 cursor-move';
  card.setAttribute('draggable','true');
  card.setAttribute('data-task-id', task.id);
  if(task.quadrant===1) card.classList.add('border-l-red-500');
  else if(task.quadrant===2) card.classList.add('border-l-blue-500');
  else if(task.quadrant===3) card.classList.add('border-l-yellow-500');
  else card.classList.add('border-l-green-500');
  let html = `
    <div class="flex justify-between items-start">
      <div class="flex-grow">
        <div class="font-medium">${task.title}</div>
        ${task.description?`<div class="text-sm text-gray-600 mt-1 line-clamp-2">${task.description}</div>`:''}
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
  html += `<div class="flex justify-between items-center mt-2 text-xs text-gray-500">`;
  if(task.dueDate){
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    let dateClass='';
    if(dueDate < today) dateClass='text-red-500';
    else if(dueDate.getTime()===today.getTime()) dateClass='text-yellow-600';
    html += `<div class="${dateClass}"><i class="far fa-calendar-alt mr-1"></i>${dueDate.toISOString().split('T')[0]}</div>`;
  } else {
    html += `<div></div>`;
  }
  html += `<div class="flex items-center space-x-2">`;
  if(task.category){
    html += `<span class="bg-gray-100 px-2 py-1 rounded">${task.category}</span>`;
  }
  if(task.recurrence){
    html += `<span class="text-blue-500"><i class="fas fa-sync-alt"></i></span>`;
  }
  html += `</div></div>`;
  card.innerHTML = html;
  card.querySelector('.edit-task').addEventListener('click', () => onEdit(task.id));
  card.querySelector('.delete-task').addEventListener('click', () => onDelete(task.id));
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
  document.getElementById('ordered-tasks').innerHTML = ordered.map(t=>`<li>${t.title}</li>`).join('');
}
