const TRACK_TILE_WIDTH = 64;
const TRACK_TILE_HEIGHT = 64;
const PADDING = 8;
const HITBOX_LEEWAY = 8;
const MIN_OBSTACLE_DISTANCE = TRACK_TILE_HEIGHT * 3;
const MAX_OBSTACLE_DISTANCE = TRACK_TILE_HEIGHT * 8;
const DOUBLE_OBSTACLE_DISTANCE = TRACK_TILE_HEIGHT;
const ENDLESS_OBSTACLES_BATCH = 8;
const PUDDLE_LEVEL = 5;
const BOOST_LEVEL = 10;

class Obstacles {

  static collides(obstacleDistance, objectDistance, objectHeight) {
    return objectHeight <= this.obstacleHeight
      && objectDistance >= obstacleDistance
      && objectDistance <= obstacleDistance + this.hitboxLength;
  };

  /**
   * 
   * @param {number} level 
   * @param {number} totalDistance 
   */
  static createObstaclesForLevel(level, totalDistance) {

    if (level === 5) {
      return this._createObstacles(totalDistance, [
        { value: 1, func: this._createSingleBoost }
      ]);
    }

    const obstacleSpec = [
      { value: 7, func: this._createSingleHurdle },
      { value: 1, func: this._createDoubleHurdle }
    ];

    if (level > PUDDLE_LEVEL) {
      obstacleSpec.push(
        { value: 2, func: this._createSinglePuddle },
        { value: 1, func: this._createHurdlePuddle }
      );
    }

    if (level > BOOST_LEVEL) {
      obstacleSpec.push(
        { value: 1, func: this._createSingleBoost },
        { value: 1, func: this._createHurdleBoost }
      );
    }

    return this._createObstacles(totalDistance, obstacleSpec);
  }

  static createObstaclesForEndless(startDistance) {
    const totalDistance = startDistance + MAX_OBSTACLE_DISTANCE * ENDLESS_OBSTACLES_BATCH;
    
    const obstacleSpec = [
      { value: 5, func: this._createSingleHurdle },
      { value: 1, func: this._createDoubleHurdle }
    ];
    
    return this._createObstacles(totalDistance, obstacleSpec, startDistance);
  }

  /**
   * 
   * @param {number} totalDistance 
   * @param {[ {value: number, func: (number) => [{ type: Obstacles.Obstacle, distance: number }]} ]} obstacleSpec 
   * @param {number} [startDistance = 0]
   */
  static _createObstacles(totalDistance, obstacleSpec, startDistance = 0) {
    let total = 0;
    for (const obstacle in obstacleSpec) {
      total += obstacleSpec[obstacle].value;
    }

    const normalizedSpec = {};
    let subTotal = 0;
    for (const key in obstacleSpec) {
      const obstacle = obstacleSpec[key];
      const newSubTotal = obstacle.value / total + subTotal;
      normalizedSpec[key] = { value: newSubTotal, func: obstacle.func };
      subTotal = newSubTotal;
    }

    const obstacles = [];
    let distance = startDistance + MAX_OBSTACLE_DISTANCE - MIN_OBSTACLE_DISTANCE;
    while (distance < totalDistance - MAX_OBSTACLE_DISTANCE) {
      distance += MIN_OBSTACLE_DISTANCE + Math.floor(Math.random() * (MAX_OBSTACLE_DISTANCE - MIN_OBSTACLE_DISTANCE));

      const randomObstacle = Math.random();
      for (const key in normalizedSpec) {
        const obstacleFreq = normalizedSpec[key];
        if (randomObstacle < obstacleFreq.value) {
          obstacles.push(
            ...obstacleFreq.func(distance)
          );
          break;
        }
      }
    }

    return obstacles;
  }

  /**
   * 
   * @param {number} distance 
   * @returns {[{ type: Obstacles.Obstacle, distance: number }]}
   */
  static _createSingleHurdle(distance) {
    return [{ type: Obstacles.Obstacle.HURDLE, distance: distance }];
  }

