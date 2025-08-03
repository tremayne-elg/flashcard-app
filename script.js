// Get main elements
const mode_form = document.getElementById('mode-form')
const banner_body = document.getElementById('banner-body')
const stack_space = document.getElementById('stack-space')
let cardCount = 0

// Listen for mode change (add / delete / default)
mode_form.addEventListener('change', () => {
  const selected = mode_form.querySelector('input[name="mode"]:checked')
  const selectedStack = document.querySelector('.card-stack.selected')

  // If a card is already selected, clean up its state
  if (selectedStack) {
    const existing = selectedStack.querySelector('#decide-container')
    if (existing) existing.remove()

    const nextBtn = selectedStack.querySelector('.next-button')
    if (nextBtn) nextBtn.remove()

    const container = document.createElement('div')
    container.id = 'decide-container'

    // If in delete mode, show only cancel
    if (selected?.id === 'delete') {
      container.innerHTML = `<button type="button" id="cancel-button">&#x2716;</button>`
    } 
    // In add/play mode, show full controls
    else {
      container.innerHTML = `
        <button type="button" id="edit-button">&#9998;</button>
        <button type="button" id="play-button">&#x25B6;</button>
        <button type="button" id="cancel-button">&#x2716;</button>
      `
    }

    selectedStack.appendChild(container)

    // Cancel button logic — deselect and clean
    container.querySelector('#cancel-button').onclick = () => {
      const parent = selectedStack.closest('.parent-stack')
      const nextBtn = selectedStack.querySelector('.next-button')
      if (nextBtn) nextBtn.style.display = 'none'
      selectedStack.classList.remove('selected')
      parent.classList.remove('show-back')
      container.remove()
    }
  }

  // Render form for "add" mode
  if (selected?.id === 'add') {
    banner_body.innerHTML = `
      <form id="add-form">
        <span class="horizontal2">
          <label for="card-title">TITLE</label>
          <input type="text" id="card-title" name="card-title" placeholder="Name...">
        </span>
        <span class="vertical">
          <label for="description-text">DESCRIPTION</label>
          <textarea id="description-text" name="description" placeholder="Description..."></textarea>
        </span>
        <button type="button" id="add-button">ADD</button>
      </form>
    `
    const add_button = document.getElementById('add-button')
    const card_title = document.getElementById('card-title')
    const description_text = document.getElementById('description-text')
    addStack(add_button, card_title, description_text, selected)
  } 
  // Render UI for delete mode
  else if (selected?.id === 'delete') {
    banner_body.innerHTML = `
      <span id="delete-container">
        <p id="select-p">Select the stack you want to delete.</p>
        <button type="button" id="delete-button">DELETE</button>
      </span>
    `
    deleteFuntionality()
  } 
  // Default: just show message
  else {
    banner_body.innerHTML = `
      <span id="delete-container">
        <p id="select-p">Select the stack you want to interact with.</p>
      </span>
    `
  }
})

// Create a new flashcard stack
function addStack(add_btn, card_ttle, description_txt, selected) {
  add_btn.addEventListener('click', () => {
    const cardValue = card_ttle.value
    const descValue = description_txt.value

    card_ttle.style.outline = 'none'
    description_txt.style.outline = 'none'

    // Validate input fields
    let valid = true
    if (!cardValue) {
      card_ttle.style.outline = '2px solid var(--delete-red)'
      valid = false
    }
    if (!descValue) {
      description_txt.style.outline = '2px solid var(--delete-red)'
      valid = false
    }
    if (!valid) return

    cardCount++

    // Create parent container
    const parent = document.createElement('div')
    parent.className = 'parent-stack'

    // Create front of card
    const card = document.createElement('div')
    card.className = 'card-stack'
    card.dataset.description = descValue
    card.innerHTML = `
      <h1 id="c${cardCount}" class="stack-name">${cardValue.toUpperCase()}</h1>
      <button type="button" class="next-button" style="display:none;">&#x27F3;</button>
    `

    // Create back of card
    const back = document.createElement('div')
    back.className = 'card-stack-back'
    back.innerHTML = `
      <div class="description-body">
        <p class="back-description">${descValue}</p>
      </div>
    `

    parent.appendChild(card)
    parent.appendChild(back)
    stack_space.appendChild(parent)

    // Reset form and mode
    card_ttle.value = ''
    description_txt.value = ''
    selected.checked = false

    // Trigger mode form change to reset UI
    const event = new Event('change', { bubbles: true })
    mode_form.dispatchEvent(event)
  })
}

// Handle card selection
stack_space.addEventListener('click', (e) => {
  const stack = e.target.closest('.card-stack')
  if (!stack) return

  // Deselect all cards first
  document.querySelectorAll('.card-stack').forEach(el => {
    el.classList.remove('selected')
    const existing = el.querySelector('#decide-container')
    if (existing) existing.remove()
    const nextBtn = el.querySelector('.next-button')
    if (nextBtn) nextBtn.style.display = 'none'
    el.closest('.parent-stack').classList.remove('show-back')
  })

  stack.classList.add('selected')

  const selectedMode = document.querySelector('input[name="mode"]:checked')
  const mode = selectedMode ? selectedMode.id : null

  const container = document.createElement('div')
  container.id = 'decide-container'

  // Add correct buttons based on mode
  if (mode === 'delete') {
    container.innerHTML = `<button type="button" id="cancel-button">&#x2716;</button>`
  } else {
    container.innerHTML = `
      <button type="button" id="edit-button">&#9998;</button>
      <button type="button" id="play-button">&#x25B6;</button>
      <button type="button" id="cancel-button">&#x2716;</button>
    `
    const nextBtn = stack.querySelector('.next-button')
    if (nextBtn) nextBtn.style.display = 'flex'
  }

  stack.appendChild(container)

  // Cancel logic
  container.querySelector('#cancel-button').onclick = () => {
    const parent = stack.closest('.parent-stack')
    const nextBtn = stack.querySelector('.next-button')
    if (nextBtn) nextBtn.style.display = 'none'
    stack.classList.remove('selected')
    parent.classList.remove('show-back')
    container.remove()
  }
})

// Delete selected card
function deleteFuntionality() {
  const delete_button = document.getElementById('delete-button')
  delete_button.addEventListener('click', () => {
    const stack_list = document.querySelectorAll('.card-stack')
    for (const stack of stack_list) {
      if (stack.classList.contains('selected')) {
        stack.closest('.parent-stack').remove()
        cardCount--
      }
    }
  })
}

// Flip to back or front of card
document.addEventListener('click', (e) => {
  // Flip to back when next button clicked
  if (e.target.classList.contains('next-button')) {
    const parent = e.target.closest('.parent-stack')
    parent.classList.add('show-back')
  }

  // Flip back to front when back is clicked
  if (e.target.closest('.card-stack-back')) {
    const parent = e.target.closest('.parent-stack')
    parent.classList.remove('show-back')
  }
})
