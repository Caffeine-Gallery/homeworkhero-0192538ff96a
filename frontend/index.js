import { backend } from 'declarations/backend';

document.addEventListener('DOMContentLoaded', async () => {
  const homeworkForm = document.getElementById('homework-form');
  const homeworkList = document.getElementById('homework-items');
  const agendaItems = document.getElementById('agenda-items');
  const calendarView = document.getElementById('calendar-view');
  const listViewBtn = document.getElementById('list-view-btn');
  const calendarViewBtn = document.getElementById('calendar-view-btn');

  // Load all homework on page load
  await loadHomework();

  homeworkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = new Date(document.getElementById('due-date').value).getTime();

    await backend.addHomework(title, description, BigInt(dueDate));
    homeworkForm.reset();
    await loadHomework();
  });

  listViewBtn.addEventListener('click', () => {
    listViewBtn.classList.add('active');
    calendarViewBtn.classList.remove('active');
    agendaItems.classList.remove('hidden');
    calendarView.classList.add('hidden');
  });

  calendarViewBtn.addEventListener('click', () => {
    calendarViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    calendarView.classList.remove('hidden');
    agendaItems.classList.add('hidden');
  });

  async function loadHomework() {
    const homework = await backend.getAllHomework();
    displayHomework(homework);
    displayAgenda(homework);
    displayCalendar(homework);
  }

  function displayHomework(homework) {
    homeworkList.innerHTML = '';
    homework.forEach(hw => {
      const li = document.createElement('li');
      li.innerHTML = `
        <h3>${hw.title}</h3>
        <p>${hw.description}</p>
        <p>Due: ${new Date(Number(hw.dueDate)).toLocaleDateString()}</p>
        <button onclick="deleteHomework(${hw.id})">Delete</button>
      `;
      homeworkList.appendChild(li);
    });
  }

  function displayAgenda(homework) {
    agendaItems.innerHTML = '';
    const sortedHomework = homework.sort((a, b) => Number(a.dueDate) - Number(b.dueDate));
    sortedHomework.forEach(hw => {
      const div = document.createElement('div');
      div.className = 'agenda-item';
      div.innerHTML = `
        <h3>${hw.title}</h3>
        <p>${hw.description}</p>
        <p>Due: ${new Date(Number(hw.dueDate)).toLocaleDateString()}</p>
      `;
      agendaItems.appendChild(div);
    });
  }

  function displayCalendar(homework) {
    calendarView.innerHTML = '';
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.innerHTML = `<div class="date">${d.getDate()}</div>`;

      const dayHomework = homework.filter(hw => {
        const hwDate = new Date(Number(hw.dueDate));
        return hwDate.toDateString() === d.toDateString();
      });

      dayHomework.forEach(hw => {
        const hwElement = document.createElement('div');
        hwElement.className = 'calendar-homework';
        hwElement.textContent = hw.title;
        dayElement.appendChild(hwElement);
      });

      calendarView.appendChild(dayElement);
    }
  }

  window.deleteHomework = async (id) => {
    await backend.deleteHomework(id);
    await loadHomework();
  };
});
