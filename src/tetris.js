const canvas = document.getElementById("tetris");
const next = document.getElementById("nextPiece");
const ctx = canvas.getContext("2d");
const ctx2 = next.getContext("2d");

ctx.scale(20, 20);
ctx2.scale(20, 20);

var pause = false;
var pauseControl = 0;
const pieces = 'IJLOSTZ';
const colors = [
  null, 
  'red',
  'blue',
  '#8641f4',
  'green',
  'orange',
  '#42f4d9',
  'yellow'
];
const arena = createMatrix(12, 20);
const player = {
  pos: {x: (10 * Math.random() | 0), y: 0},
  nextMatrix: createPiece(pieces[pieces.length * Math.random() | 0]),
  matrix: undefined,
  score: 0,
}

function createMatrix(w, h) {
  const matrix = [];

  while(h--)
    matrix.push(new Array(w).fill(0));

  return matrix;
}

function createPiece(type) {
  if(type === 'I') {
    return [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
    ];
  }
  else if(type === 'J'){
    return [
      [0, 2, 0],
      [0, 2, 0],
      [2, 2, 0],
    ];
  }
  else if(type === 'L') {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ];
  }
  else if(type === 'O') {
    return [
      [4, 4],
      [4, 4],
    ];
  }
  else if(type === 'S') {
    return [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ];
  }
  if(type === 'T') {
    return [
      [6, 6, 6],
      [0, 6, 0],
      [0, 0, 0],
    ];
  }
  else if(type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ];
  }
}

function arenaSweep() {
  let rowFilled = 1;
  outer: for(let y = arena.length - 1; y > 0; --y) {
    for(let x = 0; x < arena[y].length; ++x) {
      if(arena[y][x] === 0)
        continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowFilled * 10; 
    rowFilled *= 2;
  }
}

function updateScore() {
  document.getElementById("score").innerText = player.score;
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

function showPauseText() {
  var x = document.getElementById("paused");
  if(pauseControl % 2 === 0){   
    x.style.display = 'block';
  }
  else {
    x.style.display = 'none';
  }
  ++pauseControl;
}

function playerDrop(inc) {
  while(inc-- && !collide(arena, player))
    player.pos.y++;

  if(collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    player.pos.y = 0;
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(direction) {
  player.pos.x += direction;

  if(collide(arena, player))
    player.pos.x -= direction;
}

function playerReset() {
  nextPiece();
  player.pos.y = 0;
  player.pos.x = (10 * Math.random() | 0);

  if(collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function nextPiece() {
  player.matrix = player.nextMatrix;
  player.nextMatrix = createPiece(pieces[pieces.length * Math.random() | 0]);
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

function drawMatrix(matrix, offset, next = undefined) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
  if(next) {
    next.forEach((row, y) => {
      row.forEach((value, x) => {
        if(value !== 0) {
          ctx2.fillStyle = colors[value];
          ctx2.fillRect(x, y, 1, 1);
        }
      });
    });
  }
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx2.fillStyle = '#000';
  ctx2.fillRect(0, 0, next.width, next.height);

  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos, player.nextMatrix);
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
function update(time = 0) {
  const delta = time - lastTime;
  if(!pause) {
    lastTime = time;
    dropCounter += delta;
    if(dropCounter > dropInterval) {
      playerDrop(1);
    }
    draw();
  }
  requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
  if(event.keyCode === 37) // left
    playerMove(-1);
  else if(event.keyCode === 39) // right
    playerMove(1);
  else if(event.keyCode === 40) // down
    playerDrop(1);
  else if(event.keyCode === 38) // up (piece rotate - clockwise default)
    playerRotate(1);
  else if(event.keyCode === 32) // space (until collide)
    playerDrop(20); // argument sufficiently big to travel the whole arena height
  else if(event.keyCode === 80) {
    showPauseText();
    pause = !(pause);
  }
});

updateScore();
nextPiece();
update();