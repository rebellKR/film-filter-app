import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabaseClient'
import type { Word } from './types'

interface WordNotebookProps {
  session: Session
}

// 일본어 단어 + 사용자가 직접 입력한 뜻을 저장/조회/삭제하는 개인 단어장입니다.
// 서버(Supabase)의 words 테이블에 저장되고, RLS 정책 덕분에 본인 것만 보입니다.
function WordNotebook({ session }: WordNotebookProps) {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [term, setTerm] = useState('')
  const [meaning, setMeaning] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loadWords = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('words')
      .select('id, term, meaning, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMessage(error.message)
    } else if (data) {
      setWords(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadWords()
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!term.trim() || !meaning.trim()) return

    setSaving(true)
    const { error } = await supabase
      .from('words')
      .insert({ term: term.trim(), meaning: meaning.trim(), user_id: session.user.id })
    setSaving(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }
    setTerm('')
    setMeaning('')
    loadWords()
  }

  const handleDelete = async (id: string) => {
    setWords((prev) => prev.filter((word) => word.id !== id))
    await supabase.from('words').delete().eq('id', id)
  }

  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-6 text-neutral-100">
      <div className="flex w-full items-center justify-between">
        <h1 className="font-jp text-xl font-semibold">言葉ノート</h1>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="text-xs text-neutral-400 hover:text-neutral-200"
        >
          ログアウト
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 rounded-lg border border-neutral-800 p-4">
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="日本語の単語（例: 猫）"
          className="font-jp w-full rounded-full bg-neutral-800 px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-neutral-400"
        />
        <textarea
          value={meaning}
          onChange={(event) => setMeaning(event.target.value)}
          placeholder="意味・訳（例: 고양이）"
          rows={2}
          className="w-full resize-none rounded-2xl bg-neutral-800 px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-neutral-400"
        />
        <button
          type="submit"
          disabled={saving}
          className="self-end rounded-full bg-neutral-100 px-5 py-2 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
        >
          {saving ? '保存中…' : '保存'}
        </button>
        {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
      </form>

      <div className="w-full flex flex-col gap-2">
        {loading ? (
          <p className="text-center text-sm text-neutral-500">読み込み中…</p>
        ) : words.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">まだ単語がありません。</p>
        ) : (
          words.map((word) => (
            <div
              key={word.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-neutral-800 p-3"
            >
              <div>
                <p className="font-jp text-base">{word.term}</p>
                <p className="text-sm text-neutral-400">{word.meaning}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(word.id)}
                className="shrink-0 text-xs text-neutral-500 hover:text-red-400"
              >
                削除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default WordNotebook
