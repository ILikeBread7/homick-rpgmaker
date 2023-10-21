const GLOBAL_SPEED_FACTOR = 0.1;
const GLOBAL_ACCELERATION_FACTOR = 0.001;
const JUMP_HEIGHT_FACTOR = 0.1;
const JUMP_PARABOLA_FLETTENING_FACTOR = 0.0625;
const JUMPING_SPEED_FACTOR = 0.75;
const OBSTACLE_HIT_TIMEOUT = 500;
const BOOST_TIME = 500;
const BOOST_DECELERATION_TIME = 250;
const BOOST_SPEED_FACTOR = 0.5;
const BOOST_ACCELERATION_FACTOR = 5;

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
    this._currentObstacleIndex = 0;
    this._obstacleHitTimeout = 0;
    this._boostTimeout = 0;
    this._previousJumpHeight = 0;
    this._hit = false;
  }

  /**
   * @description Moves the Homick forward and updates the fallen hurdles
   * @param {number} time 
   * @param {boolean} jump
   * @param {[{ type: Obstacles.Obstacle, distance: number }]} obstacles
   * @param {boolean[]} fallenHurdles
   * @param {number} position 
   */
  travel(time, jump, obstacles, fallenHurdles, position) {
    if (time <= this._obstacleHitTimeout) {
      this._obstacleHitTimeout -= time;
      return;
    }

    time -= this._obstacleHitTimeout;
    this._obstacleHitTimeout = 0;
    this._boostTimeout = Math.max(this._boostTimeout - time, 0);
    const justLanded = this._handleJumping(time, jump);
    this._handleMoving(time, obstacles, fallenHurdles, justLanded, position);
    this._lastJumpState = jump;
  }

  /**
   * 
   * @param {number} distanceToFinish 
   */
  isFinished(distanceToFinish) {
    return (distanceToFinish === 0 && this._hit) || (distanceToFinish && this._distance >= distanceToFinish);
  }

  finish() {
    this._speedOnGround = 0;
    this._setAsLanded();
  }

  /**
   * 
   * @param {number} speed speed to be added
   */
     increaseMaxSpeed(speed) {
      this._maxSpeed += speed;
    }

  /**
   * 
   * @param {number} time 
   * @param {boolean} jump 
   * @returns {boolean} True if just landed
   */
  _handleJumping(time, jump) {
    if (!jump && !this.isOnGround) {
      this._stoppedJumping = true;
    }

    const minJumpDistance = TRACK_TILE_HEIGHT / 2;
    const maxJumpDistance = this._speedOnGround * minJumpDistance;

    this._handleDoubleJump(jump);

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
      this._height = this._previousJumpHeight + (-JUMP_HEIGHT_FACTOR * this._jumpTime * (this._jumpTime - this._jumpDistance)) / (this._jumpDistance * JUMP_PARABOLA_FLETTENING_FACTOR);
      if (this.isOnGround) {
        this._setAsLanded();
        return true;
      }
    }

    return false;
  }

  /**
   * 
   * @param {boolean} jump 
   */
  _handleDoubleJump(jump) {
    if (jump && this._stoppedJumping && this._previousJumpHeight === 0 && !this._lastJumpState) {
      this._previousJumpHeight = Math.max(this._height, 0);
      this._jumpDistance = 0;
      this._jumpTime = 0;
      this._stoppedJumping = false;
    }
  }

  /**
   * 
   * @param {number} time 
   * @param {[{ type: Obstacles.Obstacle, distance: number }]} obstacles
   * @param {boolean[]} fallenHurdles
   * @param {boolean} justLanded
   * @param {number} position 
   */
  _handleMoving(time, obstacles, fallenHurdles, justLanded, position) {
    if (this.isOnGround) {
      this._accelerate(time, position);
    }
    this._distance += time * this.effectiveSpeed;

    this._currentObstacleIndex = Utils.findIndexStartingAt(obstacles, this._currentObstacleIndex, o => o.distance > this._distance || o.type.collides(o.distance, this._distance, 0));
    if (this._currentObstacleIndex !== -1) {
      const currentObstacle = obstacles[this._currentObstacleIndex];
      if (
        !fallenHurdles[this._currentObstacleIndex] &&
        (justLanded || !currentObstacle.type.boost) &&
        currentObstacle.type.collides(currentObstacle.distance, this._distance, this._height)
      ) {
        if (currentObstacle.type.fallable) {
          if (currentObstacle.type.boost) {
            this._boostTimeout = BOOST_TIME + BOOST_DECELERATION_TIME;
          } else {
            this._hit = true;
            this._obstacleHitTimeout = OBSTACLE_HIT_TIMEOUT;
            this._speedOnGround = 0;
            this._boostTimeout = 0;
            this._setAsLanded();
          }
          fallenHurdles[this._currentObstacleIndex] = true;
        } else {
          this._speedOnGround = 1;
        }
      }
    }
  }

  _setAsLanded() {
    this._height = 0;
    this._previousJumpHeight = 0;
    this._jumpTime = 0;
    this._jumpDistance = 0;
    this._stoppedJumping = false;
  }

  /**
   * 
   * @param {number} time 
   * @param {number} position 
   */
  _accelerate(time, position) {
    this._speedOnGround += time * this._effectiveAcceleration(position) * GLOBAL_ACCELERATION_FACTOR * (this._boosting ? BOOST_ACCELERATION_FACTOR : 1);
    this._speedOnGround = Math.min(this._speedOnGround, this._effectiveMaxSpeed(position));
  }

  /**
   * 
   * @param {number} position 
   */
   _effectiveMaxSpeed(position) {
    return this._maxSpeed * (1 + 0.1 * (position - 1));
  }

  /**
   * 
   * @param {number} position 
   */
     _effectiveAcceleration(position) {
      return this._acceleration * (1 + 0.1 * (position - 1));
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
    return this._speedOnGround * (this.isOnGround ? 1 : JUMPING_SPEED_FACTOR) * (BOOST_SPEED_FACTOR * Math.min(this._boostTimeout / BOOST_DECELERATION_TIME, 1) + 1);
  }

  get effectiveSpeed() {
    return this.speed * GLOBAL_SPEED_FACTOR;
  }

  get effectiveSpeedOnGround() {
    return this._speedOnGround * GLOBAL_SPEED_FACTOR;
  }

  get currentObstacleIndex() {
    return this._currentObstacleIndex;
  }

  get maxSpeed() {
    return this._maxSpeed;
  }

  get _boosting() {
    return this._boostTimeout - BOOST_DECELERATION_TIME > 0;
  }

}