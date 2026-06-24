export class StartScreen {
  constructor(parentContainer, onPlayCallback) {
    this.parentContainer = parentContainer;
    this.onPlayCallback = onPlayCallback;

    this.element = this.createDOM();
    this.parentContainer.appendChild(this.element);
  }

  createDOM() {
    // Screen container
    const screen = document.createElement('div');
    screen.className = 'ui-screen';

    // Glass Card
    const card = document.createElement('div');
    card.className = 'glass-card';

    // Title
    const title = document.createElement('h1');
    title.textContent = 'Adventure of Loka';

    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.className = 'subtitle';
    subtitle.textContent = 'Lari, serang, bertahan — kota tidak pernah berhenti.';

    // Play Button
    const playBtn = document.createElement('button');
    playBtn.className = 'btn';
    playBtn.textContent = 'Mulai Bermain';
    playBtn.addEventListener('click', () => {
      if (this.onPlayCallback) this.onPlayCallback();
    });

    // Controls Legend Info
    const controls = document.createElement('div');
    controls.className = 'controls-info';

    // Control: Jump
    const ctrlJump = this.createControlItem('Space / ↑', 'Jump');
    // Control: Slide
    const ctrlSlide = this.createControlItem('S / ↓', 'Slide');
    // Control: Attack
    const ctrlAttack = this.createControlItem('Z / J', 'Attack');

    controls.appendChild(ctrlJump);
    controls.appendChild(ctrlSlide);
    controls.appendChild(ctrlAttack);

    // Assemble card
    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(playBtn);
    card.appendChild(controls);

    screen.appendChild(card);
    return screen;
  }

  createControlItem(keyText, actionText) {
    const item = document.createElement('div');
    item.className = 'control-item';

    const keyCap = document.createElement('div');
    keyCap.className = 'key-cap';
    keyCap.textContent = keyText;

    const action = document.createElement('div');
    action.className = 'action-name';
    action.textContent = actionText;

    item.appendChild(keyCap);
    item.appendChild(action);
    return item;
  }

  show() {
    this.element.classList.add('active');
  }

  hide() {
    this.element.classList.remove('active');
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
