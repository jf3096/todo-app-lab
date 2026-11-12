(() => {
  'use strict';

  const storageKey = 'todo-app-lab.tasks.v1';
  const input = document.querySelector('#task-input');
  const list = document.querySelector('#task-list');
  const notice = document.querySelector('#notice');
  const filters = document.querySelector('.filters');
  let tasks = [];
  let filter = 'all';
  let storageWarning = '';
  let canSave = true;

  function showNotice(message = storageWarning) {
    notice.textContent = message;
    notice.hidden = !message;
  }

  function disableStorage(message) {
    canSave = false;
    storageWarning = message;
    document.querySelector('#storage-status').textContent = '当前为临时模式，刷新后本次更改将丢失。';
    showNotice();
  }

  function load() {
    let raw;
    try {
      raw = localStorage.getItem(storageKey);
    } catch {
      disableStorage('无法读取浏览器存储。仍可临时使用，刷新后本次更改将丢失。');
      return;
    }
    if (raw === null) return;
    try {
      const saved = JSON.parse(raw);
      const ids = new Set();
      if (!Array.isArray(saved) || !saved.every(task => {
        if (!task || typeof task.id !== 'string' || !task.id || ids.has(task.id) ||
            typeof task.text !== 'string' || !task.text.trim() || task.text.length > 200 ||
            typeof task.completed !== 'boolean') return false;
        ids.add(task.id);
        return true;
      })) throw new Error('Invalid saved tasks');
      tasks = saved;
    } catch {
      disableStorage('保存的数据无法读取，原数据未覆盖。当前可临时使用，刷新后本次更改将丢失。');
    }
  }

  function save() {
    if (canSave) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(tasks));
      } catch {
        disableStorage('无法保存到浏览器。当前仍可使用，刷新后本次更改将丢失。');
      }
    }
    showNotice();
  }

  function render() {
    const visible = tasks.filter(task => filter === 'all' || (filter === 'completed' ? task.completed : !task.completed));
    list.replaceChildren();
    for (const task of visible) {
      const item = document.createElement('li');
      item.className = `task-item${task.completed ? ' is-completed' : ''}`;
      const label = document.createElement('label');
      label.className = 'task-label';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-check';
      checkbox.checked = task.completed;
      checkbox.dataset.id = task.id;
      const text = document.createElement('span');
      text.className = 'task-text';
      text.textContent = task.text;
      label.append(checkbox, text);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'delete-button';
      remove.textContent = '删除';
      remove.setAttribute('aria-label', `删除：${task.text}`);
      remove.dataset.id = task.id;
      item.append(label, remove);
      list.append(item);
    }
    const completed = tasks.filter(task => task.completed).length;
    document.querySelector('#remaining').textContent = `${tasks.length - completed} 项待完成`;
    document.querySelector('#completed-count').textContent = `已完成 ${completed} 项`;
    document.querySelector('#empty-state').hidden = visible.length > 0;
    const emptyCopy = filter === 'completed'
      ? ['还没有已完成的事项', '勾选一条待办，就能在这里看到它。']
      : tasks.length > 0
        ? ['待办都完成了', '给自己留一点休息的时间。']
        : ['从一件小事开始', '在上方写下你的第一条待办。'];
    document.querySelector('#empty-title').textContent = emptyCopy[0];
    document.querySelector('#empty-description').textContent = emptyCopy[1];
    for (const button of filters.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    }
  }

  document.querySelector('#task-form').addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || text.length > 200) {
      showNotice('请输入 1 到 200 个字符的待办事项。');
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    tasks.push({ id: crypto.randomUUID(), text, completed: false });
    filter = 'all';
    input.value = '';
    input.removeAttribute('aria-invalid');
    save();
    render();
    input.focus();
    document.querySelector('#announcement').textContent = `已添加：${text}`;
  });

  list.addEventListener('change', event => {
    if (!event.target.matches('.task-check')) return;
    const task = tasks.find(task => task.id === event.target.dataset.id);
    if (!task) return;
    task.completed = event.target.checked;
    save();
    render();
    const nextFocus = [...list.querySelectorAll('.task-check')].find(box => box.dataset.id === task.id);
    (nextFocus || filters.querySelector('[aria-pressed="true"]')).focus();
    document.querySelector('#announcement').textContent = task.completed ? `已完成：${task.text}` : `已恢复：${task.text}`;
  });

  list.addEventListener('click', event => {
    const button = event.target.closest('.delete-button');
    if (!button) return;
    tasks = tasks.filter(task => task.id !== button.dataset.id);
    save();
    render();
    input.focus();
    document.querySelector('#announcement').textContent = '事项已删除。';
  });

  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    filter = button.dataset.filter;
    render();
  });

  document.querySelector('#today').textContent = new Intl.DateTimeFormat('zh-CN', {
    month: 'long', day: 'numeric', weekday: 'long'
  }).format(new Date());
  load();
  render();
})();
