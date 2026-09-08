-- 일본어 단어 + 사용자가 입력한 뜻을 저장하는 테이블
create table words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  term text not null,
  meaning text not null,
  created_at timestamptz not null default now()
);

-- 행 단위 보안: 로그인한 사용자가 "본인 소유"의 행만 보고/쓰고/지울 수 있게 합니다.
alter table words enable row level security;

create policy "Users can view their own words"
  on words for select
  using (auth.uid() = user_id);

create policy "Users can insert their own words"
  on words for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own words"
  on words for update
  using (auth.uid() = user_id);

create policy "Users can delete their own words"
  on words for delete
  using (auth.uid() = user_id);
