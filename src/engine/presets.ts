import { DEFAULT_FILTER_PARAMS, type FilterParams } from './params'

export interface Preset {
  id: string
  name: string
  params: FilterParams
}

// 아무 효과도 적용하지 않는 상태로 되돌리는 프리셋
const ORIGINAL_PARAMS: FilterParams = DEFAULT_FILTER_PARAMS

// 「나는 내일, 어제의 너와 만난다」의 인상: 자연광, 낮은 대비, 파스텔,
// 따뜻한 하이라이트와 서늘한 그림자의 대비, 미세한 입자.
// 아래 수치는 시작점이며 이후 눈으로 보며 조정합니다.
const TOMORROW_PARAMS: FilterParams = {
  exposure: 0.1,
  contrast: -8,
  saturation: -12,
  temperature: 6,
  tint: 3,
  vibrance: 8,
  highlights: -15,
  shadows: 20,
  blackLevel: 8,
  splitToneHighlight: { color: '#FFE9C9', amount: 0.08 },
  splitToneShadow: { color: '#7FA9B0', amount: 0.12 },
  grainAmount: 12,
  grainSize: 1.2,
  halationThreshold: 0.78,
  halationRadius: 6,
  halationColor: '#FF6A4D',
  halationAmount: 20,
  bloomAmount: 6,
  vignetteAmount: 12,
  sharpenAmount: 15,
}

export const PRESETS: Preset[] = [
  { id: 'original', name: '원본', params: ORIGINAL_PARAMS },
  { id: 'tomorrow', name: '내일의 너', params: TOMORROW_PARAMS },
]
