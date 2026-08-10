import ScrollExpandMedia from './components/ScrollExpandMedia'
import FilterEditor from './components/FilterEditor'

function App() {
  return (
    <ScrollExpandMedia
      mediaType="image"
      mediaSrc="/main.jpg"
      bgImageSrc="/background.jpg"
      title="필름처럼, 오늘을"
      date="フィルムの変換"
      scrollToExpand="스크롤해서 시작하기"
      textBlend
    >
      <FilterEditor />
    </ScrollExpandMedia>
  )
}

export default App
