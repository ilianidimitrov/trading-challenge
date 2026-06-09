-- Binance trade fields + screenshot storage
-- Run after schema.sql

alter table public.trades
  add column if not exists market_type text default 'USDT-M',
  add column if not exists leverage numeric,
  add column if not exists quantity numeric,
  add column if not exists position_usdt numeric;

-- Storage bucket for trade screenshots
insert into storage.buckets (id, name, public)
values ('trade-screenshots', 'trade-screenshots', true)
on conflict (id) do nothing;

create policy "Users can upload own screenshots"
  on storage.objects for insert
  with check (
    bucket_id = 'trade-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Screenshots are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'trade-screenshots');

create policy "Users can delete own screenshots"
  on storage.objects for delete
  using (
    bucket_id = 'trade-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
