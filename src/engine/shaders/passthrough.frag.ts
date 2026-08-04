// 프래그먼트 셰이더(Fragment Shader)
// 역할: 화면에 그려질 "픽셀 하나하나"의 최종 색을 결정합니다.
// 지금 단계(Phase 1)에서는 색 보정을 하지 않고, 사진 텍스처의 색을 그대로 출력합니다.
// 나중에 필름 프리셋(LUT, 그레인, 비네팅 등)을 여기 안에서 계산하게 됩니다.
export const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

// 정점 셰이더에서 보간되어 넘어온 텍스처 좌표 (이 픽셀이 사진의 어느 지점인지)
in vec2 v_texCoord;

// JS(renderer.ts)에서 넘겨준 사진 텍스처
uniform sampler2D u_image;

// 이 픽셀의 최종 출력 색 (r, g, b, a)
out vec4 outColor;

void main() {
  // texture(): 텍스처에서 v_texCoord 위치의 색을 읽어옵니다.
  // 지금은 아무 가공 없이 그대로 출력 = "원본 그대로 보여주기"
  outColor = texture(u_image, v_texCoord);
}
`
