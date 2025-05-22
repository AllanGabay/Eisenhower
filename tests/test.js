const assert = require('assert');

function isTaskUrgent(dueDate){
  if(!dueDate) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  const taskDate = new Date(dueDate);
  taskDate.setHours(0,0,0,0);
  return taskDate <= today || (taskDate.getTime() - today.getTime()) <= 24*60*60*1000;
}

function calculateQuadrant(priority, dueDate){
  const isImportant = priority === 'high' || priority === 'medium';
  const isUrgent = isTaskUrgent(dueDate);
  if(isImportant && isUrgent) return 1;
  if(isImportant && !isUrgent) return 2;
  if(!isImportant && isUrgent) return 3;
  return 4;
}

const now = new Date().toISOString();
assert.strictEqual(calculateQuadrant('high', now), 1);
const future = new Date(Date.now()+7*24*3600*1000).toISOString();
assert.strictEqual(calculateQuadrant('high', future), 2);
assert.strictEqual(calculateQuadrant('low', future), 4);
console.log('All tests passed');
