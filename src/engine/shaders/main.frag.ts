// 프래그먼트 셰이더(Fragment Shader)
// 역할: 화면에 그려질 "픽셀 하나하나"의 최종 색을 결정합니다.
// 기본 보정(노출/대비/채도/색온도) → 톤 분리·색조 보정 → 필름 질감(그레인/할레이션/블룸/비네팅/샤픈)
// → 원본과 얼마나 섞을지(필터 강도) 순서로 계산합니다.
export const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

// 정점 셰이더에서 보간되어 넘어온 텍스처 좌표 (이 픽셀이 사진의 어느 지점인지)
in vec2 v_texCoord;

// JS(renderer.ts)에서 넘겨준 사진 텍스처
uniform sampler2D u_image;
// 텍스처 픽셀 1개의 크기 (1/캔버스 가로, 1/캔버스 세로). 그레인/할레이션/샤픈에서
// "옆 픽셀"을 샘플링할 때 좌표를 얼마나 옮길지 계산하는 데 씁니다.
uniform vec2 u_texelSize;

// ── 기본 보정 ──
uniform float u_exposure;    // 노출 (EV), -2 ~ +2
uniform float u_contrast;    // 대비, -50 ~ +50
uniform float u_saturation;  // 채도, -100 ~ +50
uniform float u_temperature; // 색온도, -100(차갑게) ~ +100(따뜻하게)

// ── 고급 - 색 ──
uniform float u_tint;        // 색조, 초록(-) ↔ 마젠타(+)
uniform float u_vibrance;    // 활력 (이미 진한 색은 덜 건드리는 채도)
uniform float u_highlights;  // 밝은 영역 보정
uniform float u_shadows;     // 어두운 영역 보정
uniform float u_blackLevel;  // 검정을 들어올리는 정도 (0~30)
uniform vec3  u_splitHighlightColor;
uniform float u_splitHighlightAmount;
uniform vec3  u_splitShadowColor;
uniform float u_splitShadowAmount;

// ── 고급 - 필름 질감 ──
uniform float u_grainAmount;      // 그레인 양 (0~100)
uniform float u_grainSize;        // 그레인 입자 크기 (px)
uniform float u_halationThreshold;// 할레이션이 시작되는 밝기 (0~1)
uniform float u_halationRadius;   // 할레이션 번짐 반경 (px)
uniform vec3  u_halationColor;
uniform float u_halationAmount;   // 할레이션 강도 (0~100)
uniform float u_bloomAmount;      // 블룸 강도 (0~100)
uniform float u_vignetteAmount;   // 비네팅 강도 (0~100)
uniform float u_sharpenAmount;    // 선명도 (0~100)

// ── 미리보기 제어 ──
uniform float u_intensity;    // 필터 전체 강도 (0~1). 0이면 원본, 1이면 완성된 보정.
uniform float u_showOriginal; // 1이면 원본을 그대로 보여줌 (길게 눌러 비교하기)

out vec4 outColor;

// 의사 난수: 좌표를 넣으면 0~1 사이의 불규칙한 값을 돌려줍니다. (그레인용)
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 반경(px) 안쪽을 두 겹의 원(안쪽 링 + 바깥쪽 링)으로 샘플링해 평균 색을 구합니다.
// 진짜 가우시안 블러보다는 거칠지만, 한 번의 렌더 패스 안에서 저렴하게
// "부드럽게 번진" 색을 얻기 위한 근사치입니다. (할레이션/블룸에 사용)
// 링을 하나만 쓰면 threshold 부근에서 값이 뚝 끊겨 보이므로, 중심 픽셀 + 안쪽 링 + 바깥쪽 링을
// 함께 섞어서 중심에서 멀어질수록 자연스럽게 옅어지게 만듭니다.
vec3 sampleGlow(vec2 uv, float radiusPx) {
  vec3 sum = texture(u_image, uv).rgb * 2.0;
  float totalWeight = 2.0;

  const int SAMPLES_PER_RING = 8;
  for (int ring = 1; ring <= 2; ring++) {
    float ringRadius = radiusPx * (float(ring) / 2.0);
    for (int i = 0; i < SAMPLES_PER_RING; i++) {
      float angle = 6.28318530718 * float(i) / float(SAMPLES_PER_RING);
      vec2 offset = vec2(cos(angle), sin(angle)) * u_texelSize * ringRadius;
      sum += texture(u_image, uv + offset).rgb;
      totalWeight += 1.0;
    }
  }

  return sum / totalWeight;
}

