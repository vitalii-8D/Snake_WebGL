const loadTextResource = (url) => new Promise(((resolve, reject) => {
   let request = new XMLHttpRequest();
   request.open('GET', url, true);

   request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
         resolve(request.responseText)
      }
      reject(`Error: HTTP status - ${request.status} on resource ${url}`)
   }

   request.send()
}))

const createShader = (gl, type, source) => {
   let shader = gl.createShader(type)
   gl.shaderSource(shader, source)
   gl.compileShader(shader)

   const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
   if (!success) {
      alert('Error compile shader!')
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader)
      return false;
   }

   return shader;
}

const createProgram = (gl, vertexShader, fragmentShader) => {
   let program = gl.createProgram()

   gl.attachShader(program, vertexShader)
   gl.attachShader(program, fragmentShader)

   gl.linkProgram(program)
   gl.validateProgram(program)

   const success = gl.getProgramParameter(program, gl.VALIDATE_STATUS)
   if (!success) {
      console.error('Error validate program', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return false;
   }
   gl.useProgram(program)

   return program;
}