  /**
   * 
   * @param {number} distance 
   * @returns {[{ type: Obstacles.Obstacle, distance: number }]}
   */
  static _createDoubleHurdle(distance) {
    return [
      { type: Obstacles.Obstacle.HURDLE, distance: distance },
      { type: Obstacles.Obstacle.HURDLE, distance: distance + DOUBLE_OBSTACLE_DISTANCE }
    ];
  }

  /**
   * 
   * @param {number} distance 
   * @returns {[{ type: Obstacles.Obstacle, distance: number }]}
   */
  static _createSinglePuddle(distance) {
    return [{ type: Obstacles.Obstacle.PUDDLE, distance: distance }];
  }

  /**
   * 
   * @param {number} distance 
   * @returns {[{ type: Obstacles.Obstacle, distance: number }]}
   */
  static _createHurdlePuddle(distance) {
      return [
        { type: Obstacles.Obstacle.HURDLE, distance: distance },
        { type: Obstacles.Obstacle.PUDDLE, distance: distance + DOUBLE_OBSTACLE_DISTANCE }
      ];
    }

  /**
   * 
   * @param {number} distance 
   * @returns {[{ type: Obstacles.Obstacle, distance: number }]}
   */
  static _createSingleBoost(distance) {
    return [{ type: Obstacles.Obstacle.BOOST, distance: distance }];
  }

  /**
   * 
   * @param {number} distance 
   * @returns {[{ type: Obstacles.Obstacle, distance: number }]}
   */
  static _createHurdleBoost(distance) {
    return [
      { type: Obstacles.Obstacle.HURDLE, distance: distance },
      { type: Obstacles.Obstacle.BOOST, distance: distance + DOUBLE_OBSTACLE_DISTANCE }
    ];
  }

}

Obstacles.Obstacle = Object.freeze({
  HURDLE: Object.freeze({
    spriteWidth: TRACK_TILE_WIDTH,
    hitboxLength: TRACK_TILE_HEIGHT / 4,
    obstacleHeight: 10,
    fallable: true,
    boost: false,
    hurdle: true,
    draw: function(ctx, x, y, fallen) {
      ctx.fillStyle = fallen ? '#999' : '#ddd';
      ctx.fillRect(x, y - HITBOX_LEEWAY, this.spriteWidth, this.hitboxLength + 2 * HITBOX_LEEWAY);
    },
    collides: Obstacles.collides
  }),
  PUDDLE: Object.freeze({
    spriteWidth: TRACK_TILE_HEIGHT - PADDING * 2,
    hitboxLength: TRACK_TILE_HEIGHT / 2,
    obstacleHeight: 0,
    fallable: false,
    boost: false,
    hurdle: false,
    draw: function(ctx, x, y, fallen) {
      ctx.fillStyle = '#321';
      ctx.fillRect(x + PADDING, y - HITBOX_LEEWAY, this.spriteWidth, this.hitboxLength + 2 * HITBOX_LEEWAY);
    },
    collides: Obstacles.collides
  }),
  BOOST: Object.freeze({
    spriteWidth: TRACK_TILE_HEIGHT - PADDING * 2,
    hitboxLength: TRACK_TILE_HEIGHT - PADDING * 2,
    obstacleHeight: 0,
    fallable: true,
    boost: true,
    hurdle: false,
    draw: function(ctx, x, y, fallen, totalTime) {
      ctx.fillStyle = fallen ? '#811' : '#e11';
      ctx.fillRect(x + PADDING, y, this.spriteWidth, this.hitboxLength);
      ctx.strokeStyle = '#ee1';
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const offset = i * this.spriteWidth / 3.5 + (totalTime % 500 < 250 ? 1 : -1) * 4;
        const heightFactor = 0.7;
        ctx.moveTo(x + PADDING * 2, y + PADDING + offset);
        ctx.lineTo(x + PADDING + this.spriteWidth / 2, y + (PADDING + this.hitboxLength / 2) * heightFactor + offset);
        ctx.lineTo(x + this.spriteWidth, y + PADDING + offset);
      }
      ctx.stroke();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
    },
    collides: Obstacles.collides
  })
});