// 반경 안의 점들을 둘러보면서, threshold보다 밝은 정도("초과분")만 모아 평균을 냅니다.
// "전체를 블러한 뒤 밝은지 확인"하면 배경이 threshold 근처일 때 화면 전체가 물드는 문제가 생기므로,
// 먼저 각 샘플에서 밝은 부분만 뽑아낸 다음 그것들을 평균 내는 순서로 계산합니다. (할레이션 전용)
float sampleBrightExcess(vec2 uv, float radiusPx, float threshold) {
  float sum = 0.0;
  float totalWeight = 0.0;
  const int SAMPLES_PER_RING = 8;
  for (int ring = 1; ring <= 3; ring++) {
    float ringRadius = radiusPx * (float(ring) / 3.0);
    for (int i = 0; i < SAMPLES_PER_RING; i++) {
      float angle = 6.28318530718 * float(i) / float(SAMPLES_PER_RING);
      vec2 offset = vec2(cos(angle), sin(angle)) * u_texelSize * ringRadius;
      vec3 s = texture(u_image, uv + offset).rgb;
      float sLum = dot(s, vec3(0.299, 0.587, 0.114));
      sum += max(sLum - threshold, 0.0);
      totalWeight += 1.0;
    }
  }
  return sum / totalWeight;
}

