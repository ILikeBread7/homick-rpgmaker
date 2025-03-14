const TRACK_TILE_WIDTH = 64;
const TRACK_TILE_HEIGHT = 64;
const PADDING = 8;
const HITBOX_LEEWAY = 8;
const MIN_OBSTACLE_DISTANCE = TRACK_TILE_HEIGHT * 3;
const MAX_OBSTACLE_DISTANCE = TRACK_TILE_HEIGHT * 8;
const DOUBLE_OBSTACLE_DISTANCE = TRACK_TILE_HEIGHT;
const ENDLESS_OBSTACLES_BATCH = 8;

const DOUBLE_HURDLE_LEVEL = 2;
const PUDDLE_LEVEL = 5;
const HURDLE_PUDDLE_LEVEL = PUDDLE_LEVEL + 1;
const BOOST_LEVEL = 9;
const HURDLE_BOOST_LEVEL = BOOST_LEVEL + 1;
const ALL_OBSTACLES_LEVEL = HURDLE_BOOST_LEVEL + 1;

class Obstacles {

  /**
   * 
   * @param {number} obstacleDistance 
   * @param {number} objectDistance 
   * @param {number} objectHeight 
   * @returns {boolean}
   */
  static collides(obstacleDistance, objectDistance, objectHeight) {
    return objectHeight <= this.obstacleHeight
      && objectDistance >= obstacleDistance
      && objectDistance <= obstacleDistance + this.hitboxLength;
  };

  /**
   * 
   * @param {(tileIndex: number, x: number, y: number, offsetStart: number, offsetEnd: number) => undefined} drawTileFunction 
   * @param {number} tileIndex 
   * @param {number} x 
   * @param {number} y 
   * @param {number} tracksY 
   * @param {number} tracksHeight 
   */
  static draw(drawTileFunction, tileIndex, x, y, tracksY, tracksHeight) {
    const offsetStart = Math.max(0, tracksY - y);
    const offsetEnd = Math.max(0, y + TRACK_TILE_HEIGHT - tracksY - tracksHeight);
    drawTileFunction(tileIndex, x, y + offsetStart, offsetStart, offsetEnd);
  }

  /**
   * 
   * @param {number} level 
   * @param {number} totalDistance 
   */
  static createObstaclesForLevel(level, totalDistance) {
    if (level > NUM_OF_LEVELS) {
      level -= NUM_OF_LEVELS;
    }

    const obstacleSpec = [
      { value: 1, func: this._createSingleHurdle }
    ];

    if (level >= DOUBLE_HURDLE_LEVEL) {
      obstacleSpec.push(
        { value: 1 / 7, func: this._createDoubleHurdle }
      );
    }

    if (level >= PUDDLE_LEVEL) {
      obstacleSpec.push(
        { value: 2 / 7, func: this._createSinglePuddle }
      );
    }

    if (level >= HURDLE_PUDDLE_LEVEL + 1) {
      obstacleSpec.push(
        { value: 1 / 7, func: this._createHurdlePuddle }
      );
    }

    if (level >= BOOST_LEVEL) {
      obstacleSpec.push(
        { value: 1 / 7, func: this._createSingleBoost }
      );
    }

    if (level >= HURDLE_BOOST_LEVEL) {
      obstacleSpec.push(
        { value: 1 / 14, func: this._createHurdleBoost }
      );
    }

    if (level >= ALL_OBSTACLES_LEVEL) {
      obstacleSpec.push(
        { value: 1 / 28, func: this._createBoostHurdle },
        { value: 1 / 28, func: this._createPuddleBoost },
        { value: 1 / 28, func: this._createBoostPuddle }
      );
    }

    return this._createObstacles(totalDistance, obstacleSpec);
  }

  /**
   * 
   * @param {number} [startDistance = 0] 
   */
  static createObstaclesForEndless(startDistance = 0) {
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

  /**
   * 
   * @param {number} distance 
   * @returns {[{ type: Obstacles.Obstacle, distance: number }]}
   */
  static _createBoostHurdle(distance) {
    return [
      { type: Obstacles.Obstacle.BOOST, distance: distance },
      { type: Obstacles.Obstacle.HURDLE, distance: distance + DOUBLE_OBSTACLE_DISTANCE * 2 }
    ];
  }

  /**
   * 
   * @param {number} distance 
   * @returns {[{ type: Obstacles.Obstacle, distance: number }]}
   */
  static _createPuddleBoost(distance) {
    return [
      { type: Obstacles.Obstacle.PUDDLE, distance: distance },
      { type: Obstacles.Obstacle.BOOST, distance: distance + DOUBLE_OBSTACLE_DISTANCE }
    ];
  }

  /**
   * 
   * @param {number} distance 
   * @returns {[{ type: Obstacles.Obstacle, distance: number }]}
   */
  static _createBoostPuddle(distance) {
    return [
      { type: Obstacles.Obstacle.BOOST, distance: distance },
      { type: Obstacles.Obstacle.PUDDLE, distance: distance + DOUBLE_OBSTACLE_DISTANCE * 2 }
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
    draw: function(drawTileFunction, ctx, x, y, tracksY, tracksHeight, fallen) {
      const tileIndex = fallen ? HURDLE_FALLEN_TILE_INDEX : HURDLE_TILE_INDEX;
      const drawY = y - HITBOX_LEEWAY;
      Obstacles.draw(drawTileFunction, tileIndex, x, drawY, tracksY, tracksHeight);
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
    draw: function(drawTileFunction, ctx, x, y, tracksY, tracksHeight) {
      const drawY = y - HITBOX_LEEWAY;
      Obstacles.draw(drawTileFunction, PUDDLE_TILE_INDEX, x, drawY, tracksY, tracksHeight);
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
    draw: function(drawTileFunction, ctx, x, y, tracksY, tracksHeight, fallen, totalTime) {
      const tileIndex = fallen ? BOOST_FALLEN_TILE_INDEX : BOOST_TILE_INDEX;
      Obstacles.draw(drawTileFunction, tileIndex, x, y, tracksY, tracksHeight);
      
      // Clip the arrows to the track dimensions
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, tracksY, TRACK_TILE_WIDTH, TRACKS_HEIGHT);
      ctx.clip();

      ctx.strokeStyle = fallen ? '#cc1' : '#ee1';
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

      ctx.restore();
    },
    collides: Obstacles.collides
  })
});