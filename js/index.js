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

let canvas, context, bufferGL, gl, program;

const StartWebGL = (vertexShaderText, fragmentShaderText) => {
   // canvas = document.getElementById('canvas')
   // gl = canvas.getContext('webgl');
   canvas = document.getElementById('canvas');
   context = canvas.getContext('2d');

   bufferGL = document.createElement('canvas');
   gl = bufferGL.getContext('webgl');

   if (!gl) {
      alert('Your browser does not support WebGL')
      return false;
   }

   bufferGL.width = 500
   bufferGL.height = 500
   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

   resize();

   let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
   let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

   program = createProgram(gl, vertexShader, fragmentShader);

   let u_Pmatrix = gl.getUniformLocation(program, 'u_Pmatrix');
   let u_Vmatrix = gl.getUniformLocation(program, 'u_Vmatrix');
   let u_Mmatrix = gl.getUniformLocation(program, 'u_Mmatrix');

   let a_Position = gl.getAttribLocation(program, 'a_Position');
   let a_Color = gl.getAttribLocation(program, 'a_Color');

   gl.enableVertexAttribArray(a_Position)
   gl.enableVertexAttribArray(a_Color)

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

   // ---  create MATRIX ---------

   let PROJMATRIX = mat4.perspective(40, canvas.width / canvas.height, 1, 100)
   let VIEWMATRIX = mat4.create();
   let MODELMATRIX = mat4.create();

   mat4.identity(VIEWMATRIX);
   mat4.identity(MODELMATRIX);
   mat4.rotateX(MODELMATRIX, 0);
   mat4.lookAt([0.0, 0.0, 10.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], VIEWMATRIX)


   // --- RENDER ----------

   gl.enable(gl.DEPTH_TEST);
   gl.depthFunc(gl.LEQUAL);
   gl.clearDepth(1.0);

   let old_time = 0;

   let animate = function (time) {
      let dt = time - old_time;
      old_time = time;

      mat4.rotateX(MODELMATRIX, 0.00015 * dt);
      mat4.rotateY(MODELMATRIX, 0.00015 * dt);
      mat4.rotateZ(MODELMATRIX, 0.00015 * dt);

      gl.clearColor(0.7, 0.7, 0.7, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX)
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX)
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX)

      gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)

      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * 6, 0)
      gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 4 * 6, 3 * 4)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
      gl.drawElements(gl.TRIANGLES, triangle_face.length, gl.UNSIGNED_SHORT, 0)

      gl.flush();


      render();
      window.requestAnimationFrame(animate)
   }

   window.requestAnimationFrame(time => animate(time))
}

window.addEventListener('resize', resize);

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

document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
}, {once: true})
