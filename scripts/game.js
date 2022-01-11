const TRACK_TILE_WIDTH = 64;
const TRACK_TILE_HEIGHT = 64;
const TRACK_HEIGHT = 8;
const JUMPING_SPEED_FACTOR = 0.75;
const PADDING = 8;
const TOP_Y = 100;
const JUMP_HEIGHT_FACTOR = 0.1;
const JUMP_PARABOLA_FLETTENING_FACTOR = 0.0625;
const GLOBAL_SPEED_FACTOR = 0.1;

class Game {

  static Homick = class {
    /**
     * 
     * @param {boolean} isPlayer 
     */
    constructor(isPlayer) {
      this._distance = 0;
      this._height = 0;
      this._speedOnGround = isPlayer ? 5 : 3;
      this._jumpTime = 0;
      this._jumpDistance = 0;
      this._stoppedJumping = false;
      this._lastJumpState = false;
    }

    /**
     * 
     * @param {number} time 
     * @param {boolean} jump
     */
    travel(time, jump) {
      this._distance += time * this.effectiveSpeed;

      if (!jump && !this.isOnGround) {
        this._stoppedJumping = true;
      }

      const minJumpDistance = TRACK_TILE_HEIGHT / 2;
      const maxJumpDistance = this._speedOnGround * minJumpDistance;
      if (jump &&
          (!this._lastJumpState || this._jumpDistance > 0) &&
          !this._stoppedJumping &&
          this._jumpDistance < maxJumpDistance
      ) {
        this._jumpDistance += time;
        this._jumpDistance = Math.max(this._jumpDistance, minJumpDistance);
        this._jumpDistance = Math.min(this._jumpDistance, maxJumpDistance);
      }

      if (this._jumpDistance > 0) {
        this._jumpTime += time * this.effectiveSpeed;
        this._height = (-JUMP_HEIGHT_FACTOR * this._jumpTime * (this._jumpTime - this._jumpDistance)) / (this._jumpDistance * JUMP_PARABOLA_FLETTENING_FACTOR);
      }

      if (this.isOnGround) {
        this._height = 0;
        this._jumpTime = 0;
        this._jumpDistance = 0;
        this._stoppedJumping = false;
      }

      this._lastJumpState = jump;
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

    get speed() {
      return this._speedOnGround * (this.isOnGround ? 1 : JUMPING_SPEED_FACTOR);
    }

    get effectiveSpeed() {
      return this.speed * GLOBAL_SPEED_FACTOR;
    }

    get effectiveSpeedOnGround() {
      return this._speedOnGround * GLOBAL_SPEED_FACTOR;
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
    this._homicks.forEach((homick, index) => homick.travel(deltaTime, index === 0 ? Events.pressed : (index % 2 === 0 && Math.abs(50 - homick.distance % 100) > 5)));
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
    const offset = (Math.floor((totalTime % 500) / 250) * 2 - 1) * PADDING / 2;
    this._homicks.forEach((homick, index) => this._drawHomick(homick, index, offset));
  }

  /**
   * 
   * @param {Game.Homick} homick 
   * @param {number} index 
   * @param {number} offset 
   */
  _drawHomick(homick, index, offset) {
    this._drawTrack(homick.distance, index);
    this._drawShadow(homick, index);
    this._ctx.fillStyle = '#8b4513';
    this._ctx.fillRect(this._tracksX + PADDING + offset + index * TRACK_TILE_WIDTH, this._tracksY + PADDING + TOP_Y - homick.height, TRACK_TILE_WIDTH - 2 * PADDING, TRACK_TILE_HEIGHT - 2 * PADDING);
  }

  /**
   * 
   * @param {Game.Homick} homick 
   * @param {number} index 
   */
  _drawShadow(homick, index) {
    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this._ctx.beginPath();
    const maxHeightFactor = 128;
    const heightFactor = (maxHeightFactor - Math.min(homick.height, maxHeightFactor)) / maxHeightFactor;
    this._ctx.ellipse(
      this._tracksX + index * TRACK_TILE_WIDTH + TRACK_TILE_WIDTH / 2,
      this._tracksY + TOP_Y + TRACK_TILE_HEIGHT - PADDING,
      (TRACK_TILE_WIDTH - PADDING) / 2 * heightFactor,
      (TRACK_TILE_WIDTH - PADDING) / 4 * heightFactor,
      0, 0, 2 * Math.PI);
    this._ctx.fill();
  }

  /**
   * @param {number} distance
   * @param {number} homickIndex 
   */
  _drawTrack(distance, homickIndex) {
    const colors = ['#7f7f10', '#4f4f10'];
    const offset = TRACK_TILE_HEIGHT - (distance % TRACK_TILE_HEIGHT);
    const startingColorIndex = Math.floor((distance % (TRACK_TILE_HEIGHT * 2)) / TRACK_TILE_HEIGHT);
  
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