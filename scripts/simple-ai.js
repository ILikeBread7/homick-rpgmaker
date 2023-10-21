class SimpleAi {

  /**
   * 
   * @param {Homick} homick 
   * @param { { distance: number, type: Obstacles.Obstacle} } obstacles 
   * @param {number} preJumpDistance
   * @param {number} varianceRange
   */
  constructor(homick, obstacles, preJumpDistance, varianceRange) {
    this._homick = homick;
    this._obstacles = obstacles;
    this._currentObstacleIndex = -1;
    this._currentObstacleVariance = 0;
    this._preJumpDistance = preJumpDistance;
    this._varianceRange = varianceRange;
  }

  jump() {
    if (this._homick.currentObstacleIndex != this._currentObstacleIndex) {
      this._currentObstacleIndex = this._homick.currentObstacleIndex;
      this._currentObstacleVariance = 2 * Math.random() * this._varianceRange - this._varianceRange;
      return false;
    }

    if (this._homick.currentObstacleIndex < 0) {
      return false;
    }

    const currentObstacle = this._obstacles[this._currentObstacleIndex];

    if (currentObstacle.type.boost) {
      return false;
    }

    if (this._homick.distance >= currentObstacle.distance - Math.sqrt(this._homick.speed) * (this._preJumpDistance + this._currentObstacleVariance)) {
      return true;
    }

    return false;
  }

}