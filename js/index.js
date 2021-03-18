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

let canvas, gl, program;

const StartWebGL = (vertexShaderText, fragmentShaderText) => {
   canvas = document.getElementById('canvas')
   gl = canvas.getContext('webgl');

   if (!gl) {
      alert('Your browser does not support WebGL')
      return false;
   }

   canvas.width = gl.canvas.clientWidth;
   canvas.height = gl.canvas.clientHeight;
   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

   let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
   let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

   program = createProgram(gl, vertexShader, fragmentShader);

   let u_Pmatrix = gl.getUniformLocation(program, 'u_Pmatrix');
   let u_Vmatrix = gl.getUniformLocation(program, 'u_Vmatrix');
   let u_Mmatrix = gl.getUniformLocation(program, 'u_Mmatrix');

   let a_Position = gl.getAttribLocation(program, a_Position);
   let a_Color = gl.getAttribLocation(program, a_Color);

   gl.enableVertexAttribArray(a_Position)
   gl.enableVertexAttribArray(a_Color)
}



document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
}, {once: true})
