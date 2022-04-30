const SIMPLE_AI_VARIANCE_RANGE = 3;
const SIMPLE_AI_DISTANCE_BEFORE_JUMP = 10;

class SimpleAi {

  /**
   * 
   * @param {Homick} homick 
   * @param { { distance: number, type: Race.Obstacle} } obstacles 
   */
  constructor(homick, obstacles) {
    this._homick = homick;
    this._obstacles = obstacles;
    this._currentObstacleIndex = -1;
    this._variance = 0;
  }

  jump() {
    if (this._homick.currentObstacleIndex != this._currentObstacleIndex) {
      this._currentObstacleIndex = this._homick.currentObstacleIndex;
      this._variance = Math.random() * 2 * SIMPLE_AI_VARIANCE_RANGE - SIMPLE_AI_VARIANCE_RANGE;
    }

    const currentObstacle = this._obstacles[this._currentObstacleIndex];
    if (currentObstacle.type.boost || this._homick.distance > currentObstacle.distance + currentObstacle.type.spriteHeight / 2) {
      return false;
    }

    if (this._homick.distance >= currentObstacle.distance - Math.sqrt(this._homick.speed) * (SIMPLE_AI_DISTANCE_BEFORE_JUMP + this._variance)) {
      return true;
    }

    return false;
  }

}