export class InputHandler {
  constructor() {
    this.keys = {};
    this.triggers = {
      jump: false,
      attack: false
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown(e) {
    const key = e.key;

    // Prevent default scroll behavior for arrows and space
    if ([' ', 'ArrowUp', 'ArrowDown', 's', 'S', 'z', 'Z', 'j', 'J'].includes(key)) {
      e.preventDefault();
    }

    // Set active key state
    this.keys[key.toLowerCase()] = true;
    if (key === ' ') {
      this.keys['space'] = true;
    }

    // Single-press triggers
    if (key === ' ' || key === 'ArrowUp') {
      if (!this.triggers.jump) {
        this.triggers.jump = true;
      }
    }

    if (key.toLowerCase() === 'z' || key.toLowerCase() === 'j') {
      if (!this.triggers.attack) {
        this.triggers.attack = true;
      }
    }
  }

  handleKeyUp(e) {
    const key = e.key;
    this.keys[key.toLowerCase()] = false;
    if (key === ' ') {
      this.keys['space'] = false;
    }
  }

  isJumpPressed() {
    if (this.triggers.jump) {
      this.triggers.jump = false; // Consume the trigger
      return true;
    }
    return false;
  }

  isSlideHeld() {
    return !!(this.keys['arrowdown'] || this.keys['s']);
  }

  isAttackPressed() {
    if (this.triggers.attack) {
      this.triggers.attack = false; // Consume the trigger
      return true;
    }
    return false;
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
