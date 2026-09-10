-- La Belly: execute este arquivo inteiro no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 nome text,
 role text not null default 'customer' check (role in ('admin','customer')),
 created_at timestamptz not null default now()
);
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='admin')
$$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,nome) values(new.id,coalesce(new.raw_user_meta_data->>'nome','')) on conflict (id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table if not exists public.categorias (
 id uuid primary key default gen_random_uuid(), nome text not null, slug text not null unique,
 descricao text default '', imagem_capa text, caminho_storage text, ordem integer not null default 0,
 ativa boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.produtos (
 id uuid primary key default gen_random_uuid(), nome text not null, categoria_id uuid not null references public.categorias(id) on delete restrict,
 preco numeric(12,2) not null check(preco>=0), preco_promocional numeric(12,2) check(preco_promocional is null or (preco_promocional>=0 and preco_promocional<preco)),
 descricao text default '', descricao_detalhada text default '', tamanhos jsonb not null default '[]'::jsonb, cores jsonb not null default '[]'::jsonb,
 estoque boolean not null default true, novidade boolean not null default false, destaque boolean not null default false,
 ativo boolean not null default true, ordem integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.produto_imagens (
 id uuid primary key default gen_random_uuid(), produto_id uuid not null references public.produtos(id) on delete cascade,
 url text not null, caminho_storage text, texto_alternativo text default '', ordem integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.configuracoes_loja (
 id boolean primary key default true check(id), nome_loja text default 'La Belly', whatsapp text default '', instagram_url text default '', instagram_handle text default '', slogan text default '', updated_at timestamptz not null default now()
);
insert into public.configuracoes_loja(id) values(true) on conflict do nothing;
create index if not exists produtos_publicos_idx on public.produtos(ativo,categoria_id,ordem);
create index if not exists categorias_publicas_idx on public.categorias(ativa,ordem);
create index if not exists produto_imagens_ordem_idx on public.produto_imagens(produto_id,ordem);
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists categorias_updated_at on public.categorias; create trigger categorias_updated_at before update on public.categorias for each row execute procedure public.set_updated_at();
drop trigger if exists produtos_updated_at on public.produtos; create trigger produtos_updated_at before update on public.produtos for each row execute procedure public.set_updated_at();
drop trigger if exists config_updated_at on public.configuracoes_loja; create trigger config_updated_at before update on public.configuracoes_loja for each row execute procedure public.set_updated_at();

-- View pública: produto só aparece quando produto e categoria estão ativos.
create or replace view public.produtos_publicos with (security_invoker=on) as
select p.id,p.nome,c.nome as categoria,p.preco,p.preco_promocional,p.descricao,p.descricao_detalhada,p.tamanhos,p.cores,p.estoque,p.novidade,p.destaque,p.ordem,
 coalesce((select pi.url from public.produto_imagens pi where pi.produto_id=p.id order by pi.ordem,pi.created_at limit 1),'') imagem,
 coalesce((select jsonb_agg(pi.url order by pi.ordem,pi.created_at) from public.produto_imagens pi where pi.produto_id=p.id),'[]'::jsonb) imagens
from public.produtos p join public.categorias c on c.id=p.categoria_id where p.ativo=true and c.ativa=true;

alter table public.profiles enable row level security;
alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.produto_imagens enable row level security;
alter table public.configuracoes_loja enable row level security;

create policy "profile próprio" on public.profiles for select using(auth.uid()=id);
create policy "admin profiles" on public.profiles for all using(public.is_admin()) with check(public.is_admin());
create policy "leitura categorias ativas" on public.categorias for select using(ativa=true or public.is_admin());
create policy "admin categorias" on public.categorias for all using(public.is_admin()) with check(public.is_admin());
create policy "leitura produtos públicos ou admin" on public.produtos for select using((ativo=true and exists(select 1 from public.categorias c where c.id=categoria_id and c.ativa=true)) or public.is_admin());
create policy "admin produtos" on public.produtos for all using(public.is_admin()) with check(public.is_admin());
create policy "leitura imagens públicas ou admin" on public.produto_imagens for select using(exists(select 1 from public.produtos p join public.categorias c on c.id=p.categoria_id where p.id=produto_id and p.ativo and c.ativa) or public.is_admin());
create policy "admin imagens" on public.produto_imagens for all using(public.is_admin()) with check(public.is_admin());
create policy "config pública" on public.configuracoes_loja for select using(true);
create policy "admin config" on public.configuracoes_loja for all using(public.is_admin()) with check(public.is_admin());

-- Bucket e políticas de imagens. Execute como dono do projeto.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('catalogo','catalogo',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create policy "imagens públicas" on storage.objects for select using(bucket_id='catalogo');
create policy "admin envia imagens" on storage.objects for insert with check(bucket_id='catalogo' and public.is_admin());
create policy "admin atualiza imagens" on storage.objects for update using(bucket_id='catalogo' and public.is_admin()) with check(bucket_id='catalogo' and public.is_admin());
create policy "admin remove imagens" on storage.objects for delete using(bucket_id='catalogo' and public.is_admin());

-- Depois de criar a usuária em Authentication > Users, execute UMA vez, trocando o e-mail:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='EMAIL_DA_DONA@EXEMPLO.COM');
