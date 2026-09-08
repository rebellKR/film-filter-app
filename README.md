# 言葉ノート (kotoba-note)

일본어 단어와 그 뜻을 저장하는 개인 단어장. Supabase(매직링크 로그인 + Postgres)로 여러 기기에서 동기화됩니다.

## 시작하기

```bash
npm install
cp .env.example .env   # Supabase 프로젝트 URL / anon key 채우기
npm run dev
```

Supabase 프로젝트의 **SQL Editor**에서 `supabase/schema.sql`을 한 번 실행해서 테이블과 보안 정책을 만들어야 합니다.

## 폴더 구조

```
src/
  features/
    hero/     # 랜딩 히어로 (스크롤 확장 배경/영상, 홈 버튼)
    auth/     # 로그인 (매직링크), 세션 훅
    words/    # 단어장 CRUD
  lib/        # Supabase 클라이언트 등 공용 인프라
  App.tsx     # 화면 조립
public/
  hero/       # 히어로에서 쓰는 배경/영상/사운드
supabase/
  schema.sql  # 테이블 + RLS 정책
```
