const FPS = 60;
const TRACKS_NUMBER = 4;
const TRACK_TILE_WIDTH = 64;
const TRACK_TILE_HEIGHT = 64;
const TRACK_HEIGHT = 8;
const CANVAS = document.getElementById('canvas');
const CTX = CANVAS.getContext('2d', { alpha: false });
const TRACKS_X = (CANVAS.width - (TRACK_TILE_WIDTH * TRACKS_NUMBER)) / 2;
const TRACKS_Y = (CANVAS.height - (TRACK_TILE_HEIGHT * TRACK_HEIGHT)) / 2;
const START = new Date().getTime();

setInterval(() => {
  const now = new Date();
  const interval = now.getTime() - START;
  drawBackground();
  drawTracks(interval);
}, 1000 / FPS);

function drawBackground() {
  CTX.fillStyle = '#78fbcf';
  CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
}

/**
 * @param {number} interval 
 */
function drawTracks(interval) {
  const colors = ['#7f7f10', '#4f4f10'];
  const offset = (interval % 1000) / 1000 * TRACK_TILE_HEIGHT;
  const startingColorIndex = Math.floor((interval % 2000) / 1000);

  const firstColor = colors[(startingColorIndex + 1) % colors.length];
  CTX.fillStyle = firstColor;
  CTX.fillRect(TRACKS_X, TRACKS_Y, TRACK_TILE_WIDTH * TRACKS_NUMBER, offset);
  for (let i = 0; i < TRACK_HEIGHT - 1; i++) {
    const color = colors[(startingColorIndex + i) % colors.length];
    CTX.fillStyle = color;
    CTX.fillRect(TRACKS_X, TRACKS_Y + offset + i * TRACK_TILE_HEIGHT, TRACK_TILE_WIDTH * TRACKS_NUMBER, TRACK_TILE_HEIGHT);
  }
  const lastColor = colors[(startingColorIndex + 1) % colors.length];
  CTX.fillStyle = lastColor;
  CTX.fillRect(TRACKS_X, TRACKS_Y + offset + (TRACK_HEIGHT - 1) * TRACK_TILE_HEIGHT, TRACK_TILE_WIDTH * TRACKS_NUMBER, TRACK_TILE_HEIGHT - offset);
}