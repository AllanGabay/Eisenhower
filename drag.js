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

  document.querySelectorAll('.quadrant').forEach(quadrant => {
    quadrant.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      quadrant.classList.add('highlight');
      if(draggedTask){
        const q = parseInt(quadrant.getAttribute('data-quadrant'));
        draggedTask.style.backgroundColor = colorMap[q];
      }
    });

    quadrant.addEventListener('dragleave', () => {
      quadrant.classList.remove('highlight');
      if(draggedTask){
        draggedTask.style.backgroundColor = '';
      }
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
    });
  });
}
