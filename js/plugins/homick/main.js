class HomickRacer {

  /**
   * @param {Window_Base} window
   * @param {string} bgmName 
   * @param {number} level -1 for endless mode, use startEndlessMode function instead
   * @returns {race: Race}
   */
  static startLevel(window, bgmName, level) {
    const totalDistance = this.getTotalDistanceForLevel(level);
    const obstacles = level === -1
      ? Obstacles.createObstaclesForEndless()
      : Obstacles.createObstaclesForLevel(level, totalDistance)
    ;

    const homicks = this._getHomicksForLevel(level);
    const race = new Race(window, bgmName, homicks, obstacles, totalDistance);
    return race;
  }

  /**
   * @param {Window_Base} window
   * @param {string} bgmName 
   * @returns {race: Race}
   */
  static startEndlessMode(window, bgmName) {
    return this.startLevel(window, bgmName, -1);
  }

  /**
   * 
   * @param {Window_Base} window 
   * @param {string} bgmName 
   * @param {number} level 
   * @param {number} numberOfHumanPlayers 
   * @param {number} numberOfCpuPlayers 
   * @param {0|1|2} cpuDifficulty 
   * @returns {Race}
   */
  static startMultiplayer(window, bgmName, level, numberOfHumanPlayers, numberOfCpuPlayers, cpuDifficulty) {
    const homicks = [];
    
    for (let i = 1; i <= numberOfHumanPlayers; i++) {
      homicks.push({ acceleration: 1, maxSpeed: 3, player: () => new HumanPlayer(i) });
    }

    if (numberOfCpuPlayers) {
      const acceleration = 2;
      const maxSpeed = 2.5 + cpuDifficulty * 0.25;
      const preJumpDistance = 20 - cpuDifficulty * 2;
      const varianceRange = 12 - cpuDifficulty * 2;
      const boostPreJumpDistance = cpuDifficulty && (3 * (3 - cpuDifficulty));
      const boostVarianceRange = cpuDifficulty && (2 * (3 - cpuDifficulty));
      const homick = { acceleration, maxSpeed, player: (homick, obstacles) => new SimpleAi(homick, obstacles, preJumpDistance, varianceRange, boostPreJumpDistance, boostVarianceRange) };
      for (let i = 0; i < numberOfCpuPlayers; i++) {
        homicks.push(homick);
      }
    }

    const totalDistance = this.getTotalDistanceForLevel(level);
    const obstacles = Obstacles.createObstaclesForLevel(level, totalDistance);
    const race = new Race(window, bgmName, homicks, obstacles, totalDistance);
    return race;
  }

  /**
   * 
   * @param {number} level 
   * @returns {number}
   */
  static getTotalDistanceForLevel(level) {
    // Endless mode
    if (level === -1) {
      return 0;
    }

    // Bonus level
    if (level === 33) {
      // Make the distance "boss distance"
      level += 3;
    }

    if (level > NUM_OF_LEVELS) {
      level -= NUM_OF_LEVELS - 8;
    }

    const levelsPerStage = 4;
    const distancePerStage = TRACKS_HEIGHT * 6;
    const distancePerLevel = TRACKS_HEIGHT * 3;
    const minDistance = TRACKS_HEIGHT * 5;
    const levelIndex = level - 1;
    return minDistance + Math.floor(levelIndex * distancePerStage / levelsPerStage) + (levelIndex % levelsPerStage) * distancePerLevel;
  }

  /**
   * 
   * @param {number} level 
   * @returns 
   */
  static _getHomicksForLevel(level) {
    // Endless mode
    if (level === -1) {
      return [ { acceleration: 1, maxSpeed: 2.5, player: () => new HumanPlayer() } ];
    }

    const hardMode = this._isHardMode(level);
    const hardModeSpeedModifier = hardMode ? 0.25 : 0;
    const hardModeVarianceModifier = hardMode ? 3 : 0;
    const hardModeBoostVarianceModifier = hardMode ? 2 : 0;

    const playerMinSpeed = 2.5 + hardModeSpeedModifier;
    const playerMaxSpeed = 3.25 + hardModeSpeedModifier;
    const playerSpeed = this._getHomickSpeedForLevel(level, playerMinSpeed, playerMaxSpeed);
    const playerSpriteIndex = 0;

    const homicks = [ { acceleration: 1, maxSpeed: playerSpeed, player: () => new HumanPlayer(), spriteIndex: playerSpriteIndex } ];

    const bossPreJumpDistance = 15 - hardModeVarianceModifier;
    const bossVarianceRange = 7 - hardModeVarianceModifier;
    const bossBoostPreJumpDistance = 6 - hardModeBoostVarianceModifier;
    const bossBoostVarianceRange = 3 - hardModeBoostVarianceModifier;
    const bossSpriteOffset = 4;

    // If it's the bonus level add all bosses
    if (level === 33) {
      homicks.unshift(
        { acceleration: 2, maxSpeed: playerSpeed, player: (homick, obstacles) => new SimpleAi(homick, obstacles, bossPreJumpDistance, bossVarianceRange, bossBoostPreJumpDistance, bossBoostVarianceRange), spriteIndex: bossSpriteOffset },
        { acceleration: 2, maxSpeed: playerSpeed, player: (homick, obstacles) => new SimpleAi(homick, obstacles, bossPreJumpDistance, bossVarianceRange, bossBoostPreJumpDistance, bossBoostVarianceRange), spriteIndex: bossSpriteOffset + 1 }
      );
      homicks.push(
        { acceleration: 2, maxSpeed: playerSpeed, player: (homick, obstacles) => new SimpleAi(homick, obstacles, bossPreJumpDistance, bossVarianceRange, bossBoostPreJumpDistance, bossBoostVarianceRange), spriteIndex: bossSpriteOffset + 2 },
        { acceleration: 2, maxSpeed: playerSpeed, player: (homick, obstacles) => new SimpleAi(homick, obstacles, bossPreJumpDistance, bossVarianceRange, bossBoostPreJumpDistance, bossBoostVarianceRange), spriteIndex: bossSpriteOffset + 3 }
      );

      return homicks;
    }

    // Not a boss level, add mobs
    if (level % 4 !== 0) {
      const homickMobMinSpeed = 2 + hardModeSpeedModifier * 2;
      const homickMobMaxSpeed = 3 + hardModeSpeedModifier * 2;
      const homickMobSpeed = this._getHomickSpeedForLevel(level, homickMobMinSpeed, homickMobMaxSpeed);
      homicks.push(
        { acceleration: 2, maxSpeed: homickMobSpeed, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 20 - hardModeVarianceModifier, 10 - hardModeVarianceModifier, 8 - hardModeBoostVarianceModifier, 5 - hardModeBoostVarianceModifier) },
        { acceleration: 2, maxSpeed: homickMobSpeed, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 10 - hardModeVarianceModifier, 8 - hardModeBoostVarianceModifier,  5 - hardModeBoostVarianceModifier, 4 - hardModeBoostVarianceModifier) }
      );
    }

    // Boss homick
    let spriteIndex = undefined; // Don't set if not boss level
    if (level % 4 === 0) {
      const mappedLevel = level > NUM_OF_LEVELS ? level - NUM_OF_LEVELS : level;
      spriteIndex = Math.floor(mappedLevel / 4) - 1 + bossSpriteOffset;
    }
    homicks.push({ acceleration: 2, maxSpeed: playerSpeed, player: (homick, obstacles) => new SimpleAi(homick, obstacles, bossPreJumpDistance, bossVarianceRange, bossBoostPreJumpDistance, bossBoostVarianceRange), spriteIndex });

    return homicks;
  }

  static _isHardMode(level) {
    return level > NUM_OF_LEVELS;
  }

  /**
   * 
   * @param {number} level 
   * @param {number} minSpeed 
   * @param {number} maxSpeed 
   * @returns 
   */
  static _getHomickSpeedForLevel(level, minSpeed, maxSpeed) {
    const maxLevel = 16;
    return minSpeed + (level / maxLevel) * (maxSpeed - minSpeed);
  }
}