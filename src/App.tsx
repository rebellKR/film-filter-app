import ScrollExpandMedia from './components/ScrollExpandMedia'
import FilterEditor from './components/FilterEditor'
import HomeButton from './components/HomeButton'
import MusicPlayer from './components/MusicPlayer'

function App() {
  return (
    <>
      <HomeButton />
      <MusicPlayer />
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/main.jpg"
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
