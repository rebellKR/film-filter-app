import { useEffect, useRef, useState } from 'react'
import { loadImageFromFile } from './utils/loadImage'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const loadedImage = await loadImageFromFile(file)
    setImage(loadedImage)
  }

  // 이미지가 바뀔 때마다 캔버스 크기를 이미지에 맞추고 그려줍니다.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    ctx.drawImage(image, 0, 0)
  }, [image])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center gap-6 p-6">
      <h1 className="text-xl font-semibold">film-filter-app</h1>

      <label className="cursor-pointer rounded-full bg-neutral-800 px-5 py-2 text-sm hover:bg-neutral-700">
        사진 선택
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>

      {image ? (
        <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg border border-neutral-800" />
      ) : (
        <p className="text-neutral-500 text-sm">사진을 선택하면 여기에 표시됩니다.</p>
      )}
    </div>
  )
}

export default App
