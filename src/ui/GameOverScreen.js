export class GameOverScreen {
  constructor(parentContainer, onRestartCallback) {
    this.parentContainer = parentContainer;
    this.onRestartCallback = onRestartCallback;

    // Elements we will update dynamically
    this.scoreValEl = null;
    this.highScoreValEl = null;

    this.element = this.createDOM();
    this.parentContainer.appendChild(this.element);
  }

  createDOM() {
    const screen = document.createElement('div');
    screen.className = 'ui-screen';

    const card = document.createElement('div');
    card.className = 'glass-card';

    // Game Over Title
    const title = document.createElement('h2');
    title.textContent = 'Game Over';

    // Subtitle / message
    const message = document.createElement('p');
    message.className = 'subtitle';
    message.textContent = 'Karaktermu menabrak rintangan kota!';

    // Current Score Box
    const scoreBox = document.createElement('div');
    scoreBox.className = 'score-summary';
    scoreBox.textContent = 'Skor Akhir: ';
    this.scoreValEl = document.createElement('span');
    this.scoreValEl.textContent = '0';
    scoreBox.appendChild(this.scoreValEl);

    // High Score Box
    const highScoreBox = document.createElement('div');
    highScoreBox.className = 'score-summary';
    highScoreBox.textContent = 'Skor Tertinggi: ';
    this.highScoreValEl = document.createElement('span');
    this.highScoreValEl.textContent = '0';
    highScoreBox.appendChild(this.highScoreValEl);

    // Play Again Button
    const restartBtn = document.createElement('button');
    restartBtn.className = 'btn';
    restartBtn.textContent = 'Main Lagi';
    restartBtn.addEventListener('click', () => {
      if (this.onRestartCallback) this.onRestartCallback();
    });

    // Assemble components
    card.appendChild(title);
    card.appendChild(message);
    card.appendChild(scoreBox);
    card.appendChild(highScoreBox);
    card.appendChild(restartBtn);

    screen.appendChild(card);
    return screen;
  }

  show(finalScore, highScore) {
    if (this.scoreValEl) this.scoreValEl.textContent = finalScore.toString();
    if (this.highScoreValEl) this.highScoreValEl.textContent = highScore.toString();
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
