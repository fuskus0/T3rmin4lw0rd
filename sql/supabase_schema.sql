-- Ejemplo de tabla global de SOLO LECTURA pública. Ejecutar en el editor SQL de Supabase.
create table if not exists public.global_data (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.global_data enable row level security;

-- Cualquiera puede leer.
create policy "lectura publica" on public.global_data for select to anon, authenticated using (true);

-- No se crean políticas de insert/update/delete: con RLS activo quedan DENEGADAS para anon.
-- Los datos se editan desde el panel de Supabase (o con una clave de servicio fuera del repositorio).
