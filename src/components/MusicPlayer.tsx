import { useEffect, useRef, useState } from 'react'
import { PLAYLIST } from '../engine/playlist'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// 화면 오른쪽 위에 떠 있는, 유리처럼 반투명한 가로형 음악 플레이어입니다.
// 자동재생은 하지 않습니다 — 사용자가 재생 버튼을 직접 누르므로
// 브라우저의 "소리 있는 자동재생 차단" 정책에 아예 걸릴 일이 없습니다.
function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const track = PLAYLIST[trackIndex]
  const progress = duration > 0 ? currentTime / duration : 0

  // 트랙이 바뀌면 새 곡을 불러오고, 재생 중이었다면 이어서 재생합니다.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.load()
    setCurrentTime(0)
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    }
  }, [trackIndex])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  const playRelative = (offset: number) => {
    setTrackIndex((prev) => (prev + offset + PLAYLIST.length) % PLAYLIST.length)
    setIsPlaying(true)
  }

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const bar = progressBarRef.current
    if (!audio || !bar || duration <= 0) return

    const rect = bar.getBoundingClientRect()
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    audio.currentTime = ratio * duration
    setCurrentTime(audio.currentTime)
  }

  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-neutral-100 shadow-lg shadow-black/20 backdrop-blur-xl w-[240px] sm:w-[320px]">
      <audio
        ref={audioRef}
        src={track.src}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => playRelative(1)}
      />

      <button
        type="button"
        onClick={() => playRelative(-1)}
        aria-label="이전 곡"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-200 transition hover:bg-white/15"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? '일시정지' : '재생'}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-neutral-900 transition hover:bg-white"
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <button
        type="button"
        onClick={() => playRelative(1)}
        aria-label="다음 곡"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-200 transition hover:bg-white/15"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{track.title}</p>
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          className="relative mt-1 h-1 cursor-pointer rounded-full bg-white/20"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/90"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="mt-0.5 flex justify-between text-[10px] text-neutral-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}

export default MusicPlayer
