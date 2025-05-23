export const cornerColors = {
  tl: [254,202,202],
  tr: [191,219,254],
  bl: [254,249,195],
  br: [187,247,208]
};

export function getGradientColor(urgency, importance){
  const {tl,tr,bl,br} = cornerColors;
  const r = tl[0]*urgency*importance + tr[0]*(1-urgency)*importance +
            bl[0]*urgency*(1-importance) + br[0]*(1-urgency)*(1-importance);
  const g = tl[1]*urgency*importance + tr[1]*(1-urgency)*importance +
            bl[1]*urgency*(1-importance) + br[1]*(1-urgency)*(1-importance);
  const b = tl[2]*urgency*importance + tr[2]*(1-urgency)*importance +
            bl[2]*urgency*(1-importance) + br[2]*(1-urgency)*(1-importance);
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

export function defaultMetricsFromQuadrant(q){
  switch(q){
    case 1: return {importance:1, urgency:1};
    case 2: return {importance:1, urgency:0};
    case 3: return {importance:0, urgency:1};
    default: return {importance:0, urgency:0};
  }
}

export function setupDragAndDrop(matrixContainer, getTaskById, updateTask, updateStats){
  let draggedTask = null;

  matrixContainer.addEventListener('dragstart', e => {
    if(e.target.classList.contains('task-card')){
      draggedTask = e.target;
      e.target.classList.add('dragging');
      e.dataTransfer.setData('text/plain', e.target.getAttribute('data-task-id'));
      e.dataTransfer.effectAllowed = 'move';
    }
  });

  matrixContainer.addEventListener('dragend', e => {
    if(e.target.classList.contains('task-card')){
      e.target.classList.remove('dragging');
      const task = getTaskById(e.target.getAttribute('data-task-id'));
      if(task) e.target.style.backgroundColor = task.color;
      draggedTask = null;
    }
  });

  matrixContainer.addEventListener('dragover', e => {
    e.preventDefault();
    if(draggedTask){
      const rect = matrixContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const urgency = 1 - x / rect.width;
      const importance = 1 - y / rect.height;
      draggedTask.style.backgroundColor = getGradientColor(urgency, importance);
    }
  });

  matrixContainer.addEventListener('dragleave', () => {
    if(draggedTask){
      const task = getTaskById(draggedTask.getAttribute('data-task-id'));
      if(task) draggedTask.style.backgroundColor = task.color;
    }
  });

  document.querySelectorAll('.quadrant').forEach(quadrant => {
    quadrant.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      quadrant.classList.add('highlight');
      const indicator = quadrant.querySelector('.drop-indicator');
      if(indicator) indicator.classList.remove('hidden');
    });

    quadrant.addEventListener('dragleave', () => {
      quadrant.classList.remove('highlight');
      const indicator = quadrant.querySelector('.drop-indicator');
      if(indicator) indicator.classList.add('hidden');
    });

    quadrant.addEventListener('drop', e => {
      e.preventDefault();
      quadrant.classList.remove('highlight');
      if(draggedTask){
        const taskId = e.dataTransfer.getData('text/plain');
        const newQuadrant = parseInt(quadrant.getAttribute('data-quadrant'));
        const rect = matrixContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const urgency = 1 - x / rect.width;
        const importance = 1 - y / rect.height;
        const color = getGradientColor(urgency, importance);
        updateTask(taskId, {quadrant:newQuadrant, urgency, importance, color});
        updateStats();
        draggedTask.style.backgroundColor = color;
      }
      const indicator = quadrant.querySelector('.drop-indicator');
      if(indicator) indicator.classList.add('hidden');
    });
  });
}

export function setupVerticalBoard(board, getTaskById, updateTask){
  let draggedTask = null;
  board.addEventListener('dragstart', e => {
    if(e.target.classList.contains('task-card')){
      draggedTask = e.target;
      e.dataTransfer.setData('text/plain', e.target.getAttribute('data-task-id'));
      e.dataTransfer.effectAllowed = 'move';
    }
  });

  board.addEventListener('dragend', () => {
    draggedTask = null;
  });

  board.addEventListener('dragover', e => {
    e.preventDefault();
  });

  board.addEventListener('drop', e => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if(taskId){
      const rect = board.getBoundingClientRect();
      const y = e.clientY - rect.top + board.scrollTop;
      updateTask(taskId, { y });
    }
  });
}
