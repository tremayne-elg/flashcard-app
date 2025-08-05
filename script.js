// DOM Elements & State
const mode_form = document.getElementById('mode-form');
const banner_body = document.getElementById('banner-body');
const stack_space = document.getElementById('stack-space');
let cardCount = 0;
let editting = 0;

// Mode Change Handler
mode_form.addEventListener('change', () => {
  const selected = mode_form.querySelector('input[name="mode"]:checked');
  editting = 0;
  exitAllEditModes();

  // Show action buttons for selected stack
  const selectedStack = document.querySelector('.card-stack.selected');
  if (selectedStack) {
    const existing = selectedStack.querySelector('#decide-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'decide-container';

    if (selected?.id === 'delete') {
      container.innerHTML = `<button type="button" id="cancel-button">&#x2716;</button>`;
    } else {
      container.innerHTML = `
        <button type="button" id="edit-button">&#9998;</button>
        <button type="button" id="play-button">&#x25B6;</button>
        <button type="button" id="cancel-button">&#x2716;</button>
      `;
    }

    selectedStack.appendChild(container);

    const nextBtn = selectedStack.querySelector('.next-button');
    if (!editting && nextBtn) nextBtn.style.display = 'flex';

    attachEditHandler(selectedStack, container);

    // Cancel button handler
    container.querySelector('#cancel-button').onclick = () => {
      const parent = selectedStack.closest('.parent-stack');
      const nextBtn = selectedStack.querySelector('.next-button');
      if (nextBtn) nextBtn.style.display = 'none';
      selectedStack.classList.remove('selected');
      parent.classList.remove('show-back');
      container.remove();
    };
  }

  // Render mode forms
  if (selected?.id === 'add') {
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

  } else if (selected?.id === 'delete') {
    banner_body.innerHTML = `
      <span id="delete-container">
        <p id="select-p">Select the stack you want to delete.</p>
        <button type="button" id="delete-button">DELETE</button>
      </span>
    `;
    deleteFuntionality();

  } else {
    banner_body.innerHTML = `
      <span id="delete-container">
        <p id="select-p">Select the stack you want to interact with.</p>
      </span>
    `;
  }
});

// Add Stack Handler
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

    // Create card front and back
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

    // Reset form
    card_ttle.value = '';
    description_txt.value = '';
    selected.checked = false;

    // Trigger mode change to refresh UI
    const event = new Event('change', { bubbles: true });
    mode_form.dispatchEvent(event);
  });
}

// Card Selection Handler
stack_space.addEventListener('click', (e) => {
  if (editting) return;
  if (e.target.closest('#decide-container')) return;

  const stack = e.target.closest('.card-stack');
  if (!stack) return;

  // Deselect all stacks
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

  // Show action buttons for selected stack
  const selectedMode = document.querySelector('input[name="mode"]:checked');
  const mode = selectedMode ? selectedMode.id : null;

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

  if (!editting) {
    const nextBtn = stack.querySelector('.next-button');
    if (nextBtn) nextBtn.style.display = 'flex';
  }

  stack.appendChild(container);
  attachEditHandler(stack, container);

  // Cancel button handler
  container.querySelector('#cancel-button').onclick = () => {
    const parent = stack.closest('.parent-stack');
    const nextBtn = stack.querySelector('.next-button');
    if (nextBtn) nextBtn.style.display = 'none';
    stack.classList.remove('selected');
    parent.classList.remove('show-back');
    parent.classList.remove('edit-mode');
    container.remove();
  };
});

// Delete Stack Handler
function deleteFuntionality() {
  const selected = mode_form.querySelector('input[name="mode"]:checked');
  const delete_button = document.getElementById('delete-button');
  delete_button.addEventListener('click', () => {
    const stack_list = document.querySelectorAll('.card-stack');
    for (const stack of stack_list) {
      if (stack.classList.contains('selected')) {
        stack.closest('.parent-stack').remove();
        cardCount--;
      }
    }
    selected.checked = false;
    const event = new Event('change', { bubbles: true });
    mode_form.dispatchEvent(event);
  });
}

// Card Flip Handler
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('next-button')) {
    const parent = e.target.closest('.parent-stack');
    parent.classList.add('show-back');
  }

  if (e.target.closest('.card-stack-back')) {
    const parent = e.target.closest('.parent-stack');
    parent.classList.remove('show-back');
  }
});

// Exit Edit Mode Utility
function exitAllEditModes() {
  document.querySelectorAll('.parent-stack.edit-mode').forEach(parent => {
    parent.classList.remove('edit-mode');
  });
  editting = 0;
}

// Edit Handler for Card
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
      editButton.innerHTML = "&#10003;"; // ✔
      if (nextBtn) nextBtn.style.display = "none";

      // Disable radio inputs and style
      document.querySelectorAll('#mode-form .horizontal').forEach(span => {
        const input = span.querySelector('input');
        input.disabled = true;
        span.classList.add('disabled');
      });

      // Disable all other buttons except edit
      document.querySelectorAll('button:not(#edit-button)').forEach(btn => btn.disabled = true);

      // Replace title with input
      const title = stack.querySelector('.stack-name');
      const input = document.createElement('input');
      input.className = 'stack-name-input';
      input.value = title.textContent;
      title.replaceWith(input);

      // Replace description with textarea
      const desc = parent.querySelector('.back-description');
      const textarea = document.createElement('textarea');
      textarea.className = 'back-description-input';
      textarea.value = desc.textContent;
      desc.replaceWith(textarea);

      // Validate edit fields
      function validateEditFields() {
        let valid = true;
        if (!input.value.trim()) {
          input.style.border = '2px dashed var(--delete-red)';
          valid = false;
        } else {
          input.style.border = '';
        }
        if (!textarea.value.trim()) {
          textarea.style.border = '2px dashed var(--delete-red)';
          valid = false;
        } else {
          textarea.style.border = '';
        }
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
      editButton.innerHTML = "&#9998;"; // ✎

      // Re-enable radio inputs and remove disabled style
      document.querySelectorAll('#mode-form .horizontal').forEach(span => {
        const input = span.querySelector('input');
        input.disabled = false;
        span.classList.remove('disabled');
      });

      // Re-enable all buttons
      document.querySelectorAll('button').forEach(btn => btn.disabled = false);

      // Replace input with title
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
    }

    // Toggle visibility of cancel/play buttons
    if (cancelBtn && playBtn) {
      cancelBtn.style.display = isEditing ? 'none' : 'flex';
      playBtn.style.display = isEditing ? 'none' : 'flex';
    }
  });
}


