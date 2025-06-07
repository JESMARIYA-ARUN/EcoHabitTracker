// Script for EcoHabits interactivity

document.addEventListener('DOMContentLoaded', () => {
  // Form and UI elements
  const habitForm = document.getElementById('habit-form');
  const habitNameSelect = document.getElementById('habit-name');
  const habitDateInput = document.getElementById('habit-date');
  const habitList = document.getElementById('habit-list');
  const progressBarsContainer = document.getElementById('progress-bars');
  const badgesContainer = document.getElementById('badges');
  const tipFilterInput = document.getElementById('tip-filter');
  const tipsList = document.getElementById('tips-list');

  // New habit input and button
  const newHabitInput = document.getElementById('new-habit');
  const addHabitBtn = document.getElementById('add-habit-btn');

  // Store habit logs here: { habitName: Set of logged dates (string) }
  const habitLogs = {};

  // Initialize progress bars (with initial habits)
  const habits = Array.from(habitNameSelect.options)
    .filter(opt => opt.value)
    .map(opt => opt.value);

  habits.forEach(habit => {
    habitLogs[habit] = new Set();
    createProgressBar(habit);
  });

  // Restrict habit date input to current month with max as today
  function setDateInputLimits() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // month is 0-based

    // Format month and day with leading zeros
    const pad = n => n.toString().padStart(2, '0');

    const firstDayOfMonth = `${year}-${pad(month)}-01`;
    const today = `${year}-${pad(month)}-${pad(now.getDate())}`;

    habitDateInput.min = firstDayOfMonth;
    habitDateInput.max = today;
  }
  setDateInputLimits();

  // Create a progress bar element for a habit
  function createProgressBar(habit) {
    const container = document.createElement('div');
    container.className = 'progress-bar-container';
    container.setAttribute('aria-label', `Progress for ${habit}`);

    const label = document.createElement('div');
    label.textContent = habit;
    label.style.fontWeight = '600';
    label.style.marginBottom = '4px';

    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    bar.id = `progress-${habit.replace(/\s+/g, '-')}`;

    container.appendChild(label);
    container.appendChild(bar);
    progressBarsContainer.appendChild(container);
  }

  // Update progress bars based on habitLogs
  function updateProgressBars() {
    // Define a period for tracking progress (last 30 days)
    const daysToTrack = 30;
    const now = new Date();

    habits.forEach(habit => {
      // Count how many days in last 30 user logged this habit
      let count = 0;
      for (let i = 0; i < daysToTrack; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (habitLogs[habit].has(dateStr)) {
          count++;
        }
      }

      const percent = (count / daysToTrack) * 100;
      const bar = document.getElementById(`progress-${habit.replace(/\s+/g, '-')}`);
      if (bar) {
        bar.style.width = `${percent}%`;
        bar.textContent = `${Math.round(percent)}%`;
      }
    });

    updateBadges();
  }

  // Add badges for habits logged 20+ times in last 30 days
  function updateBadges() {
    badgesContainer.innerHTML = ''; // Clear badges

    habits.forEach(habit => {
      // Count logs in last 30 days
      const daysToTrack = 30;
      const now = new Date();
      let count = 0;
      for (let i = 0; i < daysToTrack; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (habitLogs[habit].has(dateStr)) {
          count++;
        }
      }
      if (count >= 20) {
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = `Eco Champ: ${habit}`;
        badgesContainer.appendChild(badge);
      }
    });
  }

  // Add a habit log entry to the habit list UI, with a delete button
  function addHabitEntryToList(habit, date) {
    const entry = document.createElement('div');
    entry.className = 'habit-entry';

    const habitSpan = document.createElement('span');
    habitSpan.textContent = habit;

    const dateSpan = document.createElement('span');
    dateSpan.textContent = new Date(date).toLocaleDateString();

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', `Delete log for ${habit} on ${dateSpan.textContent}`);
    deleteBtn.style.marginLeft = '1rem';
    deleteBtn.addEventListener('click', () => {
      // Remove from habitLogs
      if (habitLogs[habit]) {
        habitLogs[habit].delete(date);
      }
      // Remove from UI
      entry.remove();
      updateProgressBars();
    });

    entry.appendChild(habitSpan);
    entry.appendChild(dateSpan);
    entry.appendChild(deleteBtn);

    habitList.prepend(entry);
  }

  // Handle form submission - log habit for a date
  habitForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedHabit = habitNameSelect.value;
    const selectedDate = habitDateInput.value;

    if (!selectedHabit) {
      alert('Please select a habit.');
      return;
    }

    if (!selectedDate) {
      alert('Please select a date.');
      return;
    }

    // Add habit log entry
    if (!habitLogs[selectedHabit]) {
      habitLogs[selectedHabit] = new Set();
      // Also create progress bar for new habit
      createProgressBar(selectedHabit);
      habits.push(selectedHabit);
    }

    // Prevent duplicate entries for same habit & date
    if (habitLogs[selectedHabit].has(selectedDate)) {
      alert(`You already logged "${selectedHabit}" on ${selectedDate}.`);
      return;
    }

    habitLogs[selectedHabit].add(selectedDate);
    addHabitEntryToList(selectedHabit, selectedDate);
    updateProgressBars();

    // Reset form
    habitForm.reset();
    setDateInputLimits(); // reset date limits if needed
  });

  // Add new habit dynamically from input box
  addHabitBtn.addEventListener('click', () => {
    const newHabit = newHabitInput.value.trim();
    if (newHabit === '') {
      alert('Please enter a habit name.');
      return;
    }
    // Check if habit already exists (case insensitive)
    const exists = Array.from(habitNameSelect.options).some(
      option => option.value.toLowerCase() === newHabit.toLowerCase()
    );
    if (exists) {
      alert('This habit already exists in the list.');
      return;
    }

    // Create new option and add it to the select dropdown
    const newOption = document.createElement('option');
    newOption.value = newHabit;
    newOption.textContent = newHabit;
    habitNameSelect.appendChild(newOption);

    // Initialize habitLogs for new habit
    habitLogs[newHabit] = new Set();
    habits.push(newHabit);
    createProgressBar(newHabit);

    // Clear input field
    newHabitInput.value = '';

    alert(`Habit "${newHabit}" added! You can now select it from the list.`);
  });

  // Filter Eco Tips dynamically
  tipFilterInput.addEventListener('input', () => {
    const filter = tipFilterInput.value.toLowerCase();
    const tips = tipsList.querySelectorAll('li');
    tips.forEach(tip => {
      if (tip.textContent.toLowerCase().includes(filter)) {
        tip.style.display = '';
      } else {
        tip.style.display = 'none';
      }
    });
  });

  // On initial load, update progress bars to reflect empty data
  updateProgressBars();
});
