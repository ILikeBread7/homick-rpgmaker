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
      homicks.push({ acceleration: 0.75, maxSpeed: 3, player: () => new HumanPlayer(i) });
    }

    if (numberOfCpuPlayers) {
      const acceleration = 1.5 + cpuDifficulty * 0.5;
      const maxSpeed = 2 + cpuDifficulty * 0.5;
      const preJumpDistance = 12 - cpuDifficulty * 2;
      const varianceRange = 12 - cpuDifficulty;
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
      return [ { acceleration: 0.75, maxSpeed: 2.5, player: () => new HumanPlayer() } ];
    }

    const playerMinSpeed = 2.5;
    const playerMaxSpeed = 3.5;
    const playerSpeed = this._getHomickSpeedForLevel(level, playerMinSpeed, playerMaxSpeed);
    
    const homicks = [ { acceleration: 0.75, maxSpeed: playerSpeed, player: () => new HumanPlayer() } ];

    // Not a boss level, add mobs
    if (level % 4 !== 0) {
      const homickMobMinSpeed = 2;
      const homickMobMaxSpeed = 3.15;
      const homickMobSpeed = this._getHomickSpeedForLevel(level, homickMobMinSpeed, homickMobMaxSpeed);
      homicks.push(
        { acceleration: 2, maxSpeed: homickMobSpeed, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 20, 10, 8, 5) },
        { acceleration: 2, maxSpeed: homickMobSpeed, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 10, 8,  5, 4) }
      );
    }

    // Boss homick
    homicks.push({ acceleration: 2, maxSpeed: playerSpeed, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 15, 7, 6, 3) });

    return homicks;
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