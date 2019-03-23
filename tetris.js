const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20); //scales the pieces up

const matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

function collide(arena, player){
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y){
    for (let x = 0; x < m[y].length; ++x){
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
          arena[y + o.y][x +o.x]) !== 0){
            return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h){
  const matrix = [];
  while (h--){
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function draw(){
  //redraw blank canvas everytime called
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  //redraw arena to show pieces as they get stuck
  drawMatrix(arena, {x: 0, y: 0});
  //redraw the piece as it moves
  drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset){
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0){
        context.fillStyle = 'red';
        context.fillRect(x + offset.x,
                         y + offset.y,
                         1, 1);
      }
    });
  });
}

function merge(arena, player){
  //this function merges the matrices for the arena and the current piece
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0){
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

//creates the matrix representing the gameplay area
const arena = createMatrix(12, 20);
const player = {
  pos: {x: 5, y: 5},
  matrix: matrix,
};

//this function causes the pieces to drop
function playerDrop(){
  player.pos.y++;
  if (collide(arena, player)){
    player.pos.y--;
    merge(arena, player);
    player.pos.y = 0;
  }
  dropCounter = 0;
}

function playerMove(direction){
  player.pos.x += direction; //moves piece
  if (collide(arena, player)){
    player.pos.x -= direction; //keeps piece inside arena bounds
  }
}

/*rotates the piece and checks for collision with walls
if collision it offsets the piece away from walls until
no more collision*/
function playerRotate(direction){
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, direction);
  //tries offsetting the piece until it doesn't see a collision
  while (collide(arena, player)){
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    /*if piece has been offset more than the length
    of arena, reset piece back to original position
    because it doesn't make sense*/
    if (offset > player.matrix[0].length){
      rotate(player.matrix, -direction);
      player.pos.x = pos;
      return;
    }
  }
}

//rotates the given matrix the given direction
function rotate(matrix, direction){
  for (let y = 0; y < matrix.length; ++y){
    for (let x = 0; x < y; ++x){
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
        matrix[y][x],
        matrix[x][y],
      ];
    }
  }
  if (direction > 0){
    matrix.forEach(row => row.reverse());
  }
  else{
    matrix.reverse();
  }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0){
  const deltaTime = time -lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval){
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

//this handles events created by key preses
document.addEventListener('keydown', event => {
  if (event.keyCode === 37){

    playerMove(-1);
  }
  else if (event.keyCode === 39){
    //player presses right arrow key
    playerMove(1);
  }
  else if (event.keyCode === 40){
    //player presses down arrow key
    playerDrop();
  }
  else if (event.keyCode === 81){
    //player presses q to rotate left
    playerRotate(-1);
  }
  else if (event.keyCode === 87){
    //player presses w to rotate right
    playerRotate(1);
  }
});

update();
