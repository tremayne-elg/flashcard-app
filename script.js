// ==========================
// 1. GLOBAL VARIABLES & STATE
// ==========================

const mode_form = document.getElementById('mode-form');
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
    saveStacksToLocalStorage(); // 🔹 Save after adding
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
    saveStacksToLocalStorage(); // 🔹 Save after deleting
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

      const newTitle = document.createElement('h1');
      newTitle.className = 'stack-name';
      newTitle.textContent = input.value.toUpperCase();
      input.replaceWith(newTitle);

      const newDesc = document.createElement('p');
      newDesc.className = 'back-description';
      newDesc.style.whiteSpace = 'pre-wrap';
      newDesc.textContent = textarea.value;
      textarea.replaceWith(newDesc);

      stack.dataset.description = newDesc.textContent;

      saveStacksToLocalStorage(); // 🔹 Save after editing
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
  if (editting) return; // Don’t save during edit mode

  const data = [];
  document.querySelectorAll('.parent-stack').forEach(stack => {
    const titleElement = stack.querySelector('.stack-name') || stack.querySelector('.stack-name-input');
    const descElement = stack.querySelector('.back-description') || stack.querySelector('.back-description-input');
    const title = titleElement?.textContent || '';
    const description = descElement?.textContent || '';
    data.push({ title, description });
  });

  localStorage.setItem('flashcards', JSON.stringify(data));
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
