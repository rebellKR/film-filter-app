// 프래그먼트 셰이더(Fragment Shader)
// 역할: 화면에 그려질 "픽셀 하나하나"의 최종 색을 결정합니다.
// Phase 1에서는 노출/대비/채도/색온도, 이렇게 기본 보정 4가지만 계산합니다.
// 나중에 LUT, 그레인, 비네팅 등을 여기 안에 이어서 추가하게 됩니다.
export const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

// 정점 셰이더에서 보간되어 넘어온 텍스처 좌표 (이 픽셀이 사진의 어느 지점인지)
in vec2 v_texCoord;

// JS(renderer.ts)에서 넘겨준 사진 텍스처
uniform sampler2D u_image;

// 슬라이더 값 (JS에서 매 프레임 넘겨줌)
uniform float u_exposure;    // 노출 (EV), -2 ~ +2
uniform float u_contrast;    // 대비, -50 ~ +50
uniform float u_saturation;  // 채도, -100 ~ +50
uniform float u_temperature; // 색온도, -100(차갑게) ~ +100(따뜻하게)

// 이 픽셀의 최종 출력 색 (r, g, b, a)
out vec4 outColor;

void main() {
  vec4 texel = texture(u_image, v_texCoord);
  vec3 color = texel.rgb;

  // 1) 색온도: 빨강을 올리고 파랑을 내리면 따뜻하게, 반대로 하면 차갑게 보입니다.
  float tempShift = u_temperature / 100.0 * 0.1;
  color.r += tempShift;
  color.b -= tempShift;

  // 2) 노출: EV 스톱만큼 밝기를 2의 거듭제곱으로 곱합니다. (+1EV = 2배 밝게)
  color *= exp2(u_exposure);

  // 3) 대비: 중간 회색(0.5)을 기준점으로 삼아 색을 밀어내거나(대비 ↑) 모읍니다(대비 ↓).
  float contrastFactor = 1.0 + u_contrast / 100.0;
  color = (color - 0.5) * contrastFactor + 0.5;

  // 4) 채도: 흑백(명도)과 원래 색 사이를 보간합니다. factor가 0이면 흑백, 1이면 원본 색.
  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  float saturationFactor = 1.0 + u_saturation / 100.0;
  color = mix(vec3(luminance), color, saturationFactor);

  // 계산 중 0~1 범위를 벗어난 값은 화면에 그대로 못 보내므로 잘라냅니다.
  outColor = vec4(clamp(color, 0.0, 1.0), texel.a);
}
`
