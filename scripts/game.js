class Game {

  static Homick = class {
    /**
     * 
     * @param {boolean} isPlayer 
     */
    constructor(isPlayer) {
      this._distance = 0;
      this._height = 0;
      this._speed = isPlayer ? 3000 : 2000;
      this._velocity = 0;
    }

    /**
     * 
     * @param {number} time 
     * @param {boolean} jump
     */
    travel(time, jump) {
      this._distance += time * this._speed;

      if (jump && this.isOnGround) {
        this._velocity = this._speed / 8;
      }
      if (this._velocity || !this.isOnGround) {
        this._height += time * this._velocity;
        this._velocity -= time * GRAVITY;
      }
      if (this.isOnGround) {
        this._height = 0;
        this._velocity = 0;
      }
    }

    get distance() {
      return this._distance;
    }

    get height() {
      return this._height;
    }

    get isOnGround() {
      return this._height <= 0;
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
    this._homicks.forEach(homick => homick.travel(deltaTime / 1000, true));
  }

  /**
   * @param {number} totalTime 
   */
  draw(totalTime) {
    this._drawBackground();
    this._drawHomicks(totalTime);
  }

  /**
   * @param {number} totalTime 
   */
  _drawHomicks(totalTime) {
    const PADDING = 8;
    const TOP_Y = 100;
    const offset = (Math.floor((totalTime % 500) / 250) * 2 - 1) * PADDING / 2;
    this._homicks.forEach((homick, index) => {
      this._drawTrack(homick.distance, index);
      this._ctx.fillStyle = '#8b4513';
      this._ctx.fillRect(this._tracksX + PADDING + offset + index * TRACK_TILE_WIDTH, this._tracksY + PADDING + TOP_Y - homick.height, TRACK_TILE_WIDTH - 2 * PADDING, TRACK_TILE_HEIGHT - 2 * PADDING);
    });
  }

  /**
   * @param {number} distance
   * @param {number} homickIndex 
   */
  _drawTrack(distance, homickIndex) {
    const colors = ['#7f7f10', '#4f4f10'];
    const offset = TRACK_TILE_HEIGHT - ((distance % 1000) / 1000 * TRACK_TILE_HEIGHT);
    const startingColorIndex = Math.floor((distance % 2000) / 1000);
  
    const firstColor = colors[(startingColorIndex + 1) % colors.length];
    this._ctx.fillStyle = firstColor;
    this._ctx.fillRect(this._tracksX + TRACK_TILE_WIDTH * homickIndex, this._tracksY, TRACK_TILE_WIDTH, offset);
    for (let i = 0; i < TRACK_HEIGHT - 1; i++) {
      const color = colors[(startingColorIndex + i) % colors.length];
      this._ctx.fillStyle = color;
      this._ctx.fillRect(this._tracksX + TRACK_TILE_WIDTH * homickIndex, this._tracksY + offset + i * TRACK_TILE_HEIGHT, TRACK_TILE_WIDTH, TRACK_TILE_HEIGHT);
    }
    const lastColor = colors[(startingColorIndex + 1) % colors.length];
    this._ctx.fillStyle = lastColor;
    this._ctx.fillRect(this._tracksX + TRACK_TILE_WIDTH * homickIndex, this._tracksY + offset + (TRACK_HEIGHT - 1) * TRACK_TILE_HEIGHT, TRACK_TILE_WIDTH, TRACK_TILE_HEIGHT - offset);
  }

  _drawBackground() {
    this._ctx.fillStyle = '#78fbcf';
    this._ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

}