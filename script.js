//Toggles between add form and remove menu via click of the according radio inputs.
const mode_form = document.getElementById('mode-form');
const banner_body = document.getElementById('banner-body');

mode_form.addEventListener('change', () => {
  const selected = mode_form.querySelector('input[name="mode"]:checked');

  if (selected && selected.id === "add") {
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
    `;
    const add_button = document.getElementById('add-button');
    const card_title = document.getElementById('card-title');
    const description_text = document.getElementById('description-text');
    addStack(add_button, card_title, description_text);
  } else if (selected && selected.id === "delete") {
    banner_body.innerHTML = `
    <span id="delete-container">
        <p id="select-p">Select the stack you want to delete.</p>
        <button type="button" id="delete-button">DELETE</button>
      </span>
    `
  }
});

//When the add button (/add radio) is clicked, a card stack is added with the contents of #add.
const stack_space = document.getElementById('stack-space');
function addStack(add_btn, card_ttle, description_txt) {
  let cardCount = 0;
  add_btn.addEventListener('click', () => {
    const cardValue = card_ttle.value;
    cardCount++;
    stack_space.innerHTML += `
      <div class="card-stack">
        <h1 id="c${cardCount}" class="stack-name">${cardValue.toUpperCase()}</h1>
      </div>
    `
  })
}