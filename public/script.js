document.getElementById('taskForm').addEventListener('submit', async function (event) {
    event.preventDefault();    
    
    const taskName = document.getElementById('taskName').value;
    const taskDescription = document.getElementById('taskDescription').value;
    const taskDate = document.getElementById('taskDate').value;
    const taskPriority = document.getElementById('taskPriority').value; 

    if (taskName && taskDescription && taskDate && taskPriority) {
        await addTaskToServer(taskName, taskDescription, taskDate, taskPriority);
        loadTasks();  
    }
});

async function addTaskToServer(name, description, date, priority) {
    await fetch('/api/tasks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, description, date, priority})
    });
}

async function loadTasks() {
    const response = await fetch('/api/tasks');
    const tasks = await response.json();
    
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>Task: ${task.name}</strong>
                <p>Description: ${task.description}</p>
                <small>Date: ${task.date}</small>
            </div>
            <span class="priority">Prioritized: ${task.priority}</span>
            <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

async function deleteTask(taskId) {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    loadTasks();  
}

loadTasks();
