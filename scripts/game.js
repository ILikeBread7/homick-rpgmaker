class Game {

  static Homick = class {
    /**
     * 
     * @param {boolean} isPlayer 
     */
    constructor(isPlayer) {
      this._distance = 0;
      this._speed = 10;
    }

    /**
     * 
     * @param {number} distance 
     */
    travel(distance) {
      this._distance += distance * this._speed;
    }
  }

  /**
   * 
   * @param {HTMLCanvasElement} canvas 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} tracksNumber
   */
  constructor(canvas, ctx, tracksNumber) {
    this._canvas = canvas;
    this._ctx = ctx;
    this._tracksNumber = tracksNumber;
    this._tracksX = (canvas.width - (TRACK_TILE_WIDTH * this._tracksNumber)) / 2;
    this._tracksY = (canvas.height - (TRACK_TILE_HEIGHT * TRACK_HEIGHT)) / 2;
    this._homicks = [new Game.Homick(true)];
    for (let i = 1; i < tracksNumber; i++) {
      this._homicks.push(new Game.Homick(false));
    }
  }

  /**
   * 
   * @param {number} deltaTime 
   */
  update(deltaTime) {
    this._homicks.forEach(homick => homick.travel(deltaTime));
  }

  /**
   * @param {number} totalTime 
   */
  draw(totalTime) {
    this._drawBackground();
    this._drawTracks(totalTime);
    this._drawHomicks(totalTime);
  }

  /**
   * @param {number} totalTime 
   */
  _drawHomicks(totalTime) {
    const PADDING = 8;
    const offset = (Math.floor((totalTime % 500) / 250) * 2 - 1) * PADDING / 2;
    this._ctx.fillStyle = '#8b4513';
    for (let i = 0; i < this._tracksNumber; i++) {
      this._ctx.fillRect(this._tracksX + PADDING + offset + i * TRACK_TILE_WIDTH, this._tracksY + PADDING, TRACK_TILE_WIDTH - 2 * PADDING, TRACK_TILE_HEIGHT - 2 * PADDING);
    }
  }
  
  /**
   * @param {number} totalTime 
   */
  _drawTracks(totalTime) {
    const colors = ['#7f7f10', '#4f4f10'];
    const offset = TRACK_TILE_HEIGHT - ((totalTime % 1000) / 1000 * TRACK_TILE_HEIGHT);
    const startingColorIndex = Math.floor((totalTime % 2000) / 1000);
  
    const firstColor = colors[(startingColorIndex + 1) % colors.length];
    this._ctx.fillStyle = firstColor;
    this._ctx.fillRect(this._tracksX, this._tracksY, TRACK_TILE_WIDTH * this._tracksNumber, offset);
    for (let i = 0; i < TRACK_HEIGHT - 1; i++) {
      const color = colors[(startingColorIndex + i) % colors.length];
      this._ctx.fillStyle = color;
      this._ctx.fillRect(this._tracksX, this._tracksY + offset + i * TRACK_TILE_HEIGHT, TRACK_TILE_WIDTH * this._tracksNumber, TRACK_TILE_HEIGHT);
    }
    const lastColor = colors[(startingColorIndex + 1) % colors.length];
    this._ctx.fillStyle = lastColor;
    this._ctx.fillRect(this._tracksX, this._tracksY + offset + (TRACK_HEIGHT - 1) * TRACK_TILE_HEIGHT, TRACK_TILE_WIDTH * this._tracksNumber, TRACK_TILE_HEIGHT - offset);
  }

  _drawBackground() {
    this._ctx.fillStyle = '#78fbcf';
    this._ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

}