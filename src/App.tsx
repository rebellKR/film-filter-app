import ScrollExpandMedia from './components/ScrollExpandMedia'
import HomeButton from './components/HomeButton'
import Login from './components/Login'
import WordNotebook from './components/WordNotebook'
import { useSession } from './hooks/useSession'

function App() {
  const { session, loading } = useSession()

  return (
    <>
      <HomeButton />
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/main.jpg"
        expandedVideoSrc="/main-video.mp4"
        expandSoundSrc="/train-sound.mp3"
        bgImageSrc="/background.jpg"
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
