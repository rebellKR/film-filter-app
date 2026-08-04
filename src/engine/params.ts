// 사용자가 슬라이더로 조절하는 기본 보정값들의 타입과 기본값입니다.
export interface FilterParams {
  exposure: number // 노출 (EV), -2 ~ +2
  contrast: number // 대비, -50 ~ +50
  saturation: number // 채도, -100 ~ +50
  temperature: number // 색온도, -100(차갑게) ~ +100(따뜻하게)
}

export const DEFAULT_FILTER_PARAMS: FilterParams = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
}
