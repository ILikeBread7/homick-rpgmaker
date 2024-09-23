class Events {

  // static _pressed = false;

  static get pressed() {
    return this._pressed;
  }

  /**
   * @param {...string} eventTypes
   */
  static registerPressedTrue(...eventTypes) {
    eventTypes.forEach(type => {
      document.addEventListener(type, () => {
        this._pressed = true;
      });
    });
  }

  /**
   * @param {...string} eventTypes
   */
  static registerPressedFalse(...eventTypes) {
    eventTypes.forEach(type => {
      document.addEventListener(type, () => {
        this._pressed = false;
      });
    });
  }

  /**
   * @param {...string} eventTypes
   */
  static registerResize(...eventTypes) {
    eventTypes.forEach(type => {
      window.addEventListener(type, () => this._resize());
    });
  }

  static _resize() {
    const container = document.getElementById('container');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    const uiDiv = document.getElementById('ui_div');
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const dimensions = this._calculateMaxDimensions(viewportWidth, viewportHeight);
    const top = Math.floor((viewportHeight - dimensions.height) / 2);
    const left = Math.floor((viewportWidth - dimensions.width) / 2);
    container.style.top = `${top}px`;
    container.style.left = `${left}px`;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    ctx.scale(dimensions.factor, dimensions.factor);
    uiDiv.width = dimensions.width;
    uiDiv.height = dimensions.height;
    uiDiv.style.top = `${top - BASE_HEIGHT}px`;
  }

  /**
   * 
   * @param {number} viewportWidth 
   * @param {number} viewportHeight 
   * @returns { { width: number, height: number, factor: number } }
   */
  static _calculateMaxDimensions(viewportWidth, viewportHeight) {
    const dimensionsByWidth = this._calculateMaxDimensionsByWidth(viewportWidth);
    const dimensionsByHeight = this._calculateMaxDimensionsByHeight(viewportHeight);
    return dimensionsByWidth.factor < dimensionsByHeight.factor ? dimensionsByWidth : dimensionsByHeight;
  }

  /**
   * 
   * @param {number} viewportWidth 
   * @returns { { width: number, height: number, factor: number } }
   */
  static _calculateMaxDimensionsByWidth(viewportWidth) {
    const factor = viewportWidth / BASE_WIDTH;
    return { width: viewportWidth,  height: BASE_HEIGHT * factor, factor };
  }

  /**
   * 
   * @param {number} viewportHeight 
   * @returns { { width: number, height: number, factor: number } }
   */
  static _calculateMaxDimensionsByHeight(viewportHeight) {
    const factor = viewportHeight / BASE_HEIGHT;
    return { width: BASE_WIDTH * factor,  height: viewportHeight, factor };
  }
};

Events._pressed = false;

Events.registerPressedTrue('mousedown', 'keydown');
Events.registerPressedFalse('mouseup', 'keyup');