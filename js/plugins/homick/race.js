const TRACK_HEIGHT = 9;
const HOMICK_SPRITE_HEIGHT = 57;
const TOP_Y = Math.floor(HOMICK_SPRITE_HEIGHT * 1.5);
const MAX_DISTANCE_OFFSET = Math.floor(TRACK_TILE_HEIGHT * 5);
const TIME_STEP = 10;
const PLAYER_NAME_COLORS = [RPG_MAKER_COLOR_GREEN, RPG_MAKER_COLOR_BLUE, RPG_MAKER_COLOR_YELLOW, RPG_MAKER_COLOR_PURPLE];
const CPU_NAME_COLOR = RPG_MAKER_COLOR_DARK_RED;
const FINISH_LINE_HEIGHT = 16 * 3;
const TRACKS_Y = Math.floor((BASE_HEIGHT - (TRACK_TILE_HEIGHT * TRACK_HEIGHT)) / 2);
const TRACKS_HEIGHT = TRACK_HEIGHT * TRACK_TILE_HEIGHT;

const FINISH_POSITIONS = ['1st', '2nd', '3rd', '4th', '5th'];
const POSITION_COLORS = [RPG_MAKER_COLOR_GREEN, RPG_MAKER_COLOR_YELLOW, RPG_MAKER_COLOR_RED, RPG_MAKER_COLOR_DARK_RED, RPG_MAKER_COLOR_PURPLE];
const POSITIONS_MARGIN_TOP = Math.floor(TRACKS_Y + TRACK_TILE_HEIGHT * TRACK_HEIGHT);

const COUNTDOWN_TIME = 1000;
const COUNTDOWN_TOP = Math.floor(TRACK_TILE_HEIGHT * 4.5);

const COUNTDOWN_SOUNDS = [
  { name: 'go', volume: 90, pitch: 100, pan: 0},
  { name: '1', volume: 90, pitch: 100, pan: 0},
  { name: '2', volume: 90, pitch: 100, pan: 0},
  { name: '3', volume: 90, pitch: 100, pan: 0}
];

class Race {

  /**
   * @param {Window_Base} window 
   * @param {string} bgmName 
   * @param {[{ acceleration: number, maxSpeed: number, player: (homick: Homick, obstacles: {[{ type: Obstacles.Obstacle, distance: number }]}) => { jump(): boolean } }]} homicks
   * @param {[{ type: Obstacles.Obstacle, distance: number }]} obstacles
   * @param {number} totalDistance 0 for endless mode
   * @param {number} [numberOfHumanPlayers = 1]
   */
  constructor(window, bgmName, homicks, obstacles, totalDistance, numberOfHumanPlayers = 1) {
    this._window = window;
    this._contents = window.contents;
    this._ctx = this._contents._context;
    this._bgmName = bgmName;
    this._tracksX = (BASE_WIDTH - (TRACK_TILE_WIDTH * homicks.length)) / 2;
    this._homicks = homicks.map((homick, index) => new Homick(homick.acceleration, homick.maxSpeed, (homick.spriteIndex !== undefined ? homick.spriteIndex : index), index));
    this._players = homicks.map((homick, index) => homick.player(this._homicks[index], obstacles));
    this._obstacles = obstacles;
    this._previousFirstDrawnObstacleIndexes = homicks.map(h => 0);
    this._fallenHurdles = homicks.map(h => []);
    this._totalDistance = totalDistance;
    this._totalTime = 0;
    this._lastPlayedCountdownSe = Number.MAX_SAFE_INTEGER;
    this._bgmStarted = false;

    if (this._isEndless) {
      this._obstacleToDelete = 0;
      this._boostScore = 0;
      this._highscoreAchieved = false;
      this._highscoreBoostsAchieved = false;
      this._highscoreDistanceAchieved = false;
    }

    // For drawing the current position
    this._homicksOrdered = [...this._homicks].reverse();
    this._finishedPositions = [];

    this._numberOfHumanPlayers = numberOfHumanPlayers;
    this._playerNames = this._players.map((player, index) => player.isHuman ? `P${(homicks[index].spriteIndex !== undefined ? homicks[index].spriteIndex : index) + 1}` : 'CPU');
    this._playerColors = this._players.map((player, index) => player.isHuman ? PLAYER_NAME_COLORS[(homicks[index].spriteIndex !== undefined ? homicks[index].spriteIndex : index)] : CPU_NAME_COLOR);
    this._tiles = ImageManager.loadPicture('tiles');

    // Only to be passed to Obstacle.draw function
    // not to be used directly
    this._drawTileFunction = (tileIndex, x, y, offsetStart, offsetEnd) => this._drawTile(tileIndex, x, y, offsetStart, offsetEnd);
  }

