// ==========================
// 1. GLOBAL VARIABLES & STATE
// ==========================

let mode_form = document.getElementById('mode-form');
const banner_body = document.getElementById('banner-body');
const stack_space = document.getElementById('stack-space');

let cardCount = 0;
let editting = 0;

// ==========================
// 2. MAIN EVENT LISTENERS
// ==========================

mode_form.addEventListener('change', handleModeChange);
stack_space.addEventListener('click', handleCardClick);
document.addEventListener('click', handleCardFlip);

// ==========================
// 3. MODE SWITCH HANDLER
// ==========================

function handleModeChange() {
  editting = 0;
  exitAllEditModes();

  const selected = mode_form.querySelector('input[name="mode"]:checked');
  const selectedStack = document.querySelector('.card-stack.selected');

  if (selectedStack) attachDecideContainer(selectedStack, selected?.id);

  if (selected?.id === 'add') renderAddForm(selected);
  else if (selected?.id === 'delete') renderDeletePanel();
  else renderDefaultPrompt();
}

// ==========================
// 4. STACK INTERACTION HANDLERS
// ==========================

// ---- ADD NEW STACK ----
function addStack(add_btn, card_ttle, description_txt, selected) {
  add_btn.addEventListener('click', () => {
    const cardValue = card_ttle.value;
    const descValue = description_txt.value;

    card_ttle.style.outline = 'none';
    description_txt.style.outline = 'none';

    let valid = true;
    if (!cardValue) {
      card_ttle.style.outline = '2px solid var(--delete-red)';
      valid = false;
    }
    if (!descValue) {
      description_txt.style.outline = '2px solid var(--delete-red)';
      valid = false;
    }
    if (!valid) return;

    cardCount++;

    const parent = document.createElement('div');
    parent.className = 'parent-stack';

    const card = document.createElement('div');
    card.className = 'card-stack';
    card.dataset.description = descValue;
    card.innerHTML = `
      <h1 id="c${cardCount}" class="stack-name">${cardValue.toUpperCase()}</h1>
      <button type="button" class="next-button" style="display:none;">&#x27F3;</button>
    `;

    const back = document.createElement('div');
    back.className = 'card-stack-back';
    back.innerHTML = `
      <div class="description-body">
        <p class="back-description" style="white-space: pre-wrap;">${descValue}</p>
      </div>
    `;

    parent.appendChild(card);
    parent.appendChild(back);
    stack_space.appendChild(parent);

    card_ttle.value = '';
    description_txt.value = '';
    selected.checked = false;

    mode_form.dispatchEvent(new Event('change', { bubbles: true }));
    saveStacksToLocalStorage();
  });
}

// ---- SELECT STACK ----
function handleCardClick(e) {
  if (editting) return;
  if (e.target.closest('#decide-container')) return;

  const stack = e.target.closest('.card-stack');
  if (!stack) return;

  document.querySelectorAll('.card-stack').forEach(el => {
    el.classList.remove('selected');
    const existing = el.querySelector('#decide-container');
    if (existing) existing.remove();
    const nextBtn = el.querySelector('.next-button');
    if (nextBtn) nextBtn.style.display = 'none';
    const parent = el.closest('.parent-stack');
    parent.classList.remove('show-back', 'edit-mode');
  });

  stack.classList.add('selected');

  const selectedMode = document.querySelector('input[name="mode"]:checked');
  const mode = selectedMode ? selectedMode.id : null;

  attachDecideContainer(stack, mode);
}

// ---- DELETE STACK ----
function deleteFunctionality() {
  const selected = mode_form.querySelector('input[name="mode"]:checked');
  const delete_button = document.getElementById('delete-button');
  delete_button.addEventListener('click', () => {
    document.querySelectorAll('.card-stack').forEach(stack => {
      if (stack.classList.contains('selected')) {
        stack.closest('.parent-stack').remove();
        cardCount--;
      }
    });
    selected.checked = false;
    mode_form.dispatchEvent(new Event('change', { bubbles: true }));
    saveStacksToLocalStorage();
  });
}

