// 색보정에 쓰이는 모든 파라미터의 타입과 기본값(=원본, 아무 효과 없음)입니다.
// "기본" 슬라이더(노출/대비/채도/색온도)는 App.tsx에서 직접 조절하고,
// 나머지("고급": 톤 분리, 스플릿 토닝, 필름 질감)는 지금 단계에서는 프리셋을 통해서만 설정됩니다.

// 스플릿 토닝 한쪽(하이라이트 또는 섀도우)의 색 + 강도
export interface SplitToneChannel {
  color: string // hex 색상, 예: '#FFE9C9'
  amount: number // 0 ~ 1 (얼마나 진하게 섞을지)
}

export interface FilterParams {
  // 기본
  exposure: number // 노출 (EV), -2 ~ +2
  contrast: number // 대비, -50 ~ +50
  saturation: number // 채도, -100 ~ +50
  temperature: number // 색온도, -100(차갑게) ~ +100(따뜻하게)

  // 고급 - 색
  tint: number // 색조, 초록(-) ↔ 마젠타(+), -100 ~ +100
  vibrance: number // 활력(자연스러운 채도), 이미 채도가 높은 색은 덜 건드림, -100 ~ +100
  highlights: number // 밝은 영역만 보정, -100 ~ +100
  shadows: number // 어두운 영역만 보정, -100 ~ +100
  blackLevel: number // 검정을 얼마나 들어올릴지(흐린 검정), 0 ~ 30
  splitToneHighlight: SplitToneChannel
  splitToneShadow: SplitToneChannel

  // 고급 - 필름 질감
  grainAmount: number // 그레인(입자) 양, 0 ~ 100
  grainSize: number // 그레인 입자 크기(px), 0.5 ~ 3
  halationThreshold: number // 할레이션이 시작되는 밝기 기준, 0 ~ 1
  halationRadius: number // 할레이션 번짐 반경(px), 0 ~ 20
  halationColor: string // 할레이션 색(주로 붉은빛), hex
  halationAmount: number // 할레이션 강도, 0 ~ 100
  bloomAmount: number // 블룸/소프트포커스 강도, 0 ~ 100
  vignetteAmount: number // 비네팅(가장자리 어둡게) 강도, 0 ~ 100
  sharpenAmount: number // 선명도, 0 ~ 100
}

export const DEFAULT_FILTER_PARAMS: FilterParams = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,

  tint: 0,
  vibrance: 0,
  highlights: 0,
  shadows: 0,
  blackLevel: 0,
  splitToneHighlight: { color: '#000000', amount: 0 },
  splitToneShadow: { color: '#000000', amount: 0 },

  grainAmount: 0,
  grainSize: 1,
  halationThreshold: 0.8,
  halationRadius: 4,
  halationColor: '#FF6A4D',
  halationAmount: 0,
  bloomAmount: 0,
  vignetteAmount: 0,
  sharpenAmount: 0,
}