  /**
   * 
   * @param {number} deltaTime 
   */
  update(deltaTime) {
    this._totalTime += deltaTime;
    if (this._totalTime < COUNTDOWN_TIME * 3) {
      return;
    }
    if (this._isEndless && this._obstacles.length - this.currentObstacleIndex <= ENDLESS_OBSTACLES_BATCH / 2) {
      this._addNewEndlessObstacles();
      if (this.maxSpeed < 5) {
        this.increaseMaxSpeed(0.25);
      }
    }
    for (let remainingTime = deltaTime; remainingTime > 0; remainingTime -= TIME_STEP) {
      const oneStepTime = Math.min(TIME_STEP, remainingTime);
      const leadingDistance = this._homicks.reduce((currentMaxDistance, current) => Math.max(current.distance, currentMaxDistance), 0);
      this._homicks.forEach((homick, index) => {
        if (homick.isFinished(this._totalDistance)) {
          return;
        }

        const distanceToFirst = this._totalDistance ? ((leadingDistance - homick.distance) / this._totalDistance) : 0;
        homick.travel(
          oneStepTime,
          this._players[index].jump(),
          this._obstacles,
          this._fallenHurdles[index],
          distanceToFirst
        );

        if (this._isEndless && homick._justBoosted) {
          this._boostScore++;
        }

        if (homick.isFinished(this._totalDistance)) {
          const position = this._finishedPositions.filter(x => !!x).length + 1;
          this._finishedPositions[index] = position;
          homick.finish();
          if (!this._isEndless) {
            AudioManager.playSe(HomickUtils.makeSeVariedPitch(FINISH_SE));
          }
        }
      });
    }
  }

  draw() {
    this._drawHomicksAndTracks(this._totalTime);
    if (this._totalTime < COUNTDOWN_TIME * 4) {
      this._drawCountdown(this._totalTime);
    }
    if (this._isEndless) {
      this._drawEndlessScore(this.endlessDistance);
    } else {
      this._drawFinishLineOnSide();
      this._drawPositions();
    }
    if (this.isFinished) {
      this._drawRaceFinished();
    }
    this._drawPauseButton();
  }

  /**
   * 
   * @param {number} speed speed to be added
   */
  increaseMaxSpeed(speed) {
    this._homicks[0].increaseMaxSpeed(speed);
  }

  _addNewEndlessObstacles() {
    const obstacleDistance = this._obstacles.length ? this._obstacles[this._obstacles.length - 1].distance : 0;
    for (; this._obstacleToDelete < this._obstacles.length - ENDLESS_OBSTACLES_BATCH; this._obstacleToDelete++) {
      delete this._obstacles[this._obstacleToDelete];
    }

    this._obstacles.push(...Obstacles.createObstaclesForEndless(obstacleDistance));
  };

  get maxSpeed() {
    return this._homicks[0].maxSpeed;
  }

  get currentObstacleIndex() {
    return this._homicks[0].currentObstacleIndex;
  }

