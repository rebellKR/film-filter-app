import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

// 비밀번호 없이, 이메일로 받은 링크를 누르면 로그인되는 매직링크 방식입니다.
function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('sending')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }
    setStatus('sent')
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4 text-center text-neutral-100">
      <h1 className="font-jp text-xl font-semibold">言葉ノート</h1>
      <p className="text-sm text-neutral-400">
        メールアドレスを入力すると、ログイン用のリンクが届きます。
      </p>

      {status === 'sent' ? (
        <p className="text-sm text-neutral-200">
          {email} 宛にリンクを送りました。メールを確認してください。
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-full bg-neutral-800 px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-neutral-400"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-full bg-neutral-100 px-5 py-2 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
          >
            {status === 'sending' ? '送信中…' : 'ログインリンクを送る'}
          </button>
          {status === 'error' && <p className="text-xs text-red-400">{errorMessage}</p>}
        </form>
      )}
    </div>
  )
}

export default Login
