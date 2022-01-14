const GLOBAL_SPEED_FACTOR = 0.1;
const GLOBAL_ACCELERATION_FACTOR = 0.001;
const JUMP_HEIGHT_FACTOR = 0.1;
const JUMP_PARABOLA_FLETTENING_FACTOR = 0.0625;
const JUMPING_SPEED_FACTOR = 0.75;

class Homick {

  /**
   * @param {number} acceleration 
   * @param {number} maxSpeed 
   */
  constructor(acceleration, maxSpeed) {
    this._distance = 0;
    this._height = 0;
    this._acceleration = acceleration;
    this._maxSpeed = maxSpeed;
    this._speedOnGround = 1;
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
    if (this.isOnGround) {
      this._accelerate(time);
    }
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

  _accelerate(time) {
    this._speedOnGround += time * this._acceleration * GLOBAL_ACCELERATION_FACTOR;
    this._speedOnGround = Math.min(this._speedOnGround, this._maxSpeed);
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