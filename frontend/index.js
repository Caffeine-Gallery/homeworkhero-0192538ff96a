import { backend } from 'declarations/backend';

document.addEventListener('DOMContentLoaded', async () => {
    const addHomeworkBtn = document.getElementById('add-homework-btn');
    const homeworkForm = document.getElementById('homework-form');
    const homeworkList = document.getElementById('homework-items');
    const calendarView = document.getElementById('calendar-view');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const currentMonthYearSpan = document.getElementById('current-month-year');
    const homeworkModal = document.getElementById('homework-modal');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const closeButton = document.querySelector('.close');

    let currentDate;
    let homeworkData = [];
    let isEditing = false;

    // Load all homework on page load
    await loadHomework();

    addHomeworkBtn.addEventListener('click', () => {
        openModal();
    });

    homeworkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('homework-id').value;
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const assignedDate = new Date(document.getElementById('assigned-date').value).getTime();
        const dueDate = new Date(document.getElementById('due-date').value).getTime();

        if (isEditing) {
            await backend.updateHomework(Number(id), title, description, BigInt(assignedDate), BigInt(dueDate));
        } else {
            await backend.addHomework(title, description, BigInt(assignedDate), BigInt(dueDate));
        }

        homeworkForm.reset();
        homeworkModal.style.display = 'none';
        await loadHomework();
    });

    closeButton.onclick = () => {
        homeworkModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === homeworkModal) {
            homeworkModal.style.display = 'none';
        }
    };

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    async function loadHomework() {
        try {
            homeworkData = await backend.getAllHomework();
            console.log('Loaded homework data:', homeworkData);
            displayHomework();
            setInitialDate();
            renderCalendar();
        } catch (error) {
            console.error('Error loading homework:', error);
            alert('Failed to load homework. Please try refreshing the page.');
        }
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
                <button onclick="editHomework(${hw.id})">Edit</button>
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

    function formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    function openModal(homework = null) {
        isEditing = !!homework;
        modalTitle.textContent = isEditing ? 'Edit Homework' : 'Add New Homework';
        submitBtn.textContent = isEditing ? 'Update Homework' : 'Add Homework';

        if (isEditing) {
            document.getElementById('homework-id').value = homework.id;
            document.getElementById('title').value = homework.title;
            document.getElementById('description').value = homework.description;
            document.getElementById('assigned-date').value = formatDateForInput(new Date(Number(homework.assignedDate)));
            document.getElementById('due-date').value = formatDateForInput(new Date(Number(homework.dueDate)));
        } else {
            homeworkForm.reset();
        }

        homeworkModal.style.display = 'block';
    }

    window.deleteHomework = async (id) => {
        try {
            await backend.deleteHomework(id);
            await loadHomework();
        } catch (error) {
            console.error('Error deleting homework:', error);
            alert('Failed to delete homework. Please try again.');
        }
    };

    window.editHomework = (id) => {
        console.log('Edit homework called with id:', id);
        const homework = homeworkData.find(hw => Number(hw.id) === Number(id));
        console.log('Found homework:', homework);
        if (homework) {
            openModal(homework);
        } else {
            console.error('Homework not found for id:', id);
            alert('Error: Homework not found. Please try refreshing the page.');
        }
    };
});
