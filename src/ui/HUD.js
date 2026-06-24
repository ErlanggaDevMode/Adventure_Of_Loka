export class HUD {
  constructor(parentContainer, scoreSystem) {
    this.parentContainer = parentContainer;
    this.scoreSystem = scoreSystem;

    // Element references
    this.scoreValEl = null;

    this.element = this.createDOM();
    this.parentContainer.appendChild(this.element);
  }

  createDOM() {
    const hud = document.createElement('div');
    hud.className = 'hud-overlay';

    // Top Section (Score)
    const topSec = document.createElement('div');
    topSec.className = 'hud-top';

    const scoreContainer = document.createElement('div');
    scoreContainer.className = 'score-container';

    const scoreLabel = document.createElement('div');
    scoreLabel.className = 'score-label';
    scoreLabel.textContent = 'Score';

    this.scoreValEl = document.createElement('div');
    this.scoreValEl.className = 'score-value';
    this.scoreValEl.textContent = '00000';

    scoreContainer.appendChild(scoreLabel);
    scoreContainer.appendChild(this.scoreValEl);
    topSec.appendChild(scoreContainer);

    // Bottom Section (Reminders)
    const bottomSec = document.createElement('div');
    bottomSec.className = 'hud-bottom';

    const reminders = document.createElement('div');
    reminders.className = 'reminders';

    const reminderJump = this.createReminderItem('SPACE', 'Jump');
    const reminderSlide = this.createReminderItem('↓', 'Slide');
    const reminderAttack = this.createReminderItem('Z', 'Attack');

    reminders.appendChild(reminderJump);
    reminders.appendChild(reminderSlide);
    reminders.appendChild(reminderAttack);
    bottomSec.appendChild(reminders);

    // Assemble HUD
    hud.appendChild(topSec);
    hud.appendChild(bottomSec);
    return hud;
  }

  createReminderItem(keyText, actionText) {
    const item = document.createElement('div');
    item.className = 'reminder-item';

    const key = document.createElement('span');
    key.className = 'reminder-key';
    key.textContent = keyText;

    const action = document.createElement('span');
    action.textContent = ` ${actionText}`;

    item.appendChild(key);
    item.appendChild(action);
    return item;
  }

  show() {
    this.element.classList.add('active');
  }

  hide() {
    this.element.classList.remove('active');
  }

  update() {
    if (!this.scoreValEl) return;
    const score = this.scoreSystem.getScore();
    // Zero-padding format (e.g. 00124)
    this.scoreValEl.textContent = score.toString().padStart(5, '0');
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
