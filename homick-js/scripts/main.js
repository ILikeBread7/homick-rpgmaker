(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  /**
   * 
   * @param {number} level -1 for endless mode, use startEndlessMode function instead
   * @returns { { race: Race, interval: number } }
   */
  const startLevel = (level) => {
    console.log(`Level ${level}`);
    document.getElementById('ui_div').style.display = 'none';
    
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
    
    const race = new Race(canvas, ctx, homicks, obstacles, level === -1 ? 0 : (level === 0 ? (10 * TRACK_TILE_HEIGHT) : totalDistance));
    
    const countdownTime = 1000;
    const countdownLeft = 160;
    const countdownTop = TRACK_TILE_HEIGHT * 5;
    ctx.font = '24px Arial';
    ctx.fillStyle = '#f00';

    let lastTotalInterval = 0;
    const start = new Date().getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const totalTime = now - start;
      const deltaTime = totalTime - lastTotalInterval;
      if (totalTime < countdownTime * 3) {
        race.draw(totalTime);
        if (totalTime < countdownTime) {
          ctx.fillText('3', countdownLeft, countdownTop);
        } else if (totalTime < countdownTime * 2) {
          ctx.fillText('2', countdownLeft, countdownTop);
        } else {
          ctx.fillText('1', countdownLeft, countdownTop);
        }
      } else {
        if (level === -1 && obstacles.length - race.currentObstacleIndex <= ENDLESS_OBSTACLES_BATCH / 2) {
          addNewEndlessObstacles();
          if (race.maxSpeed < 5) {
            race.increaseMaxSpeed(0.25);
          }
        }
        race.update(deltaTime);
        race.draw(totalTime);
        if (totalTime < countdownTime * 4) {
          ctx.fillStyle = '#0f0';
          ctx.fillText('GO!', countdownLeft, countdownTop);
        }
      }
      lastTotalInterval = totalTime;
    }, 1000 / FPS);

    return { race, interval };
  }

  const startEndlessMode = () => startLevel(-1);

  /**
   * @type { { race: Race, interval: number } }
   */
  let raceData = {};
  document.getElementById('track_0_button').addEventListener('click', () => raceData = startLevel(0));
  document.getElementById('track_1_button').addEventListener('click', () => raceData = startLevel(1));
  document.getElementById('track_2_button').addEventListener('click', () => raceData = startLevel(2));
  document.getElementById('track_3_button').addEventListener('click', () => raceData = startLevel(3));
  document.getElementById('track_5_button').addEventListener('click', () => raceData = startLevel(5));
  document.getElementById('track_6_button').addEventListener('click', () => raceData = startLevel(6));
  document.getElementById('track_11_button').addEventListener('click', () => raceData = startLevel(11));
  document.getElementById('endless_button').addEventListener('click', () => raceData = startEndlessMode());
  canvas.addEventListener('click', () => {
    if (raceData.race && raceData.race.isFinished) {
      clearInterval(raceData.interval);
      document.getElementById('ui_div').style.display = 'block';
    }
  })
})();