void main() {
  vec4 texel = texture(u_image, v_texCoord);

  // 길게 눌러 원본과 비교하는 중이면, 나머지 계산 없이 원본을 바로 출력합니다.
  if (u_showOriginal > 0.5) {
    outColor = texel;
    return;
  }

  vec3 color = texel.rgb;

  // 1) 색온도: 빨강을 올리고 파랑을 내리면 따뜻하게, 반대로 하면 차갑게 보입니다.
  float tempShift = u_temperature / 100.0 * 0.1;
  color.r += tempShift;
  color.b -= tempShift;

  // 2) 색조: 초록 ↔ 마젠타 축으로 살짝 이동시킵니다.
  float tintShift = u_tint / 100.0;
  color.g -= tintShift * 0.04;
  color.r += tintShift * 0.02;
  color.b += tintShift * 0.02;

  // 3) 노출: EV 스톱만큼 밝기를 2의 거듭제곱으로 곱합니다. (+1EV = 2배 밝게)
  color *= exp2(u_exposure);

  // 4) 하이라이트 / 섀도우: 밝기(명도)에 따라 밝은 영역과 어두운 영역을 따로 보정합니다.
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  float highlightMask = smoothstep(0.5, 1.0, lum);
  float shadowMask = smoothstep(0.5, 0.0, lum);
  color += (u_highlights / 100.0) * highlightMask * 0.3;
  color += (u_shadows / 100.0) * shadowMask * 0.3;

  // 5) 대비: 중간 회색(0.5)을 기준점으로 삼아 색을 밀어내거나(대비 ↑) 모읍니다(대비 ↓).
  float contrastFactor = 1.0 + u_contrast / 100.0;
  color = (color - 0.5) * contrastFactor + 0.5;

  // 6) 블랙 레벨: 검정(0)을 완전히 검지 않게 들어올립니다. 흰색(1)은 그대로 유지됩니다.
  float lift = u_blackLevel / 100.0;
  color = color * (1.0 - lift) + lift;

  // 7) 활력(Vibrance): 이미 채도가 높은 색은 적게, 흐린 색은 많이 끌어올립니다. (피부색 보호)
  float maxC = max(color.r, max(color.g, color.b));
  float minC = min(color.r, min(color.g, color.b));
  float currentSat = maxC - minC;
  float vibranceFactor = (u_vibrance / 100.0) * (1.0 - currentSat);
  float lumForVibrance = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(lumForVibrance), color, 1.0 + vibranceFactor);

  // 8) 채도: 흑백(명도)과 원래 색 사이를 보간합니다. factor가 0이면 흑백, 1이면 원본 색.
  float lumForSat = dot(color, vec3(0.299, 0.587, 0.114));
  float saturationFactor = 1.0 + u_saturation / 100.0;
  color = mix(vec3(lumForSat), color, saturationFactor);

  // 9) 스플릿 토닝: 밝은 영역엔 하이라이트 색을, 어두운 영역엔 섀도우 색을 살짝 섞습니다.
  float lumForSplit = dot(color, vec3(0.299, 0.587, 0.114));
  float splitHiMask = smoothstep(0.55, 1.0, lumForSplit);
  float splitLoMask = smoothstep(0.45, 0.0, lumForSplit);
  color += (u_splitHighlightColor - 0.5) * 2.0 * u_splitHighlightAmount * splitHiMask;
  color += (u_splitShadowColor - 0.5) * 2.0 * u_splitShadowAmount * splitLoMask;

  // 10) 그레인: 픽셀 좌표 기반 노이즈를 더해 필름 입자 느낌을 냅니다.
  vec2 grainCoord = gl_FragCoord.xy / max(u_grainSize, 0.1);
  float grain = hash(grainCoord) - 0.5;
  color += grain * (u_grainAmount / 100.0) * 0.25;

  // 11) 할레이션: 밝은 부분 주변에 붉은빛 번짐을 더합니다. (역광 필름 특유의 효과)
  // 슬라이더의 halationRadius(px)는 "체감 반경"으로 쓰기엔 너무 작아서, 여기서 몇 배 넓혀
  // 실제 사진 해상도에서도 눈에 보이는 번짐이 되도록 합니다.
  // threshold보다 밝은 픽셀들의 "초과분"만 모아서 번지게 하므로, 중간 밝기의 넓은 배경(하늘,
  // 벽 등)이 통째로 물드는 일 없이 진짜 밝은 지점 주변에서만 자연스럽게 번집니다.
  float brightExcess = sampleBrightExcess(v_texCoord, u_halationRadius * 4.0, u_halationThreshold);
  color += u_halationColor * brightExcess * (u_halationAmount / 100.0) * 4.0;

  // 12) 블룸/소프트 포커스: 전체적으로 은은하게 번진 빛을 더합니다.
  vec3 glowForBloom = sampleGlow(v_texCoord, 10.0);
  color += glowForBloom * (u_bloomAmount / 100.0) * 0.3;

  // 13) 비네팅: 가장자리로 갈수록 어둡게 만듭니다.
  vec2 centered = v_texCoord - 0.5;
  float distFromCenter = length(centered) * 1.4142;
  float vignetteFactor = 1.0 - smoothstep(0.3, 1.0, distFromCenter) * (u_vignetteAmount / 100.0);
  color *= vignetteFactor;

  // 14) 선명도: 원본 텍스처에서 주변 픽셀과의 차이(경계)를 살짝 더해 또렷하게 만듭니다.
  vec3 up = texture(u_image, v_texCoord + vec2(0.0, u_texelSize.y)).rgb;
  vec3 down = texture(u_image, v_texCoord - vec2(0.0, u_texelSize.y)).rgb;
  vec3 left = texture(u_image, v_texCoord - vec2(u_texelSize.x, 0.0)).rgb;
  vec3 right = texture(u_image, v_texCoord + vec2(u_texelSize.x, 0.0)).rgb;
  vec3 neighborAvg = (up + down + left + right) / 4.0;
  vec3 edge = texel.rgb - neighborAvg;
  color += edge * (u_sharpenAmount / 100.0) * 1.5;

  // 계산 중 0~1 범위를 벗어난 값은 화면에 그대로 못 보내므로 잘라냅니다.
  color = clamp(color, 0.0, 1.0);

  // 필터 강도: 0%면 원본, 100%면 위에서 계산한 보정을 그대로 적용합니다.
  color = mix(texel.rgb, color, u_intensity);

  outColor = vec4(color, texel.a);
}
`
