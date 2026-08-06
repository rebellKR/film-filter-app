// WebGL2 렌더러
// 역할: 캔버스에 WebGL2 컨텍스트를 열고, 셰이더 프로그램을 만들고,
//       사진을 텍스처로 GPU에 올려서 화면에 그리는 전체 파이프라인을 담당합니다.
// 필터 파라미터가 늘어나도 이 클래스의 구조(텍스처 생성 → 유니폼 갱신 → 그리기)는
// 그대로 재사용됩니다.

import { VERTEX_SHADER_SOURCE } from './shaders/main.vert'
import { FRAGMENT_SHADER_SOURCE } from './shaders/main.frag'
import { DEFAULT_FILTER_PARAMS, type FilterParams } from './params'

// 셰이더 소스 문자열을 컴파일해서 GPU가 실행 가능한 셰이더 객체로 만듭니다.
function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('셰이더 객체를 생성하지 못했습니다.')

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`셰이더 컴파일 실패: ${log}`)
  }

  return shader
}

// 정점 셰이더 + 프래그먼트 셰이더를 하나로 묶어 GPU가 실행할 "프로그램"을 만듭니다.
function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

  const program = gl.createProgram()
  if (!program) throw new Error('프로그램 객체를 생성하지 못했습니다.')

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!success) {
    const log = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(`프로그램 링크 실패: ${log}`)
  }

  // 링크가 끝나면 개별 셰이더 객체는 더 이상 필요 없으므로 정리합니다.
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  return program
}

// '#RRGGBB' 형태의 색상 문자열을 셰이더에 넘길 수 있는 0~1 범위의 [r, g, b]로 바꿉니다.
function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const r = parseInt(value.substring(0, 2), 16) / 255
  const g = parseInt(value.substring(2, 4), 16) / 255
  const b = parseInt(value.substring(4, 6), 16) / 255
  return [r, g, b]
}

// 유니폼(셰이더에 넘길 값들)의 위치를 미리 찾아 캐시해 둡니다.
interface UniformLocations {
  image: WebGLUniformLocation | null
  texelSize: WebGLUniformLocation | null
  exposure: WebGLUniformLocation | null
  contrast: WebGLUniformLocation | null
  saturation: WebGLUniformLocation | null
  temperature: WebGLUniformLocation | null
  tint: WebGLUniformLocation | null
  vibrance: WebGLUniformLocation | null
  highlights: WebGLUniformLocation | null
  shadows: WebGLUniformLocation | null
  blackLevel: WebGLUniformLocation | null
  splitHighlightColor: WebGLUniformLocation | null
  splitHighlightAmount: WebGLUniformLocation | null
  splitShadowColor: WebGLUniformLocation | null
  splitShadowAmount: WebGLUniformLocation | null
  grainAmount: WebGLUniformLocation | null
  grainSize: WebGLUniformLocation | null
  halationThreshold: WebGLUniformLocation | null
  halationRadius: WebGLUniformLocation | null
  halationColor: WebGLUniformLocation | null
  halationAmount: WebGLUniformLocation | null
  bloomAmount: WebGLUniformLocation | null
  vignetteAmount: WebGLUniformLocation | null
  sharpenAmount: WebGLUniformLocation | null
  intensity: WebGLUniformLocation | null
  showOriginal: WebGLUniformLocation | null
}

function getUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): UniformLocations {
  const loc = (name: string) => gl.getUniformLocation(program, name)
  return {
    image: loc('u_image'),
    texelSize: loc('u_texelSize'),
    exposure: loc('u_exposure'),
    contrast: loc('u_contrast'),
    saturation: loc('u_saturation'),
    temperature: loc('u_temperature'),
    tint: loc('u_tint'),
    vibrance: loc('u_vibrance'),
    highlights: loc('u_highlights'),
    shadows: loc('u_shadows'),
    blackLevel: loc('u_blackLevel'),
    splitHighlightColor: loc('u_splitHighlightColor'),
    splitHighlightAmount: loc('u_splitHighlightAmount'),
    splitShadowColor: loc('u_splitShadowColor'),
    splitShadowAmount: loc('u_splitShadowAmount'),
    grainAmount: loc('u_grainAmount'),
    grainSize: loc('u_grainSize'),
    halationThreshold: loc('u_halationThreshold'),
    halationRadius: loc('u_halationRadius'),
    halationColor: loc('u_halationColor'),
    halationAmount: loc('u_halationAmount'),
    bloomAmount: loc('u_bloomAmount'),
    vignetteAmount: loc('u_vignetteAmount'),
    sharpenAmount: loc('u_sharpenAmount'),
    intensity: loc('u_intensity'),
    showOriginal: loc('u_showOriginal'),
  }
}

export class FilterRenderer {
  private canvas: HTMLCanvasElement
  private gl: WebGL2RenderingContext
  private program: WebGLProgram
  private texture: WebGLTexture
  private uniforms: UniformLocations
  private params: FilterParams = DEFAULT_FILTER_PARAMS
  private intensity = 1 // 0~1, 필터 강도 (기본 100%)
  private showOriginal = false // true면 원본을 그대로 보여줌 (길게 눌러 비교하기)

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const gl = canvas.getContext('webgl2')
    if (!gl) {
      throw new Error('이 브라우저는 WebGL2를 지원하지 않습니다.')
    }
    this.gl = gl

