class Game {

  /**
   * 
   * @param {HTMLCanvasElement} canvas 
   * @param {CanvasRenderingContext2D} ctx 
   */
  constructor(canvas, ctx) {
    this._canvas = canvas;
    this._ctx = ctx;
    this._tracksX = (canvas.width - (TRACK_TILE_WIDTH * TRACKS_NUMBER)) / 2;
    this._tracksY = (canvas.height - (TRACK_TILE_HEIGHT * TRACK_HEIGHT)) / 2;
  }

  /**
   * @param {number} interval 
   */
  draw(interval) {
    this._drawBackground();
    this._drawTracks(interval);
    this._drawHomicks(interval);
  }

  /**
   * @param {number} interval 
   */
  _drawHomicks(interval) {
    const PADDING = 8;
    const offset = (Math.floor((interval % 500) / 250) * 2 - 1) * PADDING / 2;
    this._ctx.fillStyle = '#8b4513';
    for (let i = 0; i < 4; i++) {
      this._ctx.fillRect(this._tracksX + PADDING + offset + i * TRACK_TILE_WIDTH, this._tracksY + PADDING, TRACK_TILE_WIDTH - 2 * PADDING, TRACK_TILE_HEIGHT - 2 * PADDING);
    }
  }
  
  /**
   * @param {number} interval 
   */
  _drawTracks(interval) {
    const colors = ['#7f7f10', '#4f4f10'];
    const offset = TRACK_TILE_HEIGHT - ((interval % 1000) / 1000 * TRACK_TILE_HEIGHT);
    const startingColorIndex = Math.floor((interval % 2000) / 1000);
  
    const firstColor = colors[(startingColorIndex + 1) % colors.length];
    this._ctx.fillStyle = firstColor;
    this._ctx.fillRect(this._tracksX, this._tracksY, TRACK_TILE_WIDTH * TRACKS_NUMBER, offset);
    for (let i = 0; i < TRACK_HEIGHT - 1; i++) {
      const color = colors[(startingColorIndex + i) % colors.length];
      this._ctx.fillStyle = color;
      this._ctx.fillRect(this._tracksX, this._tracksY + offset + i * TRACK_TILE_HEIGHT, TRACK_TILE_WIDTH * TRACKS_NUMBER, TRACK_TILE_HEIGHT);
    }
    const lastColor = colors[(startingColorIndex + 1) % colors.length];
    this._ctx.fillStyle = lastColor;
    this._ctx.fillRect(this._tracksX, this._tracksY + offset + (TRACK_HEIGHT - 1) * TRACK_TILE_HEIGHT, TRACK_TILE_WIDTH * TRACKS_NUMBER, TRACK_TILE_HEIGHT - offset);
  }

  _drawBackground() {
    this._ctx.fillStyle = '#78fbcf';
    this._ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

}