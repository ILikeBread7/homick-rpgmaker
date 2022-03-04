(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  /**
   * 
   * @param {number} level 
   */
  const startLevel = (level) => {
    console.log(`Level ${level}`);
    document.getElementById('level_select').style.display = 'none';
    
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
      { acceleration: 1, maxSpeed: 5 },
      { acceleration: 2, maxSpeed: 4 },
      { acceleration: 3, maxSpeed: 6 },
      { acceleration: 1, maxSpeed: 3 }
    ]
    
    const race = new Race(canvas, ctx, homicks, obstacles, (8 + level) * 15 * TRACK_TILE_HEIGHT);
    
    let lastTotalInterval = 0;
    const start = new Date().getTime();
    setInterval(() => {
      const now = new Date().getTime();
      const totalTime = now - start;
      const deltaTime = totalTime - lastTotalInterval;
      race.update(deltaTime);
      race.draw(totalTime);
      lastTotalInterval = totalTime;
    }, 1000 / FPS);
  }

  document.getElementById('track_1_button').addEventListener('click', () => startLevel(1));
  document.getElementById('track_2_button').addEventListener('click', () => startLevel(2));
  document.getElementById('track_3_button').addEventListener('click', () => startLevel(3));
})();