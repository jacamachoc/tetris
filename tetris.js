const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

ctx.scale(20, 20);

const matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

function createMatrix(w, h) {
  const matrix = [];

  while(h--)
    matrix.push(new Array(w).fill(0));

  return matrix;
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value !== 0) {
        ctx.fillStyle = 'red';
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];

  for(let y = 0; y < m.length; ++y) {
    for(let x = 0; x < m[y].length; ++x) {
      if(m[y][x] !== 0 &&
         (arena[y + o.y] &&
         arena[y + o.y][x + o.x]) !== 0)
         return true
    }
  }
  return false;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function playerDrop() {
  player.pos.y++;

  if(collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    player.pos.y = 0;
  }
  dropCounter = 0;
}

function playerMove(direction) {
  player.pos.x += direction;

  if(collide(arena, player))
    player.pos.x -= direction;
}

function playerRotate(direction) {
  const pos = player.pos.x
  let offset = 1;

  rotate(player.matrix, direction);
  while(collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));

    if(offset > player.matrix[0].length) {
      rotate(player.matrix, -direction);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, direction) {
  for(let y = 0; y < matrix.length; ++y) {
    for(let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }

  if(direction > 0)
    matrix.forEach(row => row.reverse());
  else
    matrix.reverse();
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
function update(time = 0) {
  const delta = time - lastTime;

  lastTime = time;
  dropCounter += delta;
  if(dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);

const player = {
  pos: {x: 0, y: 0},
  matrix: matrix,
}

document.addEventListener('keydown', event => {
  if(event.keyCode === 37) // left
    playerMove(-1);
  else if(event.keyCode === 39) // right
    playerMove(1);
  else if(event.keyCode === 40) // down
    playerDrop();
  else if(event.keyCode === 38) // up (piece rotate - clockwise default)
    playerRotate(1);
});

update();