import ScrollExpandMedia from './features/hero/ScrollExpandMedia'
import HomeButton from './features/hero/HomeButton'
import Login from './features/auth/Login'
import { useSession } from './features/auth/useSession'
import WordNotebook from './features/words/WordNotebook'

function App() {
  const { session, loading } = useSession()

  return (
    <>
      <HomeButton />
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/hero/main.jpg"
        expandedVideoSrc="/hero/main-video.mp4"
        expandSoundSrc="/hero/train-sound.mp3"
        bgImageSrc="/hero/background.jpg"
        title="言葉を、集める"
        date="日本語ノート"
        scrollToExpand="スクロールしてスタート"
        textBlend
      >
        <div className="flex w-full flex-col items-center justify-center">
          {loading ? (
            <p className="text-sm text-neutral-500">読み込み中…</p>
          ) : session ? (
            <WordNotebook session={session} />
          ) : (
            <Login />
          )}
        </div>
      </ScrollExpandMedia>
    </>
  )
}

export default App
