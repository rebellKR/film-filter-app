import { useEffect, useRef, useState } from 'react'
import { loadImageFromFile } from './utils/loadImage'
import { FilterRenderer } from './engine/renderer'
import { DEFAULT_FILTER_PARAMS, type FilterParams } from './engine/params'
import { Slider } from './components/Slider'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<FilterRenderer | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [params, setParams] = useState<FilterParams>(DEFAULT_FILTER_PARAMS)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const loadedImage = await loadImageFromFile(file)
    setParams(DEFAULT_FILTER_PARAMS)
    setImage(loadedImage)
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

  // 슬라이더 값이 바뀔 때마다 같은 사진을 새 값으로 다시 그립니다.
  useEffect(() => {
    if (!image) return
    rendererRef.current?.setParams(params)
  }, [params, image])

  const updateParam = (key: keyof FilterParams) => (value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }))
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
        link.download = `filmlab_basic_${timestamp}.jpg`
        link.click()
        URL.revokeObjectURL(url)
      },
      'image/jpeg',
      0.92,
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center gap-6 p-6">
      <h1 className="text-xl font-semibold">film-filter-app</h1>

      <label className="cursor-pointer rounded-full bg-neutral-800 px-5 py-2 text-sm hover:bg-neutral-700">
        사진 선택
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>

      {image ? (
        <>
          <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg border border-neutral-800" />

          <div className="w-full max-w-sm flex flex-col gap-4 rounded-lg border border-neutral-800 p-4">
            <Slider
              label="노출"
              min={-2}
              max={2}
              step={0.05}
              value={params.exposure}
              onChange={updateParam('exposure')}
            />
            <Slider
              label="대비"
              min={-50}
              max={50}
              value={params.contrast}
              onChange={updateParam('contrast')}
            />
            <Slider
              label="채도"
              min={-100}
              max={50}
              value={params.saturation}
              onChange={updateParam('saturation')}
            />
            <Slider
              label="색온도"
              min={-100}
              max={100}
              value={params.temperature}
              onChange={updateParam('temperature')}
            />
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full bg-neutral-100 text-neutral-900 px-5 py-2 text-sm font-medium hover:bg-white"
          >
            JPEG로 다운로드
          </button>
        </>
      ) : (
        <p className="text-neutral-500 text-sm">사진을 선택하면 여기에 표시됩니다.</p>
      )}
    </div>
  )
}

export default App
