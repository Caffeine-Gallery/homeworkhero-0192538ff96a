import { backend } from 'declarations/backend';

document.addEventListener('DOMContentLoaded', async () => {
  const homeworkForm = document.getElementById('homework-form');
  const homeworkList = document.getElementById('homework-items');
  const agendaItems = document.getElementById('agenda-items');

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

  async function loadHomework() {
    const homework = await backend.getAllHomework();
    displayHomework(homework);
    displayAgenda(homework);
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
      div.innerHTML = `
        <h3>${hw.title}</h3>
        <p>Due: ${new Date(Number(hw.dueDate)).toLocaleDateString()}</p>
      `;
      agendaItems.appendChild(div);
    });
  }

  window.deleteHomework = async (id) => {
    await backend.deleteHomework(id);
    await loadHomework();
  };
});
