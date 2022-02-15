const TRACK_TILE_WIDTH = 64;
const TRACK_TILE_HEIGHT = 64;
const TRACK_HEIGHT = 8;
const PADDING = 8;
const HOMICK_SPRITE_HEIGHT = TRACK_TILE_HEIGHT - 2 * PADDING;
const TOP_Y = TRACK_TILE_HEIGHT * 2 + HOMICK_SPRITE_HEIGHT;
const MAX_DISTANCE_OFFSET = TRACK_TILE_HEIGHT * 3;
const TIME_STEP = 10;

class Race {

  static collides = function(obstacleDistance, objectDistance, objectHeight) {
    return objectHeight <= this.obstacleHeight
      && objectDistance >= obstacleDistance
      && objectDistance <= obstacleDistance + this.spriteHeight;
  };

  static Obstacle = Object.freeze({
    HURDLE: Object.freeze({
      spriteWidth: TRACK_TILE_WIDTH,
      spriteHeight: TRACK_TILE_HEIGHT / 2,
      obstacleHeight: 10,
      fallable: true,
      boost: false,
      draw: function(ctx, x, y, fallen) {
        ctx.fillStyle = fallen ? '#999' : '#ddd';
        ctx.fillRect(x, y, this.spriteWidth, this.spriteHeight);
      },
      collides: this.collides
    }),
    PUDDLE: Object.freeze({
      spriteWidth: TRACK_TILE_HEIGHT - PADDING * 2,
      spriteHeight: TRACK_TILE_HEIGHT - PADDING * 2,
      obstacleHeight: 0,
      fallable: false,
      boost: false,
      draw: function(ctx, x, y, fallen) {
        ctx.fillStyle = '#321';
        ctx.fillRect(x + PADDING, y + PADDING, this.spriteWidth, this.spriteHeight);
      },
      collides: this.collides
    }),
    BOOST: Object.freeze({
      spriteWidth: TRACK_TILE_HEIGHT - PADDING * 2,
      spriteHeight: TRACK_TILE_HEIGHT - PADDING * 2,
      obstacleHeight: 0,
      fallable: true,
      boost: true,
      draw: function(ctx, x, y, fallen) {
        ctx.fillStyle = fallen ? '#22e' : '#119';
        ctx.fillRect(x + PADDING, y + PADDING, this.spriteWidth, this.spriteHeight);
      },
      collides: this.collides
    })
  });

  /**
   * 
   * @param {HTMLCanvasElement} canvas 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {[{ acceleration: number, maxSpeed: number }]} homicks
   * @param {[{ type: Race.Obstacle, distance: number }]} obstacles
   * @param {number} totalDistance
   */
  constructor(canvas, ctx, homicks, obstacles, totalDistance) {
    this._canvas = canvas;
    this._ctx = ctx;
    this._tracksX = (canvas.width - (TRACK_TILE_WIDTH * homicks.length)) / 2;
    this._tracksY = (canvas.height - (TRACK_TILE_HEIGHT * TRACK_HEIGHT)) / 2;
    this._homicks = homicks.map(h => new Homick(h.acceleration, h.maxSpeed))
    this._obstacles = obstacles;
    this._previousFirstDrawnObstacleIndexes = homicks.map(h => 0);
    this._fallenHurdles = homicks.map(h => []);
    this._totalDistance = totalDistance;
  }

  /**
   * 
   * @param {number} deltaTime 
   */
  update(deltaTime) {
    for (let remainingTime = deltaTime; remainingTime > 0; remainingTime -= TIME_STEP) {
      const oneStepTime = Math.min(TIME_STEP, remainingTime);
      this._homicks.forEach((homick, index) => {
        if (homick.isFinished(this._totalDistance)) {
          if (homick.speed > 0) {
            const position = this._homicks.filter(h => h.isFinished(this._totalDistance)).length;
            console.log(`Homick #${index + 1} finished at position ${position}!`);
          }
          homick.finish();
        } else {
          homick.travel(
            oneStepTime,
            index === 0 ? Events.pressed : (index % 2 === 0 && Math.abs(50 - homick.distance % 100) > 5),
            this._obstacles,
            this._fallenHurdles[index]
          );
        }
      });
    }
  }