// ---- FLIP STACK FRONT / BACK ----
function handleCardFlip(e) {
  if (e.target.classList.contains('next-button')) {
    const parent = e.target.closest('.parent-stack');
    parent.classList.add('show-back');
  }

  if (e.target.closest('.card-stack-back')) {
    const parent = e.target.closest('.parent-stack');
    parent.classList.remove('show-back');
  }
}

// ==========================
// 5. EDIT MODE HANDLERS
// ==========================

function attachEditHandler(stack, container) {
  const editButton = container.querySelector('#edit-button');
  if (!editButton) return;

  editButton.addEventListener('click', () => {
    const parent = stack.closest('.parent-stack');
    const nextBtn = stack.querySelector('.next-button');
    const cancelBtn = container.querySelector('#cancel-button');
    const playBtn = container.querySelector('#play-button');

    parent.classList.remove('show-back');
    const isEditing = parent.classList.toggle('edit-mode');

    if (isEditing) {
      editting = 1;
      editButton.innerHTML = "&#10003;";
      if (nextBtn) nextBtn.style.display = "none";

      document.querySelectorAll('#mode-form .horizontal').forEach(span => {
        const input = span.querySelector('input');
        input.disabled = true;
        span.classList.add('disabled');
      });

      document.querySelectorAll('button:not(#edit-button)').forEach(btn => btn.disabled = true);

      const title = stack.querySelector('.stack-name');
      const input = document.createElement('input');
      input.className = 'stack-name-input';
      input.value = title.textContent;
      input.setAttribute('data-old-title', title.textContent); 
      title.replaceWith(input);

      const desc = parent.querySelector('.back-description');
      const textarea = document.createElement('textarea');
      textarea.className = 'back-description-input';
      textarea.value = desc.textContent;
      desc.replaceWith(textarea);

      function validateEditFields() {
        let valid = true;
        if (!input.value.trim()) {
          input.style.border = '2px dashed var(--delete-red)';
          valid = false;
        } else input.style.border = '';

        if (!textarea.value.trim()) {
          textarea.style.border = '2px dashed var(--delete-red)';
          valid = false;
        } else textarea.style.border = '';

        if (!valid) {
          editButton.disabled = true;
          editButton.style.filter = 'brightness(70%)';
          editButton.style.cursor = 'not-allowed';
        } else {
          editButton.disabled = false;
          editButton.style.filter = '';
          editButton.style.cursor = 'pointer';
        }
      }

      input.addEventListener('input', validateEditFields);
      textarea.addEventListener('input', validateEditFields);
      validateEditFields();

    } else {
      editting = 0;
      editButton.innerHTML = "&#9998;";

      document.querySelectorAll('#mode-form .horizontal').forEach(span => {
        const input = span.querySelector('input');
        input.disabled = false;
        span.classList.remove('disabled');
      });

      document.querySelectorAll('button').forEach(btn => btn.disabled = false);

      const input = stack.querySelector('.stack-name-input');
      const textarea = parent.querySelector('.back-description-input');

      if (nextBtn) nextBtn.style.display = "flex";

      const oldTitle = input.getAttribute('data-old-title') || '';
      const newTitleText = input.value.toUpperCase();

      const newTitle = document.createElement('h1');
      newTitle.className = 'stack-name';
      newTitle.textContent = newTitleText;
      input.replaceWith(newTitle);

      const newDesc = document.createElement('p');
      newDesc.className = 'back-description';
      newDesc.style.whiteSpace = 'pre-wrap';
      newDesc.textContent = textarea.value;
      textarea.replaceWith(newDesc);

      stack.dataset.description = newDesc.textContent;

      if (oldTitle && oldTitle !== newTitleText) {
        const raw = localStorage.getItem('flashcards');
        if (raw) {
          let data = JSON.parse(raw);
          const oldIndex = data.findIndex(s => s.title === oldTitle);
          const newIndex = data.findIndex(s => s.title === newTitleText);

          if (oldIndex !== -1) {
            if (newIndex !== -1 && newIndex !== oldIndex) {
              const oldCards = Array.isArray(data[oldIndex].cards) ? data[oldIndex].cards : [];
              const newCards = Array.isArray(data[newIndex].cards) ? data[newIndex].cards : [];
              data[newIndex].cards = newCards.concat(oldCards);
              data.splice(oldIndex, 1);
            } else {
              data[oldIndex].title = newTitleText;
            }
            localStorage.setItem('flashcards', JSON.stringify(data));
          }
        }
      }

      saveStacksToLocalStorage();
    }

    if (cancelBtn && playBtn) {
      cancelBtn.style.display = isEditing ? 'none' : 'flex';
      playBtn.style.display = isEditing ? 'none' : 'flex';
    }
  });
}

