const FPS = 60;
const TRACKS_NUMBER = 4;
const TRACK_TILE_WIDTH = 64;
const TRACK_TILE_HEIGHT = 64;
const TRACK_HEIGHT = 8;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const start = new Date().getTime();

const tracksX = (canvas.width - (TRACK_TILE_WIDTH * TRACKS_NUMBER)) / 2;
const tracksY = (canvas.height - (TRACK_TILE_HEIGHT * TRACK_HEIGHT)) / 2;

setInterval(() => {
  const now = new Date().getTime();
  const interval = now - start;
  drawBackground();
  drawTracks(interval);
  drawHomicks(interval);
}, 1000 / FPS);

function drawBackground() {
  ctx.fillStyle = '#78fbcf';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * @param {number} interval 
 */
function drawHomicks(interval) {
  const PADDING = 8;
  const offset = (Math.floor((interval % 500) / 250) * 2 - 1) * PADDING / 2;
  ctx.fillStyle = '#8b4513';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(tracksX + PADDING + offset + i * TRACK_TILE_WIDTH, tracksY + PADDING, TRACK_TILE_WIDTH - 2 * PADDING, TRACK_TILE_HEIGHT - 2 * PADDING);
  }
}

/**
 * @param {number} interval 
 */
function drawTracks(interval) {
  const colors = ['#7f7f10', '#4f4f10'];
  const offset = TRACK_TILE_HEIGHT - ((interval % 1000) / 1000 * TRACK_TILE_HEIGHT);
  const startingColorIndex = Math.floor((interval % 2000) / 1000);

  const firstColor = colors[(startingColorIndex + 1) % colors.length];
  ctx.fillStyle = firstColor;
  ctx.fillRect(tracksX, tracksY, TRACK_TILE_WIDTH * TRACKS_NUMBER, offset);
  for (let i = 0; i < TRACK_HEIGHT - 1; i++) {
    const color = colors[(startingColorIndex + i) % colors.length];
    ctx.fillStyle = color;
    ctx.fillRect(tracksX, tracksY + offset + i * TRACK_TILE_HEIGHT, TRACK_TILE_WIDTH * TRACKS_NUMBER, TRACK_TILE_HEIGHT);
  }
  const lastColor = colors[(startingColorIndex + 1) % colors.length];
  ctx.fillStyle = lastColor;
  ctx.fillRect(tracksX, tracksY + offset + (TRACK_HEIGHT - 1) * TRACK_TILE_HEIGHT, TRACK_TILE_WIDTH * TRACKS_NUMBER, TRACK_TILE_HEIGHT - offset);
}