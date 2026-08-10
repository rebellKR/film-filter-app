// 홈 버튼. 페이지 맨 위(히어로 시작 지점)로 부드럽게 스크롤합니다.
// TitleBar 안에 들어가는 용도라 자체 위치/배경은 없습니다.
function HomeButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="ホームへ戻る"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-100 transition hover:bg-white/15"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    </button>
  )
}

export default HomeButton
