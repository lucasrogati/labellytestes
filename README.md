# La Belly — painel administrativo com Supabase

## O que foi implementado

O site público continua em HTML/CSS/JavaScript e preserva carrinho (`localStorage`), busca sem acento, filtros, menu responsivo, modal de produto, galeria, seleção de cor/tamanho, promoções, estoque e checkout no WhatsApp.

Foi adicionado um painel em `admin/` para login, produtos, categorias, imagens e dashboard. O catálogo usa Supabase quando configurado e mantém `js/products.js` como fallback automático para a loja nunca ficar vazia durante a configuração.

## Configuração do Supabase

1. Crie um projeto no Supabase.
2. Abra **SQL Editor** e execute todo o arquivo `supabase/schema.sql` uma única vez.
3. Em **Authentication > Users**, crie a usuária da dona com e-mail e senha.
4. No SQL Editor, execute a linha final indicada em `schema.sql`, substituindo o e-mail pela conta criada. Isso promove a conta para `admin`.
5. Em **Project Settings > API**, copie a URL do projeto e a `anon public key`. Não copie a `service_role key`.
6. Copie `js/app-config.example.js` para `js/app-config.js` e preencha URL/chave. Troque `CATALOGO_MODE` para `auto`.
7. Acesse `admin/migrar-catalogo.html`, faça login e execute a migração uma única vez. Ela cria categorias/produtos existentes; as fotos locais continuam funcionando como URLs locais. Depois, substitua/adapte fotos pelo painel para enviá-las ao Storage.
8. Acesse `admin/login.html` e entre com a conta admin.

## Painel

- `admin/login.html`: autenticação.
- `admin/index.html`: dashboard, produtos e categorias.
- `admin/migrar-catalogo.html`: utilitário de migração única.

Produtos podem ser arquivados sem apagar dados. Exclusão definitiva exige confirmação. Categorias com produtos vinculados não podem ser excluídas até que seus produtos sejam movidos ou arquivados.

## Segurança

`SUPABASE_URL` e `SUPABASE_ANON_KEY` são dados públicos de conexão. A proteção real é feita pelas regras RLS e Storage criadas no SQL. Nunca coloque `service_role key`, senha ou credenciais privadas no projeto.

O arquivo `js/app-config.js` está no `.gitignore`. Em hospedagem estática, ele é carregado pelo navegador; configure-o com URL/anon key antes do deploy. Cloudflare Pages e Netlify podem servir esse arquivo normalmente. Se ele ficar no modo `fallback`, a loja continua usando os produtos locais e o painel mostra que falta configuração.

## Modos de catálogo

Em `js/app-config.js`:

- `fallback`: só produtos locais, ideal para testar sem Supabase.
- `auto`: tenta Supabase e usa produtos locais quando houver falha. Recomendado.
- `supabase`: tenta Supabase, mas ainda mantém fallback visual para não deixar a loja vazia.

## Teste final

1. No painel, crie uma categoria ativa com imagem.
2. Cadastre produto com categoria, preço, imagens, tamanhos e cores.
3. Abra a home em nova aba, confira menu/categoria/card/modal.
4. Adicione ao carrinho, altere quantidade e confirme mensagem de WhatsApp.
5. Arquive o produto e atualize a home: ele não deve aparecer.
6. Tente abrir `admin/index.html` sem login: o redirecionamento deve ir para login.

## Publicação

Publique todos os arquivos, incluindo `admin/`, `supabase/` (opcional no deploy) e `js/app-config.js` preenchido. Em Netlify/Cloudflare Pages, não há build necessário: é um site estático.

## Arquivos novos

- `admin/` — interface administrativa
- `supabase/schema.sql` — tabelas, índices, view, RLS, Storage
- `js/app-config.example.js` — modelo de configuração
- `js/app-config.js` — configuração local em modo fallback
- `js/supabase-client.js` — cliente público
- `js/catalogo-api.js` — catálogo remoto + fallback
- `js/fallback-products.js` — backup do catálogo original
- `backup-pre-supabase/` — cópias dos arquivos principais antes da alteração

## Rollback

Para desligar temporariamente Supabase, defina `CATALOGO_MODE: 'fallback'` em `js/app-config.js`. Para voltar os arquivos principais, use as cópias em `backup-pre-supabase/` ou o histórico Git.