function exitAllEditModes() {
  document.querySelectorAll('.parent-stack.edit-mode').forEach(parent => {
    parent.classList.remove('edit-mode');
  });
  editting = 0;
}

// ==========================
// 6. UI RENDER HELPERS
// ==========================

function renderAddForm(selected) {
  banner_body.innerHTML = `
    <form id="add-form">
      <span class="horizontal2">
        <label for="card-title">TITLE</label>
        <input type="text" id="card-title" name="card-title" placeholder="Name">
      </span>
      <span class="vertical">
        <label for="description-text">DESCRIPTION</label>
        <textarea id="description-text" name="description" placeholder="Description"></textarea>
      </span>
      <button type="button" id="add-button">ADD</button>
    </form>
  `;

  const add_button = document.getElementById('add-button');
  const card_title = document.getElementById('card-title');
  const description_text = document.getElementById('description-text');

  addStack(add_button, card_title, description_text, selected);
}

function renderDeletePanel() {
  banner_body.innerHTML = `
    <span id="delete-container">
      <p id="select-p">Select the stack you want to delete.</p>
      <button type="button" id="delete-button">DELETE</button>
    </span>
  `;
  deleteFunctionality();
}

function renderDefaultPrompt() {
  banner_body.innerHTML = `
    <span id="delete-container">
      <p id="select-p">Select the stack you want to interact with.</p>
    </span>
  `;
}

function attachDecideContainer(stack, mode) {
  const existing = stack.querySelector('#decide-container');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'decide-container';

  if (mode === 'delete') {
    container.innerHTML = `<button type="button" id="cancel-button">&#x2716;</button>`;
  } else {
    container.innerHTML = `
      <button type="button" id="edit-button">&#9998;</button>
      <button type="button" id="play-button">&#x25B6;</button>
      <button type="button" id="cancel-button">&#x2716;</button>
    `;
  }

  stack.appendChild(container);
  const nextBtn = stack.querySelector('.next-button');
  if (!editting && nextBtn) nextBtn.style.display = 'flex';

  attachEditHandler(stack, container);

  const playBtn = container.querySelector('#play-button');
  if (playBtn) {
    playBtn.onclick = () => initPlayMode(stack);
  }

  container.querySelector('#cancel-button').onclick = () => {
    const parent = stack.closest('.parent-stack');
    if (nextBtn) nextBtn.style.display = 'none';
    stack.classList.remove('selected');
    parent.classList.remove('show-back', 'edit-mode');
    container.remove();
  };
}

// ==========================
// 7. LOCALSTORAGE UTILITY 
// ==========================

function saveStacksToLocalStorage() {
  if (editting) return;

  let data = [];
  const raw = localStorage.getItem('flashcards');
  if (raw) data = JSON.parse(raw);

  const newData = [];
  document.querySelectorAll('.parent-stack').forEach(stack => {
    const titleElement = stack.querySelector('.stack-name') || stack.querySelector('.stack-name-input');
    const descElement = stack.querySelector('.back-description') || stack.querySelector('.back-description-input');
    const title = titleElement?.textContent || '';
    const description = descElement?.textContent || '';

    const existing = data.find(s => s.title === title);
    const cards = existing && Array.isArray(existing.cards) ? existing.cards : [];

    newData.push({ title, description, cards });
  });

  localStorage.setItem('flashcards', JSON.stringify(newData));
}

