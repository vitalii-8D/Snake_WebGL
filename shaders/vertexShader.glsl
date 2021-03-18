attribute vec3 a_Position;
attribute vec3 a_Color;

uniform mat4 u_Pmatrix;
uniform mat4 u_Vmatrix;
uniform mat4 u_Mmatrix;

varying vec3 v_Color;

void main() {
    v_Color = a_Color;
    gl_Position = u_Pmatrix * u_Vmatrix * u_Mmatrix * vec4(a_Position, 1.0);
}
