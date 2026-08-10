export interface Track {
  title: string
  src: string
}

// public/ 폴더에 mp3를 추가하고 여기에 한 줄 더 넣으면 플레이리스트에 곡이 늘어납니다.
export const PLAYLIST: Track[] = [
  { title: 'One Step Closer — Aakash Gandhi', src: '/bgm.mp3' },
]
