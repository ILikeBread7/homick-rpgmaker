class HomickRacer {

  /**
   * @param {Bitmap} contents
   * @param {number} level -1 for endless mode, use startEndlessMode function instead
   * @returns {race: Race}
   */
  static startLevel(contents, level) {
    console.log(`Level ${level}`);
    
    const totalDistance = (8 + level) * 15 * TRACK_TILE_HEIGHT;
    const obstacles = [];

    let obstacleToDelete = 0;
    const addNewEndlessObstacles = () => {
      const obstacleDistance = obstacles.length ? obstacles[obstacles.length - 1].distance : 0;
      for (; obstacleToDelete < obstacles.length - ENDLESS_OBSTACLES_BATCH; obstacleToDelete++) {
        delete obstacles[obstacleToDelete];
      }

      obstacles.push(...Obstacles.createObstaclesForEndless(obstacleDistance));
    };

    switch (level) {
      case 1:
        for (let i = 0; i < 30; i++) {
          obstacles.push({ type: Obstacles.Obstacle.HURDLE, distance: 6 * (i + 1) * TRACK_TILE_HEIGHT })
        }
      break;
      case 2:
        for (let i = 0; i < 30; i++) {
          obstacles.push({ type: Obstacles.Obstacle.HURDLE, distance: 7 * (i + 1) * TRACK_TILE_HEIGHT })
          obstacles.push({ type: Obstacles.Obstacle.PUDDLE, distance: (7 * (i + 1) + 2) * TRACK_TILE_HEIGHT })
        }
      break;
      case 3:
        for (let i = 0; i < 30; i++) {
          obstacles.push({ type: Obstacles.Obstacle.HURDLE, distance: 8 * (i + 1) * TRACK_TILE_HEIGHT })
          obstacles.push({ type: Obstacles.Obstacle.PUDDLE, distance: (8 * (i + 1) + 2) * TRACK_TILE_HEIGHT })
          obstacles.push({ type: Obstacles.Obstacle.BOOST, distance: (8 * (i + 1) + 3) * TRACK_TILE_HEIGHT })
        }
      break;
      case -1:
        addNewEndlessObstacles();
      break;
      default:
        obstacles.push(...Obstacles.createObstaclesForLevel(level, totalDistance));
      break;
    }

    obstacles.sort((o1, o2) => o1.distance - o2.distance);

    const homicks = level === -1
      ? [ { acceleration: 0.75, maxSpeed: 2, player: () => new HumanPlayer() } ]
      : [
        { acceleration: 0.5, maxSpeed: 3, player: () => new HumanPlayer() },
        { acceleration: 2, maxSpeed: 2.5, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 20, 10) },
        { acceleration: 2, maxSpeed: 2.5, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 10, 8) },
        { acceleration: 2, maxSpeed: 2.5, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 12, 10, 6, 3) }
      ];
    
    const race = new Race(contents, homicks, obstacles, level === -1 ? 0 : (level === 0 ? (10 * TRACK_TILE_HEIGHT) : totalDistance));
    return race;
  }

  /**
   * @param {Bitmap} contents
   * @returns {race: Race}
   */
  static startEndlessMode(contents) {
    return this.startLevel(contents, -1);
  }
}