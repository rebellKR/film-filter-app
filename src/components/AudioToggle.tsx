import { useRef, useState } from 'react'

// 배경음악을 무음으로 자동재생하고, 우측 하단 버튼으로 켜고 끌 수 있게 합니다.
// 브라우저는 소리 있는 자동재생을 막아두기 때문에, 처음엔 항상 무음으로 시작해서
// 정책을 통과시키고, 사용자가 버튼을 눌러야만(=명확한 사용자 동작) 소리가 납니다.
function AudioToggle() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(true)

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return

    const nextMuted = !isMuted
    audio.muted = nextMuted
    setIsMuted(nextMuted)

    if (!nextMuted) {
      // 음소거 해제는 클릭 이벤트 안에서 바로 일어나므로 재생이 허용됩니다.
      audio.play().catch(() => {})
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/bgm.mp3" loop autoPlay muted playsInline />
      <button
        type="button"
        onClick={toggle}
        aria-label={isMuted ? '배경음악 켜기' : '배경음악 끄기'}
        className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900/70 text-lg text-neutral-100 backdrop-blur transition hover:bg-neutral-800/80"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </>
  )
}

export default AudioToggle
