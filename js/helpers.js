function resize(e) {
   const windowWidth = document.documentElement.clientWidth;
   const windowHeight = document.documentElement.clientHeight;
   const sideSize = windowWidth < windowHeight ? windowWidth : windowHeight;
   canvas.width = canvas.height = sideSize;
}

function render() {
   context.drawImage(
      gl.canvas,
      0, 0, gl.canvas.width, gl.canvas.height,
      0, 0, canvas.width, canvas.height)
}

function swapSnake(snake) {
   // if(snake.length==0){snake.push([0,0]);}

   for (let i = snake.length - 1; i > 0; i--) {
      let a = snake[i - 1][0];
      let b = snake[i - 1][1];

      snake[i][0] = a;
      snake[i][1] = b;
   }

   return snake;
}

function snakeController(gl, snakePosition, goRun) {
   if (goRun == 8) {
      snakePosition.y = snakePosition.y + 1;
      if (snakePosition.y >= (gl.grid.grid_y)) {
         snakePosition.y = 0.0;
      }

   } else if (goRun == 2) {
      snakePosition.y = snakePosition.y - 1;
      if (snakePosition.y < 0) {
         snakePosition.y = gl.grid.grid_y - 1;
      }

   } else if (goRun == 4) {
      snakePosition.x = snakePosition.x - 1;
      if (snakePosition.x < 0) {
         snakePosition.x = gl.grid.grid_x - 1;
      }

   } else if (goRun == 6) {
      snakePosition.x = snakePosition.x + 1;
      if (snakePosition.x >= gl.grid.grid_x) {
         snakePosition.x = 0;
      }
   }

   return snakePosition;
}

function updateGame(e) {
   let grid_x = document.getElementById('Grid_X')
   let grid_y = document.getElementById('Grid_Y')

   grid_x = grid_x > 30 ? 30 : grid_x < 3 ? grid_x = 3 : grid_x
   grid_y = grid_y > 30 ? 30 : grid_y < 3 ? grid_y = 3 : grid_y

   bufferUpdate(this.gl, gridBuild());
   matrixUpdate(this.gl);
}

function gridBuild() {
   let cellSize = 2; // Изменение не работает

   let grid_x = parseFloat(document.getElementById('Grid_X').value)
   let grid_y = parseFloat(document.getElementById('Grid_Y').value)

   grid_x = (grid_x > 30) ? 30 : grid_x
   grid_y = (grid_y > 30) ? 30 : grid_y

   let grid = {
      grid_vertex: null,
      grid_face: null
   }

   let grid_vertex = []
   for (let i = 0; i <= (cellSize * grid_x); i += cellSize) {
      grid_vertex.push(i, 0, 0)
      grid_vertex.push(i, cellSize * grid_y, 0)
   }
   for (let i = 0; i <= (cellSize * grid_y); i += cellSize) {
      grid_vertex.push(0, i, 0)
      grid_vertex.push(cellSize * grid_x, i, 0)
   }

   let grid_face = []
   for (let i = 0; i < ((grid_x + 1) * (grid_y + 1)); i++) {
      grid_face.push(i)
   }

   grid.grid_x = grid_x
   grid.grid_y = grid_y
   grid.grid_vertex = grid_vertex
   grid.grid_face = grid_face
   grid.grid_count = grid_vertex.length / 3

   console.log(grid);

   return grid;

}

function matrixUpdate(gl) {
   let PROJMATRIX = mat4.perspective(40, gl.canvas.width / gl.canvas.height, 1, 200)
   let MODELMATRIX_SNAKE = mat4.create()
   let MODELMATRIX_GRID = mat4.create()
   let VIEWMATRIX = mat4.create()

   mat4.identity(MODELMATRIX_SNAKE)
   mat4.identity(MODELMATRIX_GRID)
   mat4.identity(VIEWMATRIX)

   mat4.rotateX(MODELMATRIX_SNAKE, 0)
   mat4.rotateX(MODELMATRIX_GRID, 0)

   let gridsize = (gl.grid.grid_x > gl.grid.grid_y) ? gl.grid.grid_x : gl.grid.grid_y
   // mat4.lookAt([gl.grid.grid_x, -20.0, gridsize * 3.0], [gl.grid.grid_x, gl.grid.grid_y, 0.0], [0.0, 1.0, 0.0], VIEWMATRIX)
   mat4.lookAt([0.0, -10, gridsize * 3.0], [gl.grid.grid_x, gl.grid.grid_y, 0.0], [0.0, 1.0, 0.0], VIEWMATRIX)

   gl.PROJMATRIX = PROJMATRIX
   gl.MODELMATRIX_SNAKE = MODELMATRIX_SNAKE
   gl.MODELMATRIX_GRID = MODELMATRIX_GRID
   gl.VIEWMATRIX = VIEWMATRIX
}

function bufferUpdate(gl, grid) {
   gl.GRID_VERTEX = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER, gl.GRID_VERTEX)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(grid.grid_vertex), gl.STATIC_DRAW)

   gl.GRID_FACES = gl.createBuffer()
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.GRID_FACES)
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(grid.grid_face), gl.STATIC_DRAW)

   gl.grid = grid;
}

function eatApple(gl, snake, apple) {
   let xSnake = Math.round(snake[0][0])
   let xApple = Math.round(apple.positionX)
   let ySnake = Math.round(snake[0][1])
   let yApple = Math.round(apple.positionY)

   apple.eat = false

   if ((xSnake == xApple) && (ySnake == yApple)) {
      let X, Y;
      do {
         X = Math.floor(Math.random() * gl.grid.grid_x)
         Y = Math.floor(Math.random() * gl.grid.grid_y)
      } while (snake.some(cord => cord[0] === X && cord[1] === Y))
      apple.positionX = X
      apple.positionY = Y

      apple.eat = true
   }

   return apple;
}
