(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  /**
   * 
   * @param {number} level 
   * @returns { { race: Race, interval: number } }
   */
  const startLevel = (level) => {
    console.log(`Level ${level}`);
    document.getElementById('ui_div').style.display = 'none';
    
    const obstacles = [];

    switch (level) {
      case 1:
        for (let i = 0; i < 30; i++) {
          obstacles.push({ type: Race.Obstacle.HURDLE, distance: 6 * (i + 1) * TRACK_TILE_HEIGHT - HOMICK_SPRITE_HEIGHT })
        }
      break;
      case 2:
        for (let i = 0; i < 30; i++) {
          obstacles.push({ type: Race.Obstacle.HURDLE, distance: 7 * (i + 1) * TRACK_TILE_HEIGHT - HOMICK_SPRITE_HEIGHT })
          obstacles.push({ type: Race.Obstacle.PUDDLE, distance: (7 * (i + 1) + 2) * TRACK_TILE_HEIGHT - HOMICK_SPRITE_HEIGHT })
        }
      break;
      case 3:
        for (let i = 0; i < 30; i++) {
          obstacles.push({ type: Race.Obstacle.HURDLE, distance: 8 * (i + 1) * TRACK_TILE_HEIGHT - HOMICK_SPRITE_HEIGHT })
          obstacles.push({ type: Race.Obstacle.PUDDLE, distance: (8 * (i + 1) + 2) * TRACK_TILE_HEIGHT - HOMICK_SPRITE_HEIGHT })
          obstacles.push({ type: Race.Obstacle.BOOST, distance: (8 * (i + 1) + 6) * TRACK_TILE_HEIGHT - HOMICK_SPRITE_HEIGHT })
        }
      break;
    }

    obstacles.sort((o1, o2) => o1.distance - o2.distance);

    const homicks = [
      { acceleration: 0.75, maxSpeed: 3.5, player: () => new HumanPlayer() },
      { acceleration: 0.75, maxSpeed: 3.5, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 12, 4) },
      { acceleration: 0.75, maxSpeed: 3.5, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 12, 4) },
      { acceleration: 0.75, maxSpeed: 3.5, player: (homick, obstacles) => new SimpleAi(homick, obstacles, 10, 3) }
    ]
    
    const race = new Race(canvas, ctx, homicks, obstacles, level === 0 ? (10 * TRACK_TILE_HEIGHT) : ((8 + level) * 15 * TRACK_TILE_HEIGHT));
    
    let lastTotalInterval = 0;
    const start = new Date().getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const totalTime = now - start;
      const deltaTime = totalTime - lastTotalInterval;
      race.update(deltaTime);
      race.draw(totalTime);
      lastTotalInterval = totalTime;
    }, 1000 / FPS);

    return { race, interval };
  }

  /**
   * @type { { race: Race, interval: number } }
   */
  let raceData = {};
  document.getElementById('track_0_button').addEventListener('click', () => raceData = startLevel(0));
  document.getElementById('track_1_button').addEventListener('click', () => raceData = startLevel(1));
  document.getElementById('track_2_button').addEventListener('click', () => raceData = startLevel(2));
  document.getElementById('track_3_button').addEventListener('click', () => raceData = startLevel(3));
  canvas.addEventListener('click', () => {
    if (raceData.race && raceData.race.isFinished) {
      clearInterval(raceData.interval);
      document.getElementById('ui_div').style.display = 'block';
    }
  })
})();