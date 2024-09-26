class SimpleAi {

  /**
   * 
   * @param {Homick} homick 
   * @param { { distance: number, type: Obstacles.Obstacle} } obstacles 
   * @param {number} preJumpDistance
   * @param {number} varianceRange
   * @param {number} boostPreJumpDistance
   * @param {number} boostVarianceRange
   */
  constructor(homick, obstacles, preJumpDistance, varianceRange, boostPreJumpDistance, boostVarianceRange) {
    this._homick = homick;
    this._obstacles = obstacles;
    this._currentObstacleIndex = -1;
    this._currentObstacleVariance = 0;
    this._preJumpDistance = preJumpDistance;
    this._varianceRange = varianceRange;
    this._boostPreJumpDistance = boostPreJumpDistance;
    this._boostVarianceRange = boostVarianceRange;
    this._boostCurrentObstacleVariance = 0;
  }

  jump() {
    if (this._homick.currentObstacleIndex != this._currentObstacleIndex) {
      this._currentObstacleIndex = this._homick.currentObstacleIndex;
      const rand = Math.random();
      this._currentObstacleVariance = 2 * rand * this._varianceRange - this._varianceRange;
      this._boostCurrentObstacleVariance = 2 * rand * this._boostVarianceRange - this._boostVarianceRange;
      return false;
    }

    if (this._homick.currentObstacleIndex < 0) {
      return false;
    }

    const currentObstacle = this._obstacles[this._currentObstacleIndex];

    if (currentObstacle.type.boost) {
      const distanceToObstacle = currentObstacle.distance - this._homick.distance;
      const distanceBeforeJump = Math.sqrt(this._homick.speed) * (this._boostPreJumpDistance + this._boostCurrentObstacleVariance);
      return (
        this._boostPreJumpDistance &&
        (distanceToObstacle <= distanceBeforeJump) &&
        (distanceToObstacle > distanceBeforeJump / 2)
      );
    }

    if (this._homick.distance >= currentObstacle.distance - Math.sqrt(this._homick.speed) * (this._preJumpDistance + this._currentObstacleVariance)) {
      return true;
    }

    return false;
  }

  get isHuman() {
    return false;
  }

}