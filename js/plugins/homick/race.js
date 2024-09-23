const TRACK_HEIGHT = 8;
const HOMICK_SPRITE_HEIGHT = TRACK_TILE_HEIGHT - 2 * PADDING;
const TOP_Y = Math.floor(HOMICK_SPRITE_HEIGHT * 1.5);
const MAX_DISTANCE_OFFSET = Math.floor(TRACK_TILE_HEIGHT * 5);
const TIME_STEP = 10;
const FINISH_POSITIONS = ['1st', '2nd', '3rd', '4th'];
const FINISH_LINE_HEIGHT = 16 * 3;

class Race {

  /**
   * 
   * @param {HTMLCanvasElement} canvas 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {[{ acceleration: number, maxSpeed: number, player: (homick: Homick, obstacles: {[{ type: Obstacles.Obstacle, distance: number }]}) => { jump(): boolean } }]} homicks
   * @param {[{ type: Obstacles.Obstacle, distance: number }]} obstacles
   * @param {number} totalDistance 0 for endless mode
   */
  constructor(canvas, ctx, homicks, obstacles, totalDistance) {
    this._canvas = canvas;
    this._ctx = ctx;
    this._tracksX = (BASE_WIDTH - (TRACK_TILE_WIDTH * homicks.length)) / 2;
    this._tracksY = (BASE_HEIGHT - (TRACK_TILE_HEIGHT * TRACK_HEIGHT)) / 2;
    this._homicks = homicks.map(h => new Homick(h.acceleration, h.maxSpeed));
    this._players = homicks.map((homick, index) => homick.player(this._homicks[index], obstacles));
    this._obstacles = obstacles;
    this._previousFirstDrawnObstacleIndexes = homicks.map(h => 0);
    this._fallenHurdles = homicks.map(h => []);
    this._totalDistance = totalDistance;
    this._finishedPositions = [];
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
            const position = this._finishedPositions.filter(x => !!x).length + 1;
            this._finishedPositions[index] = position;
          }
          homick.finish();
        } else {
          homick.travel(
            oneStepTime,
            this._players[index] ? this._players[index].jump() : (index === 0 ? Events.pressed : (index % 2 === 0 && Math.abs(50 - homick.distance % 100) > 5)),
            this._obstacles,
            this._fallenHurdles[index],
            this._homicks.filter(h => h.distance > homick.distance).length + 1
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
    if (this._totalDistance) {
      this._drawFinishLineOnSide();
    } else {
      this._drawEndlessScore(Math.floor(this._homicks[0].distance));
    }
    this._drawHomicksAndTracks(totalTime);
    this._drawFinishPositions();
    if (this.isFinished) {
      this._drawRaceFinished();
    }
  }

  /**
   * 
   * @param {number} speed speed to be added
   */
  increaseMaxSpeed(speed) {
    this._homicks[0].increaseMaxSpeed(speed);
  }

  get maxSpeed() {
    return this._homicks[0].maxSpeed;
  }

  get currentObstacleIndex() {
    return this._homicks[0].currentObstacleIndex;
  }

  /**
   * @param {number} totalTime 
   */
  _drawHomicksAndTracks(totalTime) {
    const offset = (Math.floor((totalTime % 500) / 250) * 2 - 1) * PADDING / 2;
    this._drawTracksBackground(this._homicks.length);
    this._homicks.forEach((homick, index) => {
      this._drawName(index === 0 ? 'You' : 'CPU', index, index === 0);
      this._drawTrack(homick.distance, index);
      this._drawObstacles(homick.distance, index, totalTime);
      this._drawHomick(homick, index, offset);
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
  _drawObstacles(distance, homickIndex, totalTime) {
    const previousFirstObstacleIndex = this._previousFirstDrawnObstacleIndexes[homickIndex];
    if (previousFirstObstacleIndex === -1) {
      return;
    }
    const distanceOffset = this._findDistanceOffset(distance);
    const nextObstacleIndex = HomickUtils.findIndexStartingAt(
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
      nextObstacle.type.draw(this._ctx, homickIndex * TRACK_TILE_WIDTH + this._tracksX, relativeDistance + this._tracksY + TOP_Y, this._fallenHurdles[homickIndex][i], totalTime);
    }
  }

  /**
   * @param {number} tracksNumber
   */
  _drawTracksBackground(tracksNumber) {
    this._ctx.fillStyle = '#7f7f10';
    this._ctx.fillRect(this._tracksX, this._tracksY, TRACK_TILE_WIDTH * tracksNumber, TRACK_TILE_HEIGHT * TRACK_HEIGHT)
  }

  /**
   * @param {number} distance
   * @param {number} homickIndex 
   */
  _drawTrack(distance, homickIndex) {
    const distanceOffset = this._findDistanceOffset(distance);
    const effectiveDistance = distance - distanceOffset;
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
    if (this._totalDistance) { // if not endless mode
      this._drawFinishLineOnTrack(distance, homickIndex, distanceOffset);
    }
  }

  /**
   * 
   * @param {number} distance 
   * @param {number} homickIndex 
   * @param {number} distanceOffset 
   * @returns 
   */
  _drawFinishLineOnTrack(distance, homickIndex, distanceOffset) {
    const relativeDistance = this._totalDistance - distance + distanceOffset;
    if (relativeDistance > TRACK_TILE_HEIGHT * TRACK_HEIGHT) {
      return;
    }
    this._ctx.fillStyle = '#000';
    this._ctx.fillRect(this._tracksX + TRACK_TILE_WIDTH * homickIndex, relativeDistance + this._tracksY + TOP_Y, TRACK_TILE_WIDTH, FINISH_LINE_HEIGHT);
  }

  /**
   * 
   * @param {string} name 
   * @param {number} index 
   * @param {boolean} isPlayer
   */
  _drawName(name, index, isPlayer) {
    const marginLeft = 8;
    const marginTop = 10;
    this._ctx.fillStyle = isPlayer ? '#33e' : '#e33';
    this._ctx.font = '24px Arial';
    this._ctx.fillText(
      name,
      this._tracksX + marginLeft + TRACK_TILE_WIDTH * index,
      this._tracksY - marginTop
    );
  }

  _drawBackground() {
    this._ctx.fillStyle = '#78fbcf';
    this._ctx.fillRect(0, 0, BASE_HEIGHT, BASE_HEIGHT);
  }

  _drawFinishLineOnSide() {
    const finishSquareRows = 3;
    const finishSquareColumns = 3;
    const finishSquareSize = FINISH_LINE_HEIGHT / finishSquareRows;
    for (let part = 0; part < 2; part++) {
      for (let row = 0; row < finishSquareRows; row++) {
        for (let column = 0; column < finishSquareColumns; column++) {
          this._ctx.fillStyle = (row + column) % 2 === 0 ? '#000' : '#fff';
          this._ctx.fillRect(
            this._tracksX - (1 - part) * (finishSquareSize * finishSquareColumns) + part * TRACK_TILE_WIDTH * this._homicks.length + column * finishSquareSize,
            this._tracksY + TOP_Y + MAX_DISTANCE_OFFSET + row * finishSquareSize,
            finishSquareSize, finishSquareSize
          );
        }
      }
    }
  }

  _drawFinishPositions() {
    const marginLeft = 14;
    const marginTop = TRACK_TILE_HEIGHT * 2.5;
    this._ctx.font = '24px Arial';
    this._homicks.forEach((homick, index) => {
      const position = this._finishedPositions[index];
      this._ctx.fillStyle = position === 1 ? '#3e3' : '#e33';
      if (position) {
        this._ctx.fillText(
          FINISH_POSITIONS[position - 1],
          this._tracksX + marginLeft + TRACK_TILE_WIDTH * index,
          this._tracksY + marginTop
        );
      }
    });
  }

  _drawRaceFinished() {
    const marginLeft = 48;
    const marginTop = TRACK_TILE_HEIGHT * 8;
    this._ctx.font = '24px Arial';
    this._ctx.fillStyle = '#e33';
    this._ctx.fillText('Click to go back to menu', marginLeft, marginTop);
  }

  /**
   * 
   * @param {number} distance 
   */
  _drawEndlessScore(distance) {
    const marginLeft = 220;
    const marginTop = TRACK_TILE_HEIGHT * 4;
    this._ctx.font = '16px Arial';
    this._ctx.fillStyle = '#33e';
    this._ctx.fillText(`Score: ${this.currentObstacleIndex}`, marginLeft, marginTop);
    this._ctx.fillText(`Distance: ${distance}`, marginLeft, marginTop + 20);
  }

  /**
   * 
   * @param {number} distance 
   */
  _findDistanceOffset(distance) {
    return this._totalDistance && (distance * MAX_DISTANCE_OFFSET / this._totalDistance);
  }

  get isFinished() {
    return this._homicks[0].isFinished(this._totalDistance);
  }

}