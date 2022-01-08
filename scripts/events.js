class Events {

  static _pressed = false;

  static get pressed() {
    return this._pressed;
  }

  /**
   * @param {string[]} eventTypes
   */
  static registerPressedTrue(...eventTypes) {
    eventTypes.forEach(type => {
      document.addEventListener(type, () => {
        this._pressed = true;
      });
    });
  }

  /**
   * @param {string[]} eventTypes
   */
  static registerPressedFalse(...eventTypes) {
    eventTypes.forEach(type => {
      document.addEventListener(type, () => {
        this._pressed = false;
      });
    });
  }
};

Events.registerPressedTrue('mousedown', 'keydown');
Events.registerPressedFalse('mouseup', 'keyup');