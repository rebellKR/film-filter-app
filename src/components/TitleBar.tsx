import HomeButton from './HomeButton'
import MusicPlayer from './MusicPlayer'

// 화면 맨 위에 고정되는 유리 재질 타이틀바입니다.
// 왼쪽엔 홈 버튼, 오른쪽엔 음악 플레이어를 같은 바 안에 넣어 하나로 이어진 느낌을 줍니다.
function TitleBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 border-b border-white/10 bg-black/30 px-3 py-2.5 backdrop-blur-xl sm:px-5">
      <HomeButton />
      <MusicPlayer />
    </header>
  )
}

export default TitleBar
