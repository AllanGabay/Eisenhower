export function setupDragAndDrop(container, getTaskById, updateTask, updateStats){
  let dragged = null;
  let offsetX = 0;
  let offsetY = 0;

  container.addEventListener('dragstart', e => {
    if(e.target.classList.contains('task-card')){
      dragged = e.target;
      const rect = e.target.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', e.target.getAttribute('data-task-id'));
      e.target.classList.add('dragging');
    }
  });

  container.addEventListener('dragend', e => {
    if(e.target.classList.contains('task-card')){
      e.target.classList.remove('dragging');
      dragged = null;
    }
  });

  container.addEventListener('dragover', e => {
    e.preventDefault();
    if(dragged){
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - offsetX;
      const y = e.clientY - rect.top - offsetY;
      const relX = clamp(x / rect.width, 0, 1);
      const relY = clamp(y / rect.height, 0, 1);
      const color = getColor(relX, relY);
      dragged.style.left = x + 'px';
      dragged.style.top = y + 'px';
      dragged.style.backgroundColor = color;
    }
  });

  container.addEventListener('drop', e => {
    e.preventDefault();
    if(dragged){
      const taskId = dragged.getAttribute('data-task-id');
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - offsetX;
      const y = e.clientY - rect.top - offsetY;
      const relX = clamp(x / rect.width, 0, 1);
      const relY = clamp(y / rect.height, 0, 1);
      const color = getColor(relX, relY);
      const quadrant = determineQuadrant(relX, relY);
      dragged.style.left = x + 'px';
      dragged.style.top = y + 'px';
      dragged.style.backgroundColor = color;
      updateTask(taskId, {x, y, color, quadrant});
      updateStats();
    }
  });
}

function clamp(v, min, max){
  return Math.min(Math.max(v, min), max);
}

function blend(c1, c2, t){
  return [
    c1[0] + (c2[0]-c1[0])*t,
    c1[1] + (c2[1]-c1[1])*t,
    c1[2] + (c2[2]-c1[2])*t
  ];
}

function getColor(x, y){
  const tl = [254,202,202];
  const tr = [191,219,254];
  const bl = [254,249,195];
  const br = [187,247,208];
  const top = blend(tl, tr, x);
  const bottom = blend(bl, br, x);
  const rgb = blend(top, bottom, y);
  return `rgb(${rgb.map(v=>Math.round(v)).join(',')})`;
}

function determineQuadrant(x, y){
  if(x < 0.5 && y < 0.5) return 1;
  if(x >= 0.5 && y < 0.5) return 2;
  if(x < 0.5 && y >= 0.5) return 3;
  return 4;
}