function loadStacksFromLocalStorage() {
  const raw = localStorage.getItem('flashcards');
  if (!raw) return;

  const cards = JSON.parse(raw);
  cards.forEach(({ title, description }) => {
    cardCount++;

    const parent = document.createElement('div');
    parent.className = 'parent-stack';

    const card = document.createElement('div');
    card.className = 'card-stack';
    card.dataset.description = description;
    card.innerHTML = `
      <h1 id="c${cardCount}" class="stack-name">${title.toUpperCase()}</h1>
      <button type="button" class="next-button" style="display:none;">&#x27F3;</button>
    `;

    const back = document.createElement('div');
    back.className = 'card-stack-back';
    back.innerHTML = `
      <div class="description-body">
        <p class="back-description" style="white-space: pre-wrap;">${description}</p>
      </div>
    `;

    parent.appendChild(card);
    parent.appendChild(back);
    stack_space.appendChild(parent);
  });
}

// ==========================
// 8. INITIALIZATION
// ==========================

loadStacksFromLocalStorage();

// ==========================
// 9. PLAY MODE INITIALIZATION
// ==========================

let playMode = false;
let currentStackId = null;
let playCards = [];
let currentCardIndex = 0;
let showQuestion = true;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function initPlayMode(stack) {
  playMode = true;
  currentCardIndex = 0;
  showQuestion = true;

  document.querySelectorAll('#mode-form input[type="radio"]').forEach(radio => {
    radio.checked = false;
    radio.disabled = true; // Disable radios in play mode
    radio.parentElement.classList.add('disabled');
  });

  document.querySelectorAll('.parent-stack').forEach(el => el.style.display = 'none');

  banner_body.innerHTML = '';

  const stackTitle = stack.querySelector('.stack-name').textContent.trim();
  currentStackId = stackTitle;

  const raw = localStorage.getItem('flashcards');
  let data = raw ? JSON.parse(raw) : [];

  let stackData = data.find(s => s.title === currentStackId);
  if (!stackData) {
    stackData = { title: currentStackId, description: "", cards: [] };
    data.push(stackData);
    localStorage.setItem('flashcards', JSON.stringify(data));
  }

  playCards = stackData.cards || [];

  renderPlayModeLayout(stackTitle);

  if (playCards.length === 0) {
    renderCreateCard();
  } else {
    renderStudyMode();
  }
}

function renderPlayModeLayout(title) {
  stack_space.style.display = 'none';
  const playContainer = document.getElementById('play-mode-container');
  playContainer.style.display = 'flex';
  playContainer.innerHTML = `
    <div id="play-mode-header">
      <h2 id="play-stack-title">${title}</h2>
      <button id="exit-play-mode">&#9208;</button>
    </div>
    <div id="play-card-area"></div>
  `;
  document.getElementById('exit-play-mode').onclick = exitPlayMode;
}

function renderCreateCard() {
  const cardArea = document.getElementById('play-card-area');
  if (!cardArea) return;

  cardArea.innerHTML = `
    <form id="play-add-form">
      <div class="form-row">
        <div class="form-column">
          <label for="play-card-title">CARD FRONT</label>
          <textarea id="play-card-title" placeholder="Question"></textarea>
        </div>
        <div class="form-column">
          <label for="play-card-description">CARD BACK</label>
          <textarea id="play-card-description" placeholder="Answer"></textarea>
        </div>
      </div>
      <button type="submit">+</button>
    </form>
  `;

  const form = document.getElementById('play-add-form');
  const titleInput = document.getElementById('play-card-title');
  const descInput = document.getElementById('play-card-description');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const description = descInput.value.trim();

    if (!title || !description) {
      if (!title) titleInput.style.border = '2px solid var(--delete-red)';
      if (!description) descInput.style.border = '2px solid var(--delete-red)';
      return;
    }

    titleInput.style.border = '';
    descInput.style.border = '';

    const raw = localStorage.getItem('flashcards');
    if (!raw) return;
    const data = JSON.parse(raw);

    const stackIndex = data.findIndex(stack => stack.title === currentStackId);
    if (stackIndex === -1) return;

    if (!data[stackIndex].cards) data[stackIndex].cards = [];
    data[stackIndex].cards.push({ title, description });

    localStorage.setItem('flashcards', JSON.stringify(data));

    titleInput.value = '';
    descInput.value = '';

    playCards = data[stackIndex].cards;
    currentCardIndex = playCards.length - 1;
    renderStudyMode();
  });
}

