const TRACK_TILE_WIDTH = 64;
const TRACK_TILE_HEIGHT = 64;
const PADDING = 8;
const HITBOX_LEEWAY = 8;

class Obstacles {
  static collides = function(obstacleDistance, objectDistance, objectHeight) {
    return objectHeight <= this.obstacleHeight
      && objectDistance >= obstacleDistance
      && objectDistance <= obstacleDistance + this.hitboxLength;
  };
  
  static Obstacle = Object.freeze({
    HURDLE: Object.freeze({
      spriteWidth: TRACK_TILE_WIDTH,
      hitboxLength: TRACK_TILE_HEIGHT / 4,
      obstacleHeight: 10,
      fallable: true,
      boost: false,
      draw: function(ctx, x, y, fallen) {
        ctx.fillStyle = fallen ? '#999' : '#ddd';
        ctx.fillRect(x, y - HITBOX_LEEWAY, this.spriteWidth, this.hitboxLength + 2 * HITBOX_LEEWAY);
      },
      collides: this.collides
    }),
    PUDDLE: Object.freeze({
      spriteWidth: TRACK_TILE_HEIGHT - PADDING * 2,
      hitboxLength: TRACK_TILE_HEIGHT / 2,
      obstacleHeight: 0,
      fallable: false,
      boost: false,
      draw: function(ctx, x, y, fallen) {
        ctx.fillStyle = '#321';
        ctx.fillRect(x + PADDING, y - HITBOX_LEEWAY, this.spriteWidth, this.hitboxLength + 2 * HITBOX_LEEWAY);
      },
      collides: this.collides
    }),
    BOOST: Object.freeze({
      spriteWidth: TRACK_TILE_HEIGHT - PADDING * 2,
      hitboxLength: TRACK_TILE_HEIGHT - PADDING * 2,
      obstacleHeight: 0,
      fallable: true,
      boost: true,
      draw: function(ctx, x, y, fallen, totalTime) {
        ctx.fillStyle = fallen ? '#811' : '#e11';
        ctx.fillRect(x + PADDING, y, this.spriteWidth, this.hitboxLength);
        ctx.strokeStyle = '#ee1';
        ctx.lineWidth = 5;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const offset = i * this.spriteWidth / 3.5 + (totalTime % 500 < 250 ? 1 : -1) * 4;
          const heightFactor = 0.7;
          ctx.moveTo(x + PADDING * 2, y + PADDING + offset);
          ctx.lineTo(x + PADDING + this.spriteWidth / 2, y + (PADDING + this.hitboxLength / 2) * heightFactor + offset);
          ctx.lineTo(x + this.spriteWidth, y + PADDING + offset);
        }
        ctx.stroke();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
      },
      collides: this.collides
    })
  });
}