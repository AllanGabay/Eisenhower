const STORAGE_KEY = 'eisenhower-tasks';

window.storage = {
  async loadTasks() {
    const tasks = await localforage.getItem(STORAGE_KEY);
    return tasks || [];
  },
  async saveTasks(tasks) {
    return localforage.setItem(STORAGE_KEY, tasks);
  }
};
