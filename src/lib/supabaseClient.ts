import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// .env 파일이 아직 없으면 여기서 바로 에러를 던져서, "왜 안 되지?"를 로그인 화면까지
// 가서 헤매지 않고 콘솔에서 바로 알 수 있게 합니다.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '.env 파일에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 설정해주세요. (.env.example 참고)',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
