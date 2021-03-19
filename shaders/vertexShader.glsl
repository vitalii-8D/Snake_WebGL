attribute vec3 a_Position;

uniform mat4 u_Pmatrix;
uniform mat4 u_Vmatrix;
uniform mat4 u_Mmatrix;
uniform vec3 u_Color;

varying vec3 v_Color;

void main() {
    v_Color = u_Color;
    gl_Position = u_Pmatrix * u_Vmatrix * u_Mmatrix * vec4(a_Position, 1.0);
}
