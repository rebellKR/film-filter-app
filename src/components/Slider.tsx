interface SliderProps {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
}

// 노출/대비/채도/색온도처럼 "이름 + 숫자 범위" 형태의 슬라이더를 공통 UI로 재사용합니다.
export function Slider({ label, min, max, step = 1, value, onChange }: SliderProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-neutral-300">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="text-neutral-500 tabular-nums">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-neutral-100"
      />
    </label>
  )
}
