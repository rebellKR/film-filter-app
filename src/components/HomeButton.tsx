// 화면 왼쪽 위에 떠 있는 홈 버튼. 페이지 맨 위(히어로 시작 지점)로 부드럽게 스크롤합니다.
function HomeButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="맨 위로"
      className="fixed top-3 left-3 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-neutral-100 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:bg-white/20"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    </button>
  )
}

export default HomeButton
