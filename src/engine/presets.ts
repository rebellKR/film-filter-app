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

// 아래 6종은 기획 문서의 "느낌" 설명(표)만 있고 정확한 수치는 없어서,
// tomorrow 프리셋과 같은 방식으로 직접 초기값을 잡았습니다. 실제 필름 스캔과
// 비교하며 눈으로 다시 조정해야 하는 시작점입니다.

// 포트라 400: 부드러운 살구빛 피부톤, 크리미한 계조
const PORTRA_PARAMS: FilterParams = {
  exposure: 0.05,
  contrast: -5,
  saturation: -5,
  temperature: 10,
  tint: 2,
  vibrance: 10,
  highlights: -10,
  shadows: 15,
  blackLevel: 5,
  splitToneHighlight: { color: '#FFE0C2', amount: 0.06 },
  splitToneShadow: { color: '#C9A98C', amount: 0.05 },
  grainAmount: 8,
  grainSize: 1.0,
  halationThreshold: 0.85,
  halationRadius: 4,
  halationColor: '#FF9466',
  halationAmount: 8,
  bloomAmount: 4,
  vignetteAmount: 8,
  sharpenAmount: 10,
}

// 수페리아 400: 그림자에 초록기, 일본 스냅 감성
const SUPERIA_PARAMS: FilterParams = {
  exposure: 0,
  contrast: 8,
  saturation: 8,
  temperature: -18,
  tint: -4,
  vibrance: 5,
  highlights: -5,
  shadows: 10,
  blackLevel: 4,
  splitToneHighlight: { color: '#FFF3D6', amount: 0.03 },
  splitToneShadow: { color: '#4A8A64', amount: 0.2 },
  grainAmount: 10,
  grainSize: 1.0,
  halationThreshold: 0.85,
  halationRadius: 3,
  halationColor: '#FF8A5C',
  halationAmount: 6,
  bloomAmount: 3,
  vignetteAmount: 8,
  sharpenAmount: 12,
}

// 골드 200: 노랗고 진한 따뜻함, 여름 오후
const GOLD_PARAMS: FilterParams = {
  exposure: 0.1,
  contrast: 8,
  saturation: 15,
  temperature: 25,
  tint: 4,
  vibrance: 10,
  highlights: -5,
  shadows: 5,
  blackLevel: 3,
  splitToneHighlight: { color: '#FFD98A', amount: 0.1 },
  splitToneShadow: { color: '#8A6A3C', amount: 0.06 },
  grainAmount: 10,
  grainSize: 1.1,
  halationThreshold: 0.8,
  halationRadius: 5,
  halationColor: '#FF7A3D',
  halationAmount: 12,
  bloomAmount: 8,
  vignetteAmount: 10,
  sharpenAmount: 10,
}

// 시네스틸 800T: 밤·네온용, 푸른 톤 + 붉은 할레이션
const CINESTILL_PARAMS: FilterParams = {
  exposure: -0.1,
  contrast: 15,
  saturation: 5,
  temperature: -65,
  tint: 0,
  vibrance: 5,
  highlights: -20,
  shadows: -5,
  blackLevel: 2,
  splitToneHighlight: { color: '#BFE0FF', amount: 0.12 },
  splitToneShadow: { color: '#1A2A4A', amount: 0.15 },
  grainAmount: 15,
  grainSize: 1.4,
  halationThreshold: 0.7,
  halationRadius: 10,
  halationColor: '#FF2D2D',
  halationAmount: 40,
  bloomAmount: 12,
  vignetteAmount: 15,
  sharpenAmount: 8,
}

// 나츄라 1600: 실내·저녁, 거친 입자
const NATURA_PARAMS: FilterParams = {
  exposure: 0.15,
  contrast: -10,
  saturation: -8,
  temperature: 8,
  tint: 0,
  vibrance: 5,
  highlights: -10,
  shadows: 25,
  blackLevel: 10,
  splitToneHighlight: { color: '#FFE9C9', amount: 0.05 },
  splitToneShadow: { color: '#5A5A6E', amount: 0.08 },
  grainAmount: 30,
  grainSize: 1.8,
  halationThreshold: 0.85,
  halationRadius: 3,
  halationColor: '#FF9466',
  halationAmount: 5,
  bloomAmount: 10,
  vignetteAmount: 10,
  sharpenAmount: 5,
}

// 흑백 (HP5): 고전 흑백, 거친 입자
const MONO_PARAMS: FilterParams = {
  exposure: 0,
  contrast: 15,
  saturation: -100,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  highlights: -10,
  shadows: 10,
  blackLevel: 3,
  splitToneHighlight: { color: '#000000', amount: 0 },
  splitToneShadow: { color: '#000000', amount: 0 },
  grainAmount: 35,
  grainSize: 1.6,
  halationThreshold: 0.9,
  halationRadius: 2,
  halationColor: '#FFFFFF',
  halationAmount: 0,
  bloomAmount: 0,
  vignetteAmount: 15,
  sharpenAmount: 20,
}

export const PRESETS: Preset[] = [
  { id: 'original', name: '원본', params: ORIGINAL_PARAMS },
  { id: 'tomorrow', name: '내일의 너', params: TOMORROW_PARAMS },
  { id: 'portra', name: '포트라 400', params: PORTRA_PARAMS },
  { id: 'superia', name: '수페리아 400', params: SUPERIA_PARAMS },
  { id: 'gold', name: '골드 200', params: GOLD_PARAMS },
  { id: 'cinestill', name: '시네스틸 800T', params: CINESTILL_PARAMS },
  { id: 'natura', name: '나츄라 1600', params: NATURA_PARAMS },
  { id: 'mono', name: '흑백 (HP5)', params: MONO_PARAMS },
]
