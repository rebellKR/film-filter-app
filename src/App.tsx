import ScrollExpandMedia from './components/ScrollExpandMedia'
import FilterEditor from './components/FilterEditor'
import HomeButton from './components/HomeButton'

function App() {
  return (
    <>
      <HomeButton />
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/main.jpg"
        expandedVideoSrc="/main-video.mp4"
        expandSoundSrc="/train-sound.mp3"
        bgImageSrc="/background.jpg"
        title="レトロの 魅力"
        date="レトロの色彩に染まる"
        scrollToExpand="スクロールしてスタート"
        textBlend
      >
        <FilterEditor />
      </ScrollExpandMedia>
    </>
  )
}

export default App