  _drawCountdown() {
    if (this._totalTime === 0) {
      // Don't start the countdown when the
      // start common event is still running
      return;
    }
    
    this._contents.fontSize = 32;
    this._changeTextColorRPGMaker(RPG_MAKER_COLOR_DARK_RED);
    if (this._totalTime < COUNTDOWN_TIME) {
      this._changeTextOutlineColor(WHITE_OUTLINE_COLOR);
      this._drawCountdownDigit('3');
      this._playCountdownSe(3);
    } else if (this._totalTime < COUNTDOWN_TIME * 2) {
      this._changeTextOutlineColor(WHITE_OUTLINE_COLOR);
      this._drawCountdownDigit('2');
      this._playCountdownSe(2);
    } else if (this._totalTime < COUNTDOWN_TIME * 3){
      this._changeTextColorRPGMaker(RPG_MAKER_COLOR_YELLOW);
      this._drawCountdownDigit('1');
      this._playCountdownSe(1);
    } else {
      this._changeTextColorRPGMaker(RPG_MAKER_COLOR_GREEN);
      this._drawCountdownDigit('GO!');
      this._playCountdownSe(0);
      this._playRaceBgm();
    }
    this._window.resetFontSettings();
    this._resetTextOutlineColor();
  }

  _drawCountdownDigit(digit) {
    this._window.drawText(digit, 0, COUNTDOWN_TOP, BASE_WIDTH, 'center');
  }

  /**
   * 
   * @param {number} countdownValue 0 for "GO"
   */
  _playCountdownSe(countdownValue) {
    if (this._lastPlayedCountdownSe > countdownValue) {
      AudioManager.playSe(COUNTDOWN_SOUNDS[countdownValue]);
      this._lastPlayedCountdownSe = countdownValue;
    }
  }

  _playRaceBgm() {
    if (this._bgmStarted) {
      return;
    }

    AudioManager.playBgm({
      name: this._bgmName,
      volume: 90,
      pitch: 100,
      pan: 0
    });
    this._bgmStarted = true;
  }

  _drawHomicksAndTracks() {
    const animetionFrameDuration = 125;
    const homickFrame = Math.round(Math.sin(Math.floor(this._totalTime / animetionFrameDuration) / 2 * Math.PI));

    const offset = homickFrame * PADDING / 2;
    this._drawTracksBackground(this._homicks.length);
    this._homicks.forEach((homick, index) => {
      this._drawName(this._playerNames[index], this._playerColors[index], index);
      this._drawTrack(homick.distance, index);
      this._drawObstacles(homick.distance, index);
      this._drawTrackPits(index);
      this._drawHomick(homick, index, homickFrame, offset);
    });
  }

  /**
   * 
   * @param {Homick} homick 
   * @param {number} index 
   * @param {number} homickFrame 
   * @param {number} offset 
   */
  _drawHomick(homick, index, homickFrame, offset) {
    const distanceOffset = this._findDistanceOffset(homick.distance);
    const x = this._tracksX + index * TRACK_TILE_WIDTH + offset;
    const y = TRACKS_Y - HOMICK_SPRITE_HEIGHT + TOP_Y - homick.height + distanceOffset;
    this._drawShadow(homick, index, distanceOffset, offset);
    
    let baseSpriteIndex = HOMICK_SPRITE_INDEX + homick.spriteIndex * TRACK_TILES_COLS;
    if (homick.isBoosting) {
      baseSpriteIndex += HOMICK_BOOSTED_SPRITE_INDEX - HOMICK_SPRITE_INDEX;
    } else if (homick.isHit) {
      baseSpriteIndex += HOMICK_SPRITE_HIT_INDEX - HOMICK_SPRITE_INDEX;
    }
    this._drawTile(baseSpriteIndex + homickFrame, x, y);

    if (homick.isBoosting) {
      const boostFrame = Math.floor(homick.boostTime / 125) % 3;
      this._drawTile(BOOST_ANIMATION_FRAME_1 + boostFrame, x, y);
    }
  }

