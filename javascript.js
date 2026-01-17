const taskinput = document.getElementById('taskinput');
const addbutton = document.getElementById('addbutton');
const tasklist = document.querySelector('.tasklist');
const taskcount = document.querySelector('.taskcount');
const clearbtn = document.getElementById('clear');
const filterBtns = document.querySelectorAll('.filter-btn');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const calendarTitle = document.getElementById('calendar-title');
const calendarGrid = document.querySelector('.calendar-grid');

const changeBgBtn = document.getElementById('change-bg');
const bgFileInput = document.getElementById('bg-file');
const container = document.querySelector('.container');
// 初始化当前日期和年月
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();

// 任务存储：按日期分类（本地存储）
let tasksByDate = JSON.parse(localStorage.getItem('tasksByDate')) || {};
// 当前过滤状态
let currentFilter = 'all';

// ========== 日历渲染函数 ==========
function renderCalendar() {
    // 清空日历格子（保留星期标题）
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekdayNodes = weekdays.map(day => {
        const div = document.createElement('div');
        div.className = 'calendar-day calendar-weekday';
        div.textContent = day;
        return div;
    });

    // 清空日历并重新添加星期标题
    calendarGrid.innerHTML = '';
    weekdayNodes.forEach(node => calendarGrid.appendChild(node));

    // 设置日历标题（此时 calendarTitle 已能正确获取）
    calendarTitle.textContent = `${currentYear}年${currentMonth + 1}月`;
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day';
        emptyDiv.style.visibility = 'hidden'; // 保留占位，布局更整齐
        calendarGrid.appendChild(emptyDiv);
    }

    // 填充日期格子
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        // 标记当前选中的日期
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (dateStr === getDateStr(currentDate)) {
            dayDiv.classList.add('active-date');
        }
        // 点击日期切换选中状态
        dayDiv.addEventListener('click', () => {
            currentDate = new Date(currentYear, currentMonth, day);
            document.querySelectorAll('.calendar-day.active-date').forEach(div => div.classList.remove('active-date'));
            dayDiv.classList.add('active-date');
            renderTasks(); // 切换日期后重新渲染任务
        });
        calendarGrid.appendChild(dayDiv);
    }
}

// ========== 工具函数：格式化日期为 YYYY-MM-DD ==========
function getDateStr(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ========== 任务核心功能 ==========
// 1. 添加任务
function addtask() {
    const tasktext = taskinput.value.trim();
    if (!tasktext) {
        alert("请输入任务内容！");
        return;
    }
    // 获取当前日期的key
    const dateKey = getDateStr(currentDate);
    // 如果该日期无任务数组，初始化
    if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
    }
    // 新增任务
    const newtask = {
        text: tasktext,
        completed: false
    };
    tasksByDate[dateKey].push(newtask);
    savetasks(); // 保存到本地存储
    renderTasks(); // 重新渲染任务
    // 清空输入框并聚焦
    taskinput.value = "";
    taskinput.focus();
}

// 2. 更新未完成任务计数
function updatetaskcount() {
    const dateKey = getDateStr(currentDate);
    const currentTasks = tasksByDate[dateKey] || [];
    const unfinished = currentTasks.filter(task => !task.completed).length;
    taskcount.textContent = `未完成：${unfinished}`;
}

// 3. 渲染任务列表（修复：索引映射错误问题）
function renderTasks() {
    tasklist.innerHTML = ''; // 清空现有任务
    const dateKey = getDateStr(currentDate);
    const currentTasks = tasksByDate[dateKey] || [];

    // 过滤任务（保留原索引）
    const filteredTasks = currentTasks.map((task, idx) => ({ ...task, idx })).filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true; // 全部
    });

    // 渲染过滤后的任务
    filteredTasks.forEach(item => {
        const taskitem = document.createElement('div');
        taskitem.className = 'taskitem';
        taskitem.innerHTML = `
            <input type="checkbox" class="taskcheckbox" ${item.completed ? 'checked' : ''}>
            <span class="tasktext">${item.text}</span>
            <button class="delete">删除</button>
        `;

        // 删除按钮事件（修复：使用原索引删除）
        const deletebtn = taskitem.querySelector('.delete');
        deletebtn.addEventListener('click', () => {
            currentTasks.splice(item.idx, 1); // 原数组删除
            tasksByDate[dateKey] = currentTasks;
            savetasks();
            renderTasks();
        });

        // 复选框切换事件（修复：使用原索引更新）
        const checkbox = taskitem.querySelector('.taskcheckbox');
        checkbox.addEventListener('change', () => {
            currentTasks[item.idx].completed = checkbox.checked;
            tasksByDate[dateKey] = currentTasks;
            savetasks();
            updatetaskcount();
        });

        tasklist.appendChild(taskitem);
    });

    // 更新计数
    updatetaskcount();
}

// 4. 保存任务到本地存储
function savetasks() {
    localStorage.setItem('tasksByDate', JSON.stringify(tasksByDate));
}

// ========== 事件绑定 ==========
// 清除已完成任务
clearbtn.addEventListener('click', () => {
    const dateKey = getDateStr(currentDate);
    tasksByDate[dateKey] = (tasksByDate[dateKey] || []).filter(task => !task.completed);
    savetasks();
    renderTasks();
});

// 日历翻页
prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
});

// 添加任务（点击/回车）
addbutton.addEventListener('click', addtask);
taskinput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addtask();
});

// 过滤按钮
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// ========== 初始化 ==========
renderCalendar(); // 渲染日历
renderTasks();    // 渲染任务

changeBgBtn.addEventListener('click', () => {
    bgFileInput.click();
});

bgFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert('请选择图片格式的文件（如jpg、png等）！');
        return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
        const bgUrl = readerEvent.target.result;
        container.style.backgroundImage = `url(${bgUrl})`;
        localStorage.setItem('customBg', bgUrl);
    };
    reader.readAsDataURL(file);
});

function initBg() {
    const savedBg = localStorage.getItem('customBg');
    if (savedBg) {
        container.style.backgroundImage = `url(${savedBg})`;
    }
}

initBg();


// 恢复默认背景
const resetBgBtn = document.getElementById('reset-bg');
resetBgBtn.addEventListener('click', () => {
    container.style.backgroundImage = 'url(./image/220251206_000256.jpg)';
    localStorage.removeItem('customBg');
});