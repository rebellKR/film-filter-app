// 정점 셰이더(Vertex Shader)
// 역할: 화면에 그릴 사각형의 네 꼭짓점 위치를 정하고,
//       각 꼭짓점이 텍스처(사진)의 어느 좌표에 대응하는지를 프래그먼트 셰이더로 넘겨줍니다.
// GPU는 여기서 넘긴 4개 정점 "사이"의 값을 자동으로 보간(gradient)해서
// 프래그먼트 셰이더의 v_texCoord로 전달합니다.
export const VERTEX_SHADER_SOURCE = `#version 300 es

// JS(renderer.ts)에서 정점 버퍼로 넘겨준 화면 좌표 (-1 ~ 1 범위, WebGL 표준 좌표계)
in vec2 a_position;
// JS에서 넘겨준 텍스처 좌표 (0 ~ 1 범위, 이미지의 어느 지점인지)
in vec2 a_texCoord;

// 다음 단계인 프래그먼트 셰이더로 전달할 값
out vec2 v_texCoord;

void main() {
  // gl_Position: 이 꼭짓점이 화면의 어디에 위치할지 알려주는 필수 내장 변수입니다.
  // z를 0, w를 1로 고정해 2D 평면 위에 그리는 것과 동일하게 만듭니다.
  gl_Position = vec4(a_position, 0.0, 1.0);

  // 텍스처 좌표는 그대로 다음 단계로 전달만 합니다.
  v_texCoord = a_texCoord;
}
`
