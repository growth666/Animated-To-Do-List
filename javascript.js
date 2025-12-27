const taskinput = document.getElementById('taskinput');
const addbutton = document.getElementById('addbutton');
const tasklist = document.querySelector('.tasklist');
const taskcount = document.querySelector('.taskcount');
const clearbtn = document.getElementById('clear');
const filterBtns = document.querySelectorAll('.filter-btn');
let currentFilter = 'all';
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
function addtask() {
    const tasktext = taskinput.value.trim();
    if (!tasktext) {
        alert("请输入任务内容！")
        return;
    }
    const newtask = {
        text: tasktext,
        completed: false
    };
    tasks.push(newtask);
    savetasks();//保存到本地自定义函数
    renderTasks();//自定义的函数
    taskinput.value = "";
    taskinput.focus();
}
function updatetaskcount() {//计数功能函数
    const unfinished = tasks.filter(task => !task.completed).length;
    taskcount.textContent = `未完成：${unfinished}`;
}
function renderTasks() {
    tasklist.innerHTML = '';
    const filteredTasks = tasks.filter(task => {
        if (currentFilter == 'active') {
            return !task.completed;
        } else if (currentFilter == 'completed') {
            return task.completed
        } else {
            return true;
        }
    });
    filteredTasks.forEach((task, indexInFiltered) => {//index用来定位使
        const originalIndex = tasks.findIndex(t => t.text === task.text && t.completed === task.completed);

        const taskitem = document.createElement('div');
        taskitem.className = 'taskitem';
        taskitem.innerHTML = `
      <input type="checkbox" class="taskcheckbox" ${task.completed ? 'checked' : ''}>
      <span class="tasktext">${task.text}</span>
      <button class="delete">删除</button>
    `;
        const deletebtn = taskitem.querySelector('.delete');//删除单条功能
        deletebtn.addEventListener('click', () => {
            tasks.splice(originalIndex, 1);
            savetasks();
            renderTasks();
        });

        const checkbox = taskitem.querySelector('.taskcheckbox');
        checkbox.addEventListener('change', () => {
            tasks[originalIndex].completed = checkbox.checked;
            savetasks();
            renderTasks();
            updatetaskcount();
        });
        tasklist.appendChild(taskitem);
    });
    updatetaskcount();
}
function savetasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
addbutton.addEventListener('click', addtask);//绑定按钮的函数
taskinput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addtask();
    }
});//绑定键盘enter事件
renderTasks();
clearbtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    savetasks();
    renderTasks();
});
filterBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
        filterBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter=btn.dataset.filter;
        renderTasks();
    });
});