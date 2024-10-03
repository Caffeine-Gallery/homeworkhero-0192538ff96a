import { backend } from 'declarations/backend';

document.addEventListener('DOMContentLoaded', async () => {
    const homeworkForm = document.getElementById('homework-form');
    const homeworkList = document.getElementById('homework-items');
    const calendarView = document.getElementById('calendar-view');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const currentMonthYearSpan = document.getElementById('current-month-year');

    let currentDate;
    let homeworkData = [];

    // Load all homework on page load
    await loadHomework();

    homeworkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const assignedDate = new Date(document.getElementById('assigned-date').value).getTime();
        const dueDate = new Date(document.getElementById('due-date').value).getTime();

        await backend.addHomework(title, description, BigInt(assignedDate), BigInt(dueDate));
        homeworkForm.reset();
        await loadHomework();
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    async function loadHomework() {
        homeworkData = await backend.getAllHomework();
        displayHomework();
        setInitialDate();
        renderCalendar();
    }

    function setInitialDate() {
        if (homeworkData.length > 0) {
            const earliestDueDate = homeworkData.reduce((earliest, hw) => {
                const dueDate = new Date(Number(hw.dueDate));
                return dueDate < earliest ? dueDate : earliest;
            }, new Date(Number(homeworkData[0].dueDate)));
            currentDate = new Date(earliestDueDate.getFullYear(), earliestDueDate.getMonth(), 1);
        } else {
            currentDate = new Date();
        }
    }

    function displayHomework() {
        homeworkList.innerHTML = '';
        homeworkData.forEach(hw => {
            const li = document.createElement('li');
            li.innerHTML = `
                <h3>${hw.title}</h3>
                <p>${hw.description}</p>
                <p>Assigned: ${formatDate(new Date(Number(hw.assignedDate)))}</p>
                <p>Due: ${formatDate(new Date(Number(hw.dueDate)))}</p>
                <button onclick="deleteHomework(${hw.id})">Delete</button>
            `;
            homeworkList.appendChild(li);
        });
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        currentMonthYearSpan.textContent = `${getMonthName(month)} ${year}`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        calendarView.innerHTML = '';
        
        // Create header row with day names
        const headerRow = document.createElement('div');
        headerRow.className = 'calendar-row';
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-cell header';
            dayHeader.textContent = day;
            headerRow.appendChild(dayHeader);
        });
        calendarView.appendChild(headerRow);
        
        let currentRow = document.createElement('div');
        currentRow.className = 'calendar-row';
        
        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            currentRow.appendChild(createEmptyCell());
        }
        
        // Fill in the days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            if (currentRow.children.length === 7) {
                calendarView.appendChild(currentRow);
                currentRow = document.createElement('div');
                currentRow.className = 'calendar-row';
            }
            
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            cell.textContent = day;
            
            const cellDate = new Date(year, month, day);
            const assignments = getAssignmentsForDate(cellDate);
            
            if (assignments.length > 0) {
                cell.classList.add('has-assignments');
                const assignmentList = document.createElement('ul');
                assignments.forEach(assignment => {
                    const assignmentItem = document.createElement('li');
                    assignmentItem.innerHTML = `
                        <strong>${assignment.title}</strong>
                        <p class="homework-description">${assignment.description}</p>
                        <p class="homework-dates">
                            Assigned: ${formatDate(new Date(Number(assignment.assignedDate)))}<br>
                            Due: ${formatDate(new Date(Number(assignment.dueDate)))}
                        </p>
                    `;
                    assignmentList.appendChild(assignmentItem);
                });
                cell.appendChild(assignmentList);
            }
            
            currentRow.appendChild(cell);
        }
        
        // Add empty cells for days after the last of the month
        while (currentRow.children.length < 7) {
            currentRow.appendChild(createEmptyCell());
        }
        
        calendarView.appendChild(currentRow);
    }

    function createEmptyCell() {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell empty';
        return cell;
    }

    function getAssignmentsForDate(date) {
        return homeworkData.filter(hw => {
            const assignedDate = new Date(Number(hw.assignedDate));
            const dueDate = new Date(Number(hw.dueDate));
            return (assignedDate.toDateString() === date.toDateString() || 
                    dueDate.toDateString() === date.toDateString());
        });
    }

    function formatDate(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    function getMonthName(monthIndex) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthIndex];
    }

    window.deleteHomework = async (id) => {
        await backend.deleteHomework(id);
        await loadHomework();
    };
});