function renderStudyMode() {
  if (playCards.length === 0) return;

  const cardArea = document.getElementById('play-card-area');
  cardArea.innerHTML = `
    <div id="study-mode">
      <div id="study-card">
        <button id="flip-button">A</button>
        <div id="study-card-content"></div>
      </div>
      <div id="study-controls">
        <button id="prev-card">&#8592</button>
        <button id="delete-card">&#9003;</button>
        <button id="shuffle-cards">&#8644;</button>
        <button id="add-card">&#43;</button>
        <button id="next-card">&#8594;</button>
      </div>
      <div id="card-counter" style="text-align:center; margin-top: 1vh; font-weight:bold;"></div>
    </div>
  `;

  updateStudyCard();

  document.getElementById('flip-button').onclick = () => {
    showQuestion = !showQuestion;
    updateStudyCard();
  };

  document.getElementById('prev-card').onclick = () => {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      showQuestion = true;
      updateStudyCard();
    }
  };

  document.getElementById('next-card').onclick = () => {
    if (currentCardIndex < playCards.length - 1) {
      currentCardIndex++;
      showQuestion = true;
      updateStudyCard();
    }
  };

  document.getElementById('shuffle-cards').onclick = () => {
    shuffleArray(playCards);
    currentCardIndex = 0;
    showQuestion = true;
    updateStudyCard();
  };

  document.getElementById('delete-card').onclick = () => {
    const raw = localStorage.getItem('flashcards');
    if (!raw) return;
    const data = JSON.parse(raw);

    const stackIndex = data.findIndex(stack => stack.title === currentStackId);
    if (stackIndex === -1) return;

    data[stackIndex].cards.splice(currentCardIndex, 1);
    localStorage.setItem('flashcards', JSON.stringify(data));

    playCards.splice(currentCardIndex, 1);
    if (currentCardIndex > 0) currentCardIndex--;
    showQuestion = true;

    if (playCards.length === 0) {
      renderCreateCard();
    } else {
      updateStudyCard();
    }
  };

  document.getElementById('add-card').onclick = renderCreateCard;
}

function updateStudyCard() {
  const card = playCards[currentCardIndex];
  const contentDiv = document.getElementById('study-card-content');
  if (!card || !contentDiv) return;

  contentDiv.textContent = showQuestion ? card.title : card.description;

  const flipBtn = document.getElementById('flip-button');
  flipBtn.textContent = showQuestion ? 'Q' : 'A';

  const counterDiv = document.getElementById('card-counter');
  if (counterDiv) {
    counterDiv.textContent = `${playCards.length === 0 ? 0 : currentCardIndex + 1} / ${playCards.length}`;
  }
}

function exitPlayMode() {
  playMode = false;
  currentStackId = null;
  playCards = [];
  currentCardIndex = 0;
  showQuestion = true;

  document.getElementById('play-mode-container').style.display = 'none';
  document.getElementById('stack-space').style.display = '';

  document.querySelectorAll('#mode-form input[type="radio"]').forEach(radio => {
    radio.disabled = false;
    radio.parentElement.classList.remove('disabled');
  });

  renderDefaultPrompt();

  document.querySelectorAll('.parent-stack').forEach(el => el.style.display = 'flex');
}

