const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const start = new Date().getTime();

const game = new Game(canvas, ctx, 4);

let lastTotalInterval = 0;
setInterval(() => {
  const now = new Date().getTime();
  const totalTime = now - start;
  const deltaTime = totalTime - lastTotalInterval;
  game.update(deltaTime);
  game.draw(totalTime);
  lastTotalInterval = totalTime;
}, 1000 / FPS);