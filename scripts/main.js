const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const start = new Date().getTime();

const game = new Game(canvas, ctx);

setInterval(() => {
  const now = new Date().getTime();
  const interval = now - start;
  game.draw(interval);
}, 1000 / FPS);