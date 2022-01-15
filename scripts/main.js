(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const start = new Date().getTime();
  
  const obstacles = [];
  for (let i = 0; i < 100; i++) {
    obstacles.push({ type: Race.Obstacle.HURDLE, distance: 8 * (i + 1) * TRACK_TILE_HEIGHT - HOMICK_SPRITE_HEIGHT })
    obstacles.push({ type: Race.Obstacle.PUDDLE, distance: (8 * (i + 1) + 2) * TRACK_TILE_HEIGHT - HOMICK_SPRITE_HEIGHT })
  }
  obstacles.sort((o1, o2) => o1.distance - o2.distance);

  const homicks = [
    { acceleration: 1, maxSpeed: 5 },
    { acceleration: 2, maxSpeed: 4 },
    { acceleration: 1.5, maxSpeed: 3.5 },
    { acceleration: 1, maxSpeed: 3 }
  ]
  
  const race = new Race(canvas, ctx, homicks, obstacles);
  
  let lastTotalInterval = 0;
  setInterval(() => {
    const now = new Date().getTime();
    const totalTime = now - start;
    const deltaTime = totalTime - lastTotalInterval;
    race.update(deltaTime);
    race.draw(totalTime);
    lastTotalInterval = totalTime;
  }, 1000 / FPS);
})();