// 사용자가 선택한 File(사진 파일)을 <img> 요소로 불러옵니다.
// 브라우저 캔버스/WebGL에 그리려면 File이 아니라 로드가 끝난 이미지 객체가 필요합니다.
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      // 임시 URL은 이미지가 로드된 뒤에는 필요 없으므로 메모리 누수를 막기 위해 해제합니다.
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('이미지를 불러오지 못했습니다.'))
    }

    image.src = objectUrl
  })
}