    this.program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE)
    this.uniforms = getUniforms(gl, this.program)
    this.texture = this.createEmptyTexture()
    this.setupGeometry()
  }

  // 화면 전체를 덮는 사각형 하나를 만듭니다.
  // 삼각형 스트립(TRIANGLE_STRIP) 방식으로 정점 4개만 있으면 사각형 하나를 그릴 수 있습니다.
  private setupGeometry() {
    const gl = this.gl

    // 정점마다 [x, y, u, v] 4개 값을 담습니다.
    // x, y: 화면 좌표 (-1~1), u, v: 텍스처(사진) 좌표 (0~1)
    // v(세로) 좌표를 뒤집어(1→0) 넣은 이유: 이미지 데이터는 위쪽부터 저장되지만
    // WebGL 텍스처 좌표는 아래에서 위로 증가하기 때문에, 여기서 미리 맞춰줍니다.
    const vertices = new Float32Array([
      -1, -1, 0, 1, // 왼쪽 아래
       1, -1, 1, 1, // 오른쪽 아래
      -1,  1, 0, 0, // 왼쪽 위
       1,  1, 1, 0, // 오른쪽 위
    ])

    // VAO(Vertex Array Object): 아래에서 설정하는 정점 속성들을 하나로 묶어 기억해 둡니다.
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    // 정점 하나가 차지하는 바이트 크기 (x, y, u, v = 4개의 float)
    const stride = 4 * Float32Array.BYTES_PER_ELEMENT

    // a_position 속성: 정점 데이터의 앞 2개 값(x, y)을 사용
    const positionLoc = gl.getAttribLocation(this.program, 'a_position')
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, stride, 0)

    // a_texCoord 속성: 정점 데이터의 뒤 2개 값(u, v)을 사용
    const texCoordLoc = gl.getAttribLocation(this.program, 'a_texCoord')
    gl.enableVertexAttribArray(texCoordLoc)
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT)
  }

  // 사진을 담을 빈 텍스처를 미리 만들어 둡니다. (실제 사진 데이터는 setImage에서 채웁니다)
  private createEmptyTexture(): WebGLTexture {
    const gl = this.gl
    const texture = gl.createTexture()
    if (!texture) throw new Error('텍스처를 생성하지 못했습니다.')

    gl.bindTexture(gl.TEXTURE_2D, texture)
    // 사진의 가로/세로가 2의 거듭제곱이 아니어도 문제없이 쓰기 위한 설정입니다.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    return texture
  }

  // 새 사진을 불러올 때마다 호출합니다. 캔버스 크기를 사진 크기에 맞추고,
  // 사진 데이터를 GPU 텍스처로 올린 뒤 현재 값 그대로 다시 그립니다.
  setImage(image: HTMLImageElement) {
    const gl = this.gl

    this.canvas.width = image.naturalWidth
    this.canvas.height = image.naturalHeight

    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

    this.render()
  }

  // 슬라이더나 프리셋이 바뀔 때마다 호출합니다. 값을 저장하고 바로 다시 그립니다.
  setParams(params: FilterParams) {
    this.params = params
    this.render()
  }

  // 필터 강도(0~100)를 설정합니다. 0이면 원본, 100이면 보정을 그대로 적용합니다.
  setIntensity(intensityPercent: number) {
    this.intensity = intensityPercent / 100
    this.render()
  }

  // true를 주면 원본 사진을 그대로 보여줍니다. (버튼을 길게 눌러 비교하는 용도)
  setShowOriginal(show: boolean) {
    this.showOriginal = show
    this.render()
  }

  // 실제로 캔버스에 한 프레임을 그립니다.
  render() {
    const gl = this.gl
    const p = this.params

    // 캔버스 픽셀 크기만큼 그리기 영역을 맞춥니다.
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)

    gl.useProgram(this.program)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)

    // 텍스처 유닛 0번에 바인딩한 텍스처를 u_image가 가리키게 합니다.
    gl.uniform1i(this.uniforms.image, 0)
    gl.uniform2f(this.uniforms.texelSize, 1 / this.canvas.width, 1 / this.canvas.height)

    gl.uniform1f(this.uniforms.exposure, p.exposure)
    gl.uniform1f(this.uniforms.contrast, p.contrast)
    gl.uniform1f(this.uniforms.saturation, p.saturation)
    gl.uniform1f(this.uniforms.temperature, p.temperature)

    gl.uniform1f(this.uniforms.tint, p.tint)
    gl.uniform1f(this.uniforms.vibrance, p.vibrance)
    gl.uniform1f(this.uniforms.highlights, p.highlights)
    gl.uniform1f(this.uniforms.shadows, p.shadows)
    gl.uniform1f(this.uniforms.blackLevel, p.blackLevel)
    gl.uniform3fv(this.uniforms.splitHighlightColor, hexToRgb(p.splitToneHighlight.color))
    gl.uniform1f(this.uniforms.splitHighlightAmount, p.splitToneHighlight.amount)
    gl.uniform3fv(this.uniforms.splitShadowColor, hexToRgb(p.splitToneShadow.color))
    gl.uniform1f(this.uniforms.splitShadowAmount, p.splitToneShadow.amount)

    gl.uniform1f(this.uniforms.grainAmount, p.grainAmount)
    gl.uniform1f(this.uniforms.grainSize, p.grainSize)
    gl.uniform1f(this.uniforms.halationThreshold, p.halationThreshold)
    gl.uniform1f(this.uniforms.halationRadius, p.halationRadius)
    gl.uniform3fv(this.uniforms.halationColor, hexToRgb(p.halationColor))
    gl.uniform1f(this.uniforms.halationAmount, p.halationAmount)
    gl.uniform1f(this.uniforms.bloomAmount, p.bloomAmount)
    gl.uniform1f(this.uniforms.vignetteAmount, p.vignetteAmount)
    gl.uniform1f(this.uniforms.sharpenAmount, p.sharpenAmount)

    gl.uniform1f(this.uniforms.intensity, this.intensity)
    gl.uniform1f(this.uniforms.showOriginal, this.showOriginal ? 1 : 0)

    // 정점 4개로 이루어진 삼각형 스트립 = 화면을 덮는 사각형 하나를 그립니다.
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}