  /**
   * 
   * @param {Homick} homick 
   * @param {number} index 
   * @param {number} distanceOffset
   * @param {number} xOffset 
   */
  _drawShadow(homick, index, distanceOffset, xOffset) {
    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this._ctx.beginPath();
    const homickSpriteWidth = 35;
    const maxHeightFactor = 128;
    const heightFactor = (maxHeightFactor - Math.min(homick.height, maxHeightFactor)) / maxHeightFactor;
    this._ctx.ellipse(
      this._tracksX + index * TRACK_TILE_WIDTH + TRACK_TILE_WIDTH / 2 + xOffset / 2,
      TRACKS_Y + TOP_Y + distanceOffset,
      homickSpriteWidth / 2 * heightFactor,
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
    const nextObstacleIndex = HomickUtils.findIndexStartingAt(
      this._obstacles,
      this._previousFirstDrawnObstacleIndexes[homickIndex],
      o => o.distance >= distance - TOP_Y - distanceOffset - TRACK_TILE_HEIGHT
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
      nextObstacle.type.draw(this._drawTileFunction, this._ctx, homickIndex * TRACK_TILE_WIDTH + this._tracksX, relativeDistance + TRACKS_Y + TOP_Y, TRACKS_Y, TRACKS_HEIGHT, this._fallenHurdles[homickIndex][i], this._totalTime);
    }
  }

  /**
   * @param {number} tracksNumber
   */
  _drawTracksBackground(tracksNumber) {
    this._ctx.fillStyle = '#000';
    this._ctx.fillRect(this._tracksX, TRACKS_Y, TRACK_TILE_WIDTH * tracksNumber, TRACK_TILE_HEIGHT * TRACK_HEIGHT)
  }

  /**
   * @param {number} distance
   * @param {number} homickIndex 
   */
  _drawTrack(distance, homickIndex) {
    const distanceOffset = this._findDistanceOffset(distance);
    const effectiveDistance = distance - distanceOffset;
    const offset = TRACK_TILE_HEIGHT - (effectiveDistance % TRACK_TILE_HEIGHT);
    
    const x = this._tracksX + TRACK_TILE_WIDTH * homickIndex;
    let tileIndex = this._calculateTileIndex(effectiveDistance - TRACK_TILE_HEIGHT + offset);
    this._drawTile(
      tileIndex,
      x,
      TRACKS_Y,
      TRACK_TILE_HEIGHT - offset
    )
    for (let i = 0; i < TRACK_HEIGHT - 1; i++) {
      tileIndex = this._calculateTileIndex(effectiveDistance + i * TRACK_TILE_HEIGHT + offset);
      this._drawTile(
        tileIndex,
        x,
        TRACKS_Y + offset + i * TRACK_TILE_HEIGHT
      );
    }

    tileIndex = this._calculateTileIndex(effectiveDistance + (TRACK_HEIGHT - 1) * TRACK_TILE_HEIGHT + offset);
    this._drawTile(
      tileIndex,
      x,
      TRACKS_Y + offset + (TRACK_HEIGHT - 1) * TRACK_TILE_HEIGHT,
      0,
      offset
    );

    if (!this._isEndless) {
      this._drawFinishLineOnTrack(distance, homickIndex, distanceOffset);
    }
  }

  /**
   * 
   * @param {number} distance 
   * @returns {0|1|2|3} Track tile index for the distance
   */
  _calculateTileIndex(distance) {
    if (this._isEndless) {
      return TRACK_TILE_INDEX;
    }
    if (distance > this._totalDistance * 0.9) {
      return TRACK_TILE_LAST_INDEX;
    }
    return Math.max(Math.min(Math.floor((distance / this._totalDistance) * 3), TRACK_TILE_PENULTIMATE_INDEX), TRACK_TILE_INDEX);
  }

  /**
   * 
   * @param {number} homickIndex 
   */
  _drawTrackPits(homickIndex) {
    const x = this._tracksX + TRACK_TILE_WIDTH * homickIndex;
    this._drawTile(TOP_PIT_TILE_INDEX, x, TRACKS_Y);
    this._drawTile(BOTTOM_PIT_TILE_INDEX, x, TRACKS_Y + (TRACK_HEIGHT - 1) * TRACK_TILE_HEIGHT);
  }

  /**
   * 
   * @param {number} tileIndex 
   * @param {number} x 
   * @param {number} y 
   * @param {number} [offsetStart=0] 
   * @param {number} [offsetEnd=0] 
   */
  _drawTile(tileIndex, x, y, offsetStart = 0, offsetEnd = 0) {
    this._contents.blt(
      this._tiles,
      Math.floor((tileIndex % TRACK_TILES_COLS) * TRACK_TILE_WIDTH),
      Math.floor(Math.floor(tileIndex / TRACK_TILES_COLS) * TRACK_TILE_HEIGHT + offsetStart),
      Math.floor(TRACK_TILE_WIDTH),
      Math.floor(TRACK_TILE_HEIGHT - offsetStart - offsetEnd),
      Math.floor(x),
      Math.floor(y)
    );
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

    const trackBottom = TRACKS_Y + TRACK_TILE_HEIGHT * TRACK_HEIGHT;
    const finishLineY = relativeDistance + TRACKS_Y + TOP_Y;
    this._drawTile(
      FINISH_TILE_INDEX,
      this._tracksX + TRACK_TILE_WIDTH * homickIndex,
      finishLineY,
      0,
      Math.max(0, finishLineY + TRACK_TILE_HEIGHT - trackBottom)
    );
  }

  /**
   * 
   * @param {string} name 
   * @param {number} index 
   * @param {number} rpgMakerColor
   */
  _drawName(name, rpgMakerColor, index) {
    const marginTop = 32;
    this._contents.fontSize = 24;

    this._changeTextColorRPGMaker(rpgMakerColor);

    this._window.drawText(
      name,
      this._tracksX + TRACK_TILE_WIDTH * index,
      TRACKS_Y - marginTop,
      TRACK_TILE_WIDTH,
      'center'
    );

    this._window.resetFontSettings();
  }

  _drawFinishLineOnSide() {
    this._drawTile(
      FINISH_TILE_INDEX,
      this._tracksX - TRACK_TILE_WIDTH,
      TRACKS_Y + TOP_Y + MAX_DISTANCE_OFFSET,
    );

    this._drawTile(
      FINISH_TILE_INDEX,
      this._tracksX + TRACK_TILE_WIDTH * this._homicks.length,
      TRACKS_Y + TOP_Y + MAX_DISTANCE_OFFSET,
    );
  }

  _drawPositions() {
    this._contents.fontSize = 24;
    this._homicksOrdered.sort((h1, h2) => h2.distance - h1.distance).forEach((homick, currentOrder) => {
      const position = this._finishedPositions[homick.index] || (currentOrder + 1);
      this._changeTextColorRPGMaker(POSITION_COLORS[position - 1]);
      this._window.drawText(
        FINISH_POSITIONS[position - 1],
        this._tracksX + TRACK_TILE_WIDTH * homick.index,
        POSITIONS_MARGIN_TOP,
        TRACK_TILE_WIDTH,
        'center'
      );
    });
    this._window.resetFontSettings();
  }

  _drawRaceFinished() {
    const marginTop = TRACK_TILE_HEIGHT * 8;

    this._contents.fontSize = 24;
    this._changeTextColorRPGMaker(RPG_MAKER_COLOR_YELLOW);
    this._window.drawText('Click to go back to menu', 0, marginTop, BASE_WIDTH, 'center');
    this._window.resetFontSettings();
  }

  /**
   * 
   * @param {number} distance 
   */
  _drawEndlessScore(distance) {
    const marginLeft = 220;
    const marginTop = TRACK_TILE_HEIGHT * 2;
    const score = this.currentObstacleIndex;
    distance = Math.floor(distance);

    this._highscoreAchieved = this._highscoreAchieved || (score > $f.getEndlessHighscore());
    this._highscoreBoostsAchieved = this._highscoreBoostsAchieved || (this._boostScore > $f.getEndlessBoostsHighscore());
    this._highscoreDistanceAchieved = this._highscoreDistanceAchieved || (distance > $f.getEndlessDistanceHighscore());
    
    this._contents.fontSize = 16;
    this._adjustColorForHighscore(this._highscoreAchieved);
    this._window.drawText(`Score: ${score}`, marginLeft, marginTop);
    this._adjustColorForHighscore(this._highscoreBoostsAchieved);
    this._window.drawText(`Boosts: ${this._boostScore}`, marginLeft, marginTop + 20);
    this._adjustColorForHighscore(this._highscoreDistanceAchieved);
    this._window.drawText(`Distance: ${distance}`, marginLeft, marginTop + 40);
    this._window.resetFontSettings();
  }

  _adjustColorForHighscore(highscoreAchieved) {
    if (highscoreAchieved) {
      this._changeTextColorRPGMaker(RPG_MAKER_COLOR_YELLOW);
    } else {
      this._changeTextColorRPGMaker(RPG_MAKER_COLOR_DEFAULT);
    }
  }

  _drawPauseButton() {
    const pauseSpriteSize = 48;
    const tileIndex = (TouchInput.x >= BASE_WIDTH - pauseSpriteSize && TouchInput.y <= pauseSpriteSize)
      ? PAUSE_HOVERED_TILE_INDEX
      : PAUSE_TILE_INDEX;
    this._drawTile(tileIndex, BASE_WIDTH - TRACK_TILE_WIDTH, 0);
  }

  /**
   * 
   * @param {number} distance 
   */
  _findDistanceOffset(distance) {
    return this._totalDistance && (distance * MAX_DISTANCE_OFFSET / this._totalDistance);
  }

  /**
   * 
   * @param {number} rpgMakerTextColorCode 
   */
  _changeTextColorRPGMaker(rpgMakerTextColorCode) {
    this._window.changeTextColor(this._window.textColor(rpgMakerTextColorCode));
  }
  
  /**
   * 
   * @param {string} color 
   */
  _changeTextOutlineColor(color) {
    this._contents.outlineColor = color;
  }

  _resetTextOutlineColor() {
    // The default outline color
    this._contents.outlineColor = 'rgba(0, 0, 0, 0.5)';
  }

  get isFinished() {
    for (let i = 0; i < this._homicks.length; i++) {
      const homick = this._homicks[i];
      const player = this._players[i];
      if (player.isHuman && !homick.isFinished(this._totalDistance)) {
        return false;
      }
    }
    return true;
  }

  get playerScore() {
    if (this._isEndless) {
      return this.currentObstacleIndex;
    }

    const playerIndex = this.isBonus ? 2 : 0;

    if (this._finishedPositions[playerIndex] === 1) {
      if (this._homicks[playerIndex].wasHit) {
        return 2;
      }
      return 3;
    }

    if (this._finishedPositions[playerIndex] === 2 && !this.isBoss) {
      return 1;
    }

    return 0;
  }

  get boostScore() {
    return this._boostScore || 0;
  }

  get endlessDistance() {
    return Math.floor(this._homicks[0].distance / 10);
  }

  get playerFinalPosition() {
    const playerIndex = this.isBonus ? 2 : 0;
    return this._finishedPositions[playerIndex];
  }

  get isBonus() {
    return this._homicks.length === 5;
  }

  get isBoss() {
    return this._homicks.length === 2 || this.isBonus;
  }

  get _isEndless() {
    return this._totalDistance === 0;
  }

}