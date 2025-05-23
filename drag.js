export function setupDragAndDrop(matrixContainer, getTaskById, updateTask, updateStats){
  let draggedTask = null;
  const colorMap = {
    1: '#fecaca', // red-200
    2: '#bfdbfe', // blue-200
    3: '#fef9c3', // yellow-200
    4: '#bbf7d0'  // green-200
  };

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
      e.target.style.backgroundColor = '';
      draggedTask = null;
    }
  });

  matrixContainer.addEventListener('dragover', e => {
    e.preventDefault();
    if(draggedTask){
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const quad = el ? el.closest('.quadrant') : null;
      if(quad){
        const q = parseInt(quad.getAttribute('data-quadrant'));
        draggedTask.style.backgroundColor = colorMap[q];
      } else {
        draggedTask.style.backgroundColor = '';
      }
    }
  });

  matrixContainer.addEventListener('dragleave', () => {
    if(draggedTask){
      draggedTask.style.backgroundColor = '';
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
        const task = getTaskById(taskId);
        if(task && task.quadrant !== newQuadrant){
          updateTask(taskId, {quadrant: newQuadrant});
          updateStats();
        }
        draggedTask.style.backgroundColor = '';
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
