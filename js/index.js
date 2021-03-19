const InitWebGL = () => {
   let VSText, FSText;
   loadTextResource('shaders/vertexShader.glsl')
      .then(result => {
         VSText = result;
         return loadTextResource('shaders/fragmentShader.glsl')
      })
      .then(result => {
         FSText = result;
         return StartWebGL(VSText, FSText)
      })
      .catch(err => {
         alert('Error with loading resources. See console for details!')
         console.log(err);
      })
}

let canvas, context, bufferGL, gl, program, requestAnimation;
let goRun = 8;
// let snakeBody = [0, 0];
let snake = [];
snake.push([0, 0]);
snake.push([0, 2]);
snake.push([0, 4]);
let apple = {
   positionX: 0.0,
   positionY: 0.0
}

const StartWebGL = (vertexShaderText, fragmentShaderText) => {

   canvas = document.getElementById('canvas');
   context = canvas.getContext('2d');

   bufferGL = document.createElement('canvas');
   gl = bufferGL.getContext('webgl');

   let button = document.getElementById('update')

   if (!gl) {
      alert('Your browser does not support WebGL')
      return false;
   }


   bufferGL.width = 600
   bufferGL.height = 600
   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

   resize();

   let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
   let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

   program = createProgram(gl, vertexShader, fragmentShader);

   let u_Pmatrix = gl.getUniformLocation(program, 'u_Pmatrix');
   let u_Vmatrix = gl.getUniformLocation(program, 'u_Vmatrix');
   let u_Mmatrix = gl.getUniformLocation(program, 'u_Mmatrix');
   let u_Color = gl.getUniformLocation(program, 'u_Color');

   let a_Position = gl.getAttribLocation(program, 'a_Position');

   gl.enableVertexAttribArray(a_Position)

   let triangle_vertex = [
      -0, -0, -0, 1, 1, 0,
      2, -0, -0, 1, 1, 0,
      2, 2, -0, 1, 1, 0,
      -0, 2, -0, 1, 1, 0,

      -0, -0, 2, 0, 0, 1,
      2, -0, 2, 0, 0, 1,
      2, 2, 2, 0, 0, 1,
      -0, 2, 2, 0, 0, 1,

      0, 0, 0, 0, 1, 1,
      0, 2, 0, 0, 1, 1,
      0, 2, 2, 0, 1, 1,
      0, 0, 2, 0, 1, 1,

      2, -0, -0, 1, 0, 0,
      2, 2, -0, 1, 0, 0,
      2, 2, 2, 1, 0, 0,
      2, -0, 2, 1, 0, 0,

      -0, -0, -0, 1, 0, 1,
      -0, -0, 2, 1, 0, 1,
      2, -0, 2, 1, 0, 1,
      2, -0, -0, 1, 0, 1,

      -0, 2, -0, 0, 1, 0,
      -0, 2, 2, 0, 1, 0,
      2, 2, 2, 0, 1, 0,
      2, 2, -0, 0, 1, 0
   ];

   let TRIANGLE_VERTEX = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW)

   let triangle_face = [
      0, 1, 2,
      0, 2, 3,

      4, 5, 6,
      4, 6, 7,

      8, 9, 10,
      8, 10, 11,

      12, 13, 14,
      12, 14, 15,

      16, 17, 18,
      16, 18, 19,

      20, 21, 22,
      20, 22, 23,
   ];

   let TRIANGLE_FACES = gl.createBuffer()
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_face), gl.STATIC_DRAW)


   // ---  Build Game Grid   ---
   let grid = gridBuild()
   //----------------
   bufferUpdate(gl, grid)
   matrixUpdate(gl)

   // --- RENDER ----------
   gl.enable(gl.DEPTH_TEST);
   gl.depthFunc(gl.LEQUAL);
   gl.clearDepth(1.0);

   let old_time = 0;
   let speed = 100;
   let dt = 0;
   let snakePosition = {
      x: 0.0,
      y: 0.0
   };

   let animate = function (time) {
      dt = time - old_time;
      requestAnimation = window.requestAnimationFrame(animate)

      if (Math.abs(dt) >= speed) {
         swapSnake(snake)
         snakePosition = snakeController(gl, snakePosition, goRun)

         snake[0][0] = snakePosition.x
         snake[0][1] = snakePosition.y

         for (let i = 1; i < snake.length; i++) {
            if (snake[0][0] == snake[i][0] && snake[0][1] == snake[i][1]) {
               window.cancelAnimationFrame(requestAnimation)
            }
         }

         old_time = time;
      }

      draw(gl)
      render();

   }


   function draw(gl) {
      gl.clearColor(0.7, 0.7, 0.7, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      gl.uniformMatrix4fv(u_Pmatrix, false, gl.PROJMATRIX)
      gl.uniformMatrix4fv(u_Vmatrix, false, gl.VIEWMATRIX)

      // Draw tail
      for (let i = 0; i < snake.length; i++) {
         gl.uniform3f(u_Color, 0.0, 0.0, 1.0)

         mat4.identity(gl.MODELMATRIX_SNAKE)
         mat4.translate(gl.MODELMATRIX_SNAKE, [snake[i][0] * 2, snake[i][1] * 2, 0.0])

         if (!i) {
            gl.uniform3f(u_Color, 1.0, 1.0, 0.0)
            mat4.translate(gl.MODELMATRIX_SNAKE, [0.0, 0.0, 0.001])
         }

         gl.uniformMatrix4fv(u_Mmatrix, false, gl.MODELMATRIX_SNAKE)

         gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)
         gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * 6, 0)

         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
         gl.drawElements(gl.TRIANGLES, triangle_face.length, gl.UNSIGNED_SHORT, 0)
         gl.uniform3f(u_Color, 0.9, 0.5, 0.0)
         gl.drawElements(gl.LINES, triangle_face.length, gl.UNSIGNED_SHORT, 0)
      }

      apple = eatApple(gl, snake, apple)
      if (apple.eat) {
         snake.push([apple.positionX, apple.positionY])
      }

      // Draw Apple
      gl.uniform3f(u_Color, 0.8, 0.0, 0.0)
      mat4.identity(gl.MODELMATRIX_SNAKE)
      mat4.translate(gl.MODELMATRIX_SNAKE, [apple.positionX * 2, apple.positionY * 2, 0.0])

      gl.uniformMatrix4fv(u_Mmatrix, false, gl.MODELMATRIX_SNAKE)

      gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * 6, 0)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
      gl.drawElements(gl.TRIANGLES, triangle_face.length, gl.UNSIGNED_SHORT, 0)
      gl.uniform3f(u_Color, 0.9, 0.5, 0.0)
      gl.drawElements(gl.LINES, triangle_face.length, gl.UNSIGNED_SHORT, 0)

      // ---   GRID  ---
      gl.uniformMatrix4fv(u_Mmatrix, false, gl.MODELMATRIX_GRID)
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.GRID_VERTEX)
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * 3, 0)

      gl.uniform3f(u_Color, 0.0, 1.0, 0.0)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.GRID_FACES)
      gl.drawElements(gl.LINES, gl.grid.grid_count, gl.UNSIGNED_SHORT, 0)

      gl.flush();
   }

   window.requestAnimationFrame(time => animate(time))


   window.addEventListener('resize', resize);
   document.addEventListener('keydown', keydownEvent, false);
   button.addEventListener('click', {handleEvent: updateGame, gl: gl}, false)
}

function keydownEvent(e) {

   if (e.keyCode == 38 && goRun != 2) {
      goRun = 8;
   } else if (e.keyCode == 40 && goRun != 8) {
      goRun = 2;
   } else if (e.keyCode == 37 && goRun != 6) {
      goRun = 4;
   } else if (e.keyCode == 39 && goRun != 4) {
      goRun = 6;
   } else return false;
}

document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
}, {once: true})
