import { useEffect, useRef, useState } from 'react'
import { loadImageFromFile } from '../utils/loadImage'
import { FilterRenderer } from '../engine/renderer'
import { DEFAULT_FILTER_PARAMS, type FilterParams } from '../engine/params'
import { PRESETS } from '../engine/presets'
import { Slider } from './Slider'

function FilterEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<FilterRenderer | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [params, setParams] = useState<FilterParams>(DEFAULT_FILTER_PARAMS)
  const [presetId, setPresetId] = useState(PRESETS[0].id)
  const [intensity, setIntensity] = useState(100)
  const [showOriginal, setShowOriginal] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const loadedImage = await loadImageFromFile(file)
    setPresetId(PRESETS[0].id)
    setParams(DEFAULT_FILTER_PARAMS)
    setIntensity(100)
    setImage(loadedImage)
  }

  const handleSelectPreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id)
    if (!preset) return
    setPresetId(id)
    setParams(preset.params)
  }

  // 이미지가 바뀔 때마다 WebGL 렌더러에 새 사진을 넘겨 다시 그리게 합니다.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    // 렌더러(WebGL2 컨텍스트, 셰이더 프로그램)는 캔버스당 한 번만 만들면 되므로 재사용합니다.
    if (!rendererRef.current) {
      rendererRef.current = new FilterRenderer(canvas)
    }
    rendererRef.current.setImage(image)
  }, [image])

  // 슬라이더/프리셋 값이 바뀔 때마다 같은 사진을 새 값으로 다시 그립니다.
  useEffect(() => {
    if (!image) return
    rendererRef.current?.setParams(params)
  }, [params, image])

  useEffect(() => {
    if (!image) return
    rendererRef.current?.setIntensity(intensity)
  }, [intensity, image])

  useEffect(() => {
    if (!image) return
    rendererRef.current?.setShowOriginal(showOriginal)
  }, [showOriginal, image])

  const updateParam = (key: keyof FilterParams) => (value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  // splitToneHighlight/splitToneShadow는 { color, amount } 객체라 기본 updateParam으로는 못 건드립니다.
  // 슬라이더에는 0~100으로 보여주고, 내부적으로는 0~1로 저장합니다.
  const updateSplitToneAmount = (channel: 'splitToneHighlight' | 'splitToneShadow') => (percent: number) => {
    setParams((prev) => ({ ...prev, [channel]: { ...prev[channel], amount: percent / 100 } }))
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:]/g, '')
          .replace('T', '_')
          .slice(0, 15)

        const link = document.createElement('a')
        link.href = url
        link.download = `filmlab_${presetId}_${timestamp}.jpg`
        link.click()
        URL.revokeObjectURL(url)
      },
      'image/jpeg',
      0.92,
    )
  }

  return (
    <div className="text-neutral-100 flex flex-col items-center gap-6">
      <h1 className="text-xl font-semibold">HJ’s Film</h1>

      <label className="cursor-pointer rounded-full bg-neutral-800 px-5 py-2 text-sm hover:bg-neutral-700">
        アルバムから選択
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>

      {image ? (
        <div className="w-full max-w-6xl flex flex-col lg:flex-row lg:items-start gap-6">
          {/* 왼쪽: 사진 미리보기 */}
          <div className="flex flex-col items-center gap-2 lg:flex-1 lg:sticky lg:top-20">
            {/* 캔버스를 누르고 있는 동안 원본 사진과 비교해서 볼 수 있습니다. */}
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[70dvh] w-auto h-auto rounded-lg border border-neutral-800 select-none touch-none"
              onPointerDown={() => setShowOriginal(true)}
              onPointerUp={() => setShowOriginal(false)}
              onPointerLeave={() => setShowOriginal(false)}
            />
            <p className="text-xs text-neutral-500">長押しで元の写真と比較できます</p>

            <button
              type="button"
              onClick={handleDownload}
              className="mt-2 rounded-full bg-neutral-100 text-neutral-900 px-5 py-2 text-sm font-medium hover:bg-white"
            >
              JPEGで保存
            </button>
          </div>

          {/* 오른쪽: 프리셋 + 설정 */}
          <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6 lg:max-h-[80dvh] lg:overflow-y-auto lg:pr-1">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm ${presetId === preset.id
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'bg-neutral-800 hover:bg-neutral-700'
                    }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-neutral-800 p-4">
              <Slider label="フィルター強度" min={0} max={100} value={intensity} onChange={setIntensity} />
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-neutral-800 p-4">
              <p className="text-sm font-semibold text-neutral-300">基本設定</p>
              <Slider
                label="露出"
                min={-2}
                max={2}
                step={0.05}
                value={params.exposure}
                onChange={updateParam('exposure')}
              />
              <Slider
                label="コントラスト"
                min={-50}
                max={50}
                value={params.contrast}
                onChange={updateParam('contrast')}
              />
              <Slider
                label="彩度"
                min={-100}
                max={50}
                value={params.saturation}
                onChange={updateParam('saturation')}
              />
              <Slider
                label="色温度"
                min={-100}
                max={100}
                value={params.temperature}
                onChange={updateParam('temperature')}
              />
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-neutral-800 p-4">
              <p className="text-sm font-semibold text-neutral-300">詳細設定 — 色</p>
              <Slider label="ティント" min={-100} max={100} value={params.tint} onChange={updateParam('tint')} />
              <Slider
                label="自然な彩度"
                min={-100}
                max={100}
                value={params.vibrance}
                onChange={updateParam('vibrance')}
              />
              <Slider
                label="ハイライト"
                min={-100}
                max={100}
                value={params.highlights}
                onChange={updateParam('highlights')}
              />
              <Slider
                label="シャドウ"
                min={-100}
                max={100}
                value={params.shadows}
                onChange={updateParam('shadows')}
              />
              <Slider
                label="ブラックレベル"
                min={0}
                max={30}
                value={params.blackLevel}
                onChange={updateParam('blackLevel')}
              />
              <Slider
                label="ハイライトの色付け"
                min={0}
                max={100}
                value={Math.round(params.splitToneHighlight.amount * 100)}
                onChange={updateSplitToneAmount('splitToneHighlight')}
              />
              <Slider
                label="シャドウの色付け"
                min={0}
                max={100}
                value={Math.round(params.splitToneShadow.amount * 100)}
                onChange={updateSplitToneAmount('splitToneShadow')}
              />
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-neutral-800 p-4">
              <p className="text-sm font-semibold text-neutral-300">詳細設定 — フィルムの質感</p>
              <Slider
                label="粒子感（グレイン）"
                min={0}
                max={100}
                value={params.grainAmount}
                onChange={updateParam('grainAmount')}
              />
              <Slider
                label="粒子の大きさ"
                min={0.5}
                max={3}
                step={0.1}
                value={params.grainSize}
                onChange={updateParam('grainSize')}
              />
              <Slider
                label="ハレーション"
                min={0}
                max={100}
                value={params.halationAmount}
                onChange={updateParam('halationAmount')}
              />
              <Slider
                label="ブルーム（ソフトフォーカス）"
                min={0}
                max={100}
                value={params.bloomAmount}
                onChange={updateParam('bloomAmount')}
              />
              <Slider
                label="ビネット"
                min={0}
                max={100}
                value={params.vignetteAmount}
                onChange={updateParam('vignetteAmount')}
              />
              <Slider
                label="シャープネス"
                min={0}
                max={100}
                value={params.sharpenAmount}
                onChange={updateParam('sharpenAmount')}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">選択するとこちらに表示されます。</p>
      )}
    </div>
  )
}

export default FilterEditor