  /**
   * @param {number} totalTime 
   */
  draw(totalTime) {
    this._drawBackground();
    this._drawHomicksAndTracks(totalTime);
  }

  /**
   * @param {number} totalTime 
   */
  _drawHomicksAndTracks(totalTime) {
    const offset = (Math.floor((totalTime % 500) / 250) * 2 - 1) * PADDING / 2;
    this._homicks.forEach((homick, index) => {
      this._drawTrack(homick.distance, index);
      this._drawObstacles(homick.distance, index);
      this._drawHomick(homick, index, offset)
    });
  }

  /**
   * 
   * @param {Homick} homick 
   * @param {number} index 
   * @param {number} offset 
   */
  _drawHomick(homick, index, offset) {
    const distanceOffset = this._findDistanceOffset(homick.distance);
    this._drawShadow(homick, index, distanceOffset);
    this._ctx.fillStyle = '#8b4513';
    this._ctx.fillRect(this._tracksX + PADDING + offset + index * TRACK_TILE_WIDTH, this._tracksY - HOMICK_SPRITE_HEIGHT + TOP_Y - homick.height + distanceOffset, TRACK_TILE_WIDTH - 2 * PADDING, TRACK_TILE_HEIGHT - 2 * PADDING);
  }

  /**
   * 
   * @param {Homick} homick 
   * @param {number} index 
   * @param {number} distanceOffset
   */
  _drawShadow(homick, index, distanceOffset) {
    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this._ctx.beginPath();
    const maxHeightFactor = 128;
    const heightFactor = (maxHeightFactor - Math.min(homick.height, maxHeightFactor)) / maxHeightFactor;
    this._ctx.ellipse(
      this._tracksX + index * TRACK_TILE_WIDTH + TRACK_TILE_WIDTH / 2,
      this._tracksY + TOP_Y + distanceOffset,
      (TRACK_TILE_WIDTH - PADDING) / 2 * heightFactor,
      (TRACK_TILE_WIDTH - PADDING) / 4 * heightFactor,
      0, 0, 2 * Math.PI);
    this._ctx.fill();
  }

  /**
   * @param {number} distance
   * @param {number} homickIndex 
   */
  _drawObstacles(distance, homickIndex) {
    const previousFirstObstacleIndex = this._previousFirstDrawnObstacleIndexes[homickIndex];
    if (previousFirstObstacleIndex === -1) {
      return;
    }
    const distanceOffset = this._findDistanceOffset(distance);
    const nextObstacleIndex = Utils.findIndexStartingAt(
      this._obstacles,
      this._previousFirstDrawnObstacleIndexes[homickIndex],
      o => o.distance >= distance - TOP_Y - distanceOffset
    )
    this._previousFirstDrawnObstacleIndexes[homickIndex] = nextObstacleIndex;
    if (nextObstacleIndex === -1) {
      return;
    }
    for (let i = nextObstacleIndex; i < this._obstacles.length; i++) {
      const nextObstacle = this._obstacles[i];
      const relativeDistance = nextObstacle.distance - distance + distanceOffset;
      if (relativeDistance > TRACK_TILE_HEIGHT * TRACK_HEIGHT) {
        return;
      }
      nextObstacle.type.draw(this._ctx, homickIndex * TRACK_TILE_WIDTH + this._tracksX, relativeDistance + this._tracksY + TOP_Y, this._fallenHurdles[homickIndex][i]);
    }
  }

  /**
   * @param {number} distance
   * @param {number} homickIndex 
   */
  _drawTrack(distance, homickIndex) {
    const effectiveDistance = distance - this._findDistanceOffset(distance);
    const colors = ['#7f7f10', '#4f4f10'];
    const offset = TRACK_TILE_HEIGHT - (effectiveDistance % TRACK_TILE_HEIGHT);
    const startingColorIndex = Math.floor((effectiveDistance % (TRACK_TILE_HEIGHT * 2)) / TRACK_TILE_HEIGHT);
  
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

  /**
   * 
   * @param {number} distance 
   */
  _findDistanceOffset(distance) {
    return distance * MAX_DISTANCE_OFFSET / this._totalDistance;
  }

}