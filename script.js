// ESTADO GLOBAL
let tasks = [];
let filteredTasks = [];

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();
    renderBoard();
});

// CARREGAR E SALVAR NO LOCALSTORAGE
function loadTasksFromLocalStorage() {
    const saved = localStorage.getItem('brickflow_tasks');
    if (saved) {
        tasks = JSON.parse(saved);
    } else {
        // Dados demonstrativos
        tasks = [
            { id: '1', title: 'Montar Base da Torre', description: 'Encaixar peças vermelhas de suporte principal', priority: 'alta', dueDate: '2026-11-10', status: 'pendente' },
            { id: '2', title: 'Ajustar Brilho dos Blocos', description: 'Aplicar estilo plastificado na barra lateral', priority: 'media', dueDate: '2026-11-05', status: 'andamento' }
        ];
        saveTasksToLocalStorage();
    }
    filteredTasks = [...tasks];
}

function saveTasksToLocalStorage() {
    localStorage.setItem('brickflow_tasks', JSON.stringify(tasks));
}

// RENDERIZAÇÃO DO KANBAN E INDICADORES
function renderBoard() {
    const listTodo = document.getElementById('listTodo');
    const listProgress = document.getElementById('listProgress');
    const listDone = document.getElementById('listDone');

    listTodo.innerHTML = '';
    listProgress.innerHTML = '';
    listDone.innerHTML = '';

    let todoCount = 0, progressCount = 0, doneCount = 0;

    filteredTasks.forEach(task => {
        const card = createTaskCard(task);

        if (task.status === 'pendente') {
            listTodo.appendChild(card);
            todoCount++;
        } else if (task.status === 'andamento') {
            listProgress.appendChild(card);
            progressCount++;
        } else if (task.status === 'concluida') {
            listDone.appendChild(card);
            doneCount++;
        }
    });

    // Atualiza Dashboard
    document.getElementById('statTotal').innerText = tasks.length;
    document.getElementById('statPending').innerText = todoCount;
    document.getElementById('statProgress').innerText = progressCount;
    document.getElementById('statCompleted').innerText = doneCount;

    document.getElementById('countTodo').innerText = todoCount;
    document.getElementById('countProgress').innerText = progressCount;
    document.getElementById('countDone').innerText = doneCount;

    // Atualiza Progresso
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    document.getElementById('progressFill').style.width = percentage + '%';
}

// CRIAÇÃO DO CARD DE TAREFA
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card priority-${task.priority}`;
    card.draggable = true;
    card.ondragstart = (e) => handleDragStart(e, task.id);

    // Alerta de Atraso
    const today = new Date().toISOString().split('T')[0];
    if (task.dueDate < today && task.status !== 'concluida') {
        card.classList.add('overdue');
    }

    card.innerHTML = `
        <h4>${task.title}</h4>
        <p>${task.description || 'Sem descrição'}</p>
        <small><strong>Prazo:</strong> ${task.dueDate}</small>
        <div class="task-actions">
            <button class="brick-btn btn-small" onclick="openModal('${task.id}')">Editar</button>
            <button class="brick-btn btn-small btn-secondary" onclick="deleteTask('${task.id}')">Excluir</button>
        </div>
    `;
    return card;
}

// MODAL E OPERAÇÕES CRUD
function openModal(id = null) {
    const modal = document.getElementById('taskModal');
    modal.classList.add('active');

    if (id) {
        const task = tasks.find(t => t.id === id);
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.dueDate;
        document.getElementById('modalTitle').innerText = 'Editar Peça / Tarefa';
    } else {
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        document.getElementById('modalTitle').innerText = 'Encaixar Nova Tarefa';
    }
}

function closeModal() {
    document.getElementById('taskModal').classList.remove('active');
}

function saveTask(e) {
    e.preventDefault();
    const id = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;

    if (id) {
        const task = tasks.find(t => t.id === id);
        task.title = title;
        task.description = description;
        task.priority = priority;
        task.dueDate = dueDate;
    } else {
        const newTask = {
            id: Date.now().toString(),
            title,
            description,
            priority,
            dueDate,
            status: 'pendente'
        };
        tasks.push(newTask);
    }

    saveTasksToLocalStorage();
    applyFilters();
    closeModal();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasksToLocalStorage();
    applyFilters();
}

// FILTROS E PESQUISA
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const priority = document.getElementById('priorityFilter').value;
    const status = document.getElementById('statusFilter').value;

    filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(search);
        const matchesPriority = priority === 'all' || task.priority === priority;
        const matchesStatus = status === 'all' || task.status === status;
        return matchesSearch && matchesPriority && matchesStatus;
    });

    renderBoard();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('priorityFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';
    applyFilters();
}

// DRAG AND DROP
function handleDragStart(e, id) {
    e.dataTransfer.setData('text/plain', id);
}

function allowDrop(e) {
    e.preventDefault();
}

function handleDrop(e, newStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = newStatus;
        saveTasksToLocalStorage();
        applyFilters();
    }
}

// NAVEGAÇÃO ENTRE ABAS
function switchTab(tabName) {
    const btns = document.querySelectorAll('.nav-btn');
    btns.forEach(b => b.classList.remove('active'));
    if (tabName === 'dashboard') {
        btns[0].classList.add('active');
    } else {
        btns[1].classList.add('active');
    }
}

// RECURSOS EXTRAS: MODO ESCURO E JSON
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "brickflow_tarefas.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
