class HomickRacer {

  /**
   * @param {Window_Base} window
   * @param {number} level -1 for endless mode, use startEndlessMode function instead
   * @returns {race: Race}
   */
  static startLevel(window, level) {
    const totalDistance = this.getTotalDistanceForLevel(level);
    const obstacles = level === -1
      ? Obstacles.createObstaclesForEndless()
      : Obstacles.createObstaclesForLevel(level, totalDistance)
    ;

    const homicks = level === -1
      ? [ { acceleration: 0.75, maxSpeed: 2, player: () => new HumanPlayer() } ]
      : [
        { acceleration: 0.5, maxSpeed: 3, player: () => new HumanPlayer() },
        { acceleration: 2, maxSpeed: 2.5, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 20, 10) },
        { acceleration: 2, maxSpeed: 2.5, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 10, 8) },
        { acceleration: 2, maxSpeed: 2.72, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 12, 10, 6, 3) }
      ];
    
    const race = new Race(window, homicks, obstacles, totalDistance);
    return race;
  }

  /**
   * @param {Window_Base} window
   * @returns {race: Race}
   */
  static startEndlessMode(window) {
    return this.startLevel(window, -1);
  }

  /**
   * 
   * @param {Window_Base} window 
   * @param {number} level 
   * @param {number} numberOfHumanPlayers 
   * @param {number} numberOfCpuPlayers 
   * @param {0|1|2} cpuDifficulty 
   * @returns {Race}
   */
  static startMultiplayer(window, level, numberOfHumanPlayers, numberOfCpuPlayers, cpuDifficulty) {
    const homicks = [];
    
    for (let i = 1; i <= numberOfHumanPlayers; i++) {
      homicks.push({ acceleration: 0.5, maxSpeed: 3, player: () => new HumanPlayer(i) });
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
    const race = new Race(window, homicks, obstacles, totalDistance);
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
}