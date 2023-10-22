const TRACK_TILE_WIDTH = 64;
const TRACK_TILE_HEIGHT = 64;
const PADDING = 8;
const HITBOX_LEEWAY = 8;
const MIN_OBSTACLE_DISTANCE = TRACK_TILE_HEIGHT * 3;
const MAX_OBSTACLE_DISTANCE = TRACK_TILE_HEIGHT * 8;
const DOUBLE_OBSTACLE_DISTANCE = TRACK_TILE_HEIGHT;
const PUDDLE_LEVEL = 5;
const BOOST_LEVEL = 10;

class Obstacles {

  static collides = function(obstacleDistance, objectDistance, objectHeight) {
    return objectHeight <= this.obstacleHeight
      && objectDistance >= obstacleDistance
      && objectDistance <= obstacleDistance + this.hitboxLength;
  };
  
  static Obstacle = Object.freeze({
    HURDLE: Object.freeze({
      spriteWidth: TRACK_TILE_WIDTH,
      hitboxLength: TRACK_TILE_HEIGHT / 4,
      obstacleHeight: 10,
      fallable: true,
      boost: false,
      draw: function(ctx, x, y, fallen) {
        ctx.fillStyle = fallen ? '#999' : '#ddd';
        ctx.fillRect(x, y - HITBOX_LEEWAY, this.spriteWidth, this.hitboxLength + 2 * HITBOX_LEEWAY);
      },
      collides: this.collides
    }),
    PUDDLE: Object.freeze({
      spriteWidth: TRACK_TILE_HEIGHT - PADDING * 2,
      hitboxLength: TRACK_TILE_HEIGHT / 2,
      obstacleHeight: 0,
      fallable: false,
      boost: false,
      draw: function(ctx, x, y, fallen) {
        ctx.fillStyle = '#321';
        ctx.fillRect(x + PADDING, y - HITBOX_LEEWAY, this.spriteWidth, this.hitboxLength + 2 * HITBOX_LEEWAY);
      },
      collides: this.collides
    }),
    BOOST: Object.freeze({
      spriteWidth: TRACK_TILE_HEIGHT - PADDING * 2,
      hitboxLength: TRACK_TILE_HEIGHT - PADDING * 2,
      obstacleHeight: 0,
      fallable: true,
      boost: true,
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
      collides: this.collides
    })
  });

  /**
   * 
   * @param {number} level 
   * @param {number} totalDistance 
   */
  static createObstaclesForLevel(level, totalDistance) {
    const hurdlePool = [
      Array(7).fill(this._createSingleHurdle),
      Array(1).fill(this._createDoubleHurdle)
    ];

    const puddlePool = [
      Array(2).fill(this._createSinglePuddle),
      Array(1).fill(this._createHurdlePuddle)
    ];

    const boostPool = [
      Array(1).fill(this._createSingleBoost),
      Array(1).fill(this._createHurdleBoost)
    ];

    const obstaclePool = [
      hurdlePool,
      level > PUDDLE_LEVEL ? puddlePool : [],
      level > BOOST_LEVEL ? boostPool : []
    ].flat(2);

    const obstacles = [];
    let distance = MAX_OBSTACLE_DISTANCE - MIN_OBSTACLE_DISTANCE;
    while (distance < totalDistance - MAX_OBSTACLE_DISTANCE) {
      distance += MIN_OBSTACLE_DISTANCE + Math.floor(Math.random() * (MAX_OBSTACLE_DISTANCE - MIN_OBSTACLE_DISTANCE));
      obstacles.push(
        ...obstaclePool[Math.floor(Math.random() * obstaclePool.length)](distance)
      );
    }

    console.log(obstacles);
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
  static _createDoubleHurdle = (distance) => {
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
  static _createHurdleBoost = (distance) => {
    return [
      { type: Obstacles.Obstacle.HURDLE, distance: distance },
      { type: Obstacles.Obstacle.BOOST, distance: distance + DOUBLE_OBSTACLE_DISTANCE }
    ];
  }

}