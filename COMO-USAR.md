# La Belly — Guia rápido

## Estrutura do site

```
labelly/
├── index.html            → estrutura da página inicial (loja)
├── contato.html          → página de contato
├── privacidade.html      → política de privacidade
├── css/style.css         → visual do site (não precisa mexer)
├── js/
│   ├── config.js         → ✅ nome da loja, WhatsApp, Instagram, slogan
│   ├── products.js       → ✅ AQUI você adiciona/remove/edita produtos
│   ├── cart.js           → lógica do carrinho de compras (não precisa mexer)
│   └── main.js           → lógica geral do site: vitrine, busca, modal (não precisa mexer)
└── images/                → fotos dos produtos
```

Os dois arquivos que você vai mexer no dia a dia são `js/config.js` (dados da loja) e `js/products.js` (produtos).

---

## 1. Adicionar, remover ou editar produtos

Abra `js/products.js`. Cada produto é um bloco assim:

```js
{
  id: 9,
  nome: "Nome do Produto",
  categoria: "Conjuntos",
  preco: 199.90,
  imagem: "images/minha-foto.jpg",
  imagens: ["images/minha-foto.jpg", "images/minha-foto-2.jpg"],
  descricao: "Frase curta para o card da vitrine.",
  descricaoDetalhada: "Texto mais completo que aparece quando o cliente clica no produto.",
  tamanhos: ["P", "M", "G"],
  cor: "Preto",
  novidade: true,
  precoPromocional: null,
  estoque: true,
  destaque: false
}
```

- **Adicionar**: copie um bloco inteiro, cole antes do `];` no fim do arquivo, e edite os valores. Não esqueça a vírgula `,` entre os blocos.
- **Remover**: apague o bloco `{ ... }` inteiro do produto.
- **Editar**: é só mudar o valor do campo dentro do bloco (preço, nome, descrição, etc.) e salvar.
- **Categoria**: pode usar uma categoria já existente ou criar uma nova — o filtro no topo do catálogo é gerado automaticamente a partir do que você colocar aqui.
- **novidade**: `true` mostra a etiqueta "NOVO" no card, `false` não mostra.
- **imagens**: lista de fotos que aparecem na galeria ao clicar no produto (pode ter 1, 2, 3 ou mais). Se não tiver fotos extras ainda, repita a mesma foto.
- **tamanhos**: lista os tamanhos disponíveis. Se remover esse campo (ou deixar `[]`), o produto não mostra seletor de tamanho.
- **cor**: pode ser um texto único (`cor: "Bege"`) quando o produto só existe numa cor, ou uma lista (`cor: ["Preto", "Bege", "Rosa"]`) quando o cliente precisa escolher a cor — nesse caso o site mostra os botões de cor no modal do produto.

### Campos de promoção e estoque

- **`precoPromocional`**: coloque um número (ex: `79.90`) para ativar a promoção — o site mostra o preço antigo riscado e o novo em destaque, tanto no card quanto na página do produto. Deixe `null` quando não houver promoção.
- **`estoque`**: `true` = disponível normalmente. `false` = o produto aparece esmaecido com a etiqueta "Esgotado", e o botão de compra/adicionar ao carrinho fica desabilitado.
- **`destaque`**: `true`/`false` — reservado para uma futura vitrine de destaques; hoje não muda nada visualmente, pode deixar `false`.

Abra o `index.html` no navegador (duplo clique) depois de editar para conferir antes de publicar.

---

## 2. Trocar as fotos dos produtos

1. Coloque suas fotos na pasta `images/` (formato `.jpg`, `.png` ou `.webp`, de preferência retrato, proporção 4:5).
2. No `products.js`, no campo `imagem` (foto principal do card) e `imagens` (galeria do produto), escreva o nome exato do arquivo, ex: `imagem: "images/babydoll-bege.jpg"`.
3. Não esqueça a `images/og-image.jpg` — é a imagem que aparece quando alguém compartilha o link do site no WhatsApp/Instagram.

---

## 3. Trocar o nome da loja, WhatsApp, Instagram ou slogan

Tudo isso está centralizado em um único lugar: `js/config.js`.

```js
const CONFIG = {
  nomeLoja: "La Belly",
  slogan: "Bem-estar íntimo e sensualidade com elegância",
  whatsappNumber: "5513997338148",   // 55 + DDD + número, só números
  instagramUrl: "https://instagram.com/la_belly.__013",
  instagramHandle: "@la_belly.__013",
  mensagemBase: (produto) => `...`
};
```

- **WhatsApp**: troque `whatsappNumber` (mantendo o formato `55` + DDD + número, sem espaço, traço ou parênteses). Esse número é usado automaticamente em todos os botões de compra do site, no carrinho e na página de contato — não precisa alterar em mais nenhum lugar.
- **Instagram**: troque `instagramUrl` e `instagramHandle`.
- **Nome/slogan**: usados nas mensagens automáticas de WhatsApp e no rodapé.

---

## 4. Como funciona o carrinho de compras

O site tem um carrinho completo (ícone de sacola no canto superior direito do cabeçalho):

- **Adicionar produto**: clicando em "Adicionar ao carrinho" no card do produto (vitrine) ou dentro da página do produto. Se o produto tem tamanho ou mais de uma cor, o site abre a página do produto primeiro para o cliente escolher antes de adicionar.
- **Alterar quantidade**: dentro do carrinho, os botões `-` e `+` ao lado de cada item.
- **Remover item**: o `✕` ao lado de cada item no carrinho.
- **Limpar carrinho inteiro**: botão "Limpar carrinho" no rodapé do carrinho (pede confirmação).
- **O carrinho fica salvo**: mesmo se o cliente fechar a aba ou recarregar a página, o carrinho continua com os itens (isso é feito via `localStorage`, direto no navegador do cliente — nenhum dado é enviado para servidor nenhum).
- **Finalizar pedido**: o botão "Finalizar pedido no WhatsApp" monta automaticamente uma mensagem com todos os itens, quantidades, tamanho/cor escolhidos e o total, e abre o WhatsApp da loja (o número configurado em `config.js`) já com essa mensagem pronta.

Você não precisa mexer em `js/cart.js` para nada disso funcionar — ele já cuida de tudo sozinho a partir dos produtos cadastrados em `products.js`.

---

## 5. Como funciona a busca de produtos

Logo acima do catálogo tem um campo "Buscar produto por nome, categoria ou cor...". Ele filtra a vitrine em tempo real, sem precisar apertar nenhum botão (é só digitar).

- Busca em: **nome**, **categoria**, **descrição curta**, **descrição detalhada** e **cor(es)** do produto.
- Não é sensível a acento nem a maiúscula/minúscula — buscar "sutia" encontra "Sutiã", por exemplo.
- Funciona **junto** com o filtro de categoria: se o cliente já filtrou por "Conjuntos" e depois busca algo, o resultado continua restrito a "Conjuntos".
- Se não encontrar nada, mostra uma mensagem tipo `Nenhum resultado para "termo buscado"`.
- O `✕` que aparece dentro do campo limpa a busca; a tecla `Esc` também limpa.

Não tem nada pra configurar aqui — a busca já lê automaticamente os produtos que você cadastrar em `products.js`.

---

## 6. Textos do site (hero, seção "A marca", seção de confiança)

Estão direto no `index.html` — procure pelas tags `<h1>`, `<p class="hero-sub">`, `<p class="sobre-texto">`, e a seção com `id="confianca"`, e edite o texto entre as tags normalmente.

---

## 7. Página de produto (galeria, tamanho, cor, promoção)

Ao clicar em qualquer produto da vitrine, abre uma janela com: galeria de fotos (com miniaturas clicáveis), cor(es), tamanhos disponíveis (o cliente escolhe antes de comprar/adicionar ao carrinho), preço (com promoção se houver) e a descrição detalhada. Tudo isso vem dos campos `imagens`, `cor`, `tamanhos`, `precoPromocional` e `descricaoDetalhada` que você preenche no `products.js` (seção 1 acima).

---

## 8. Identidade visual e SEO (já configurados)

- **Favicon**: `favicon.svg` — o ícone que aparece na aba do navegador. Para trocar, edite o SVG ou substitua por um logotipo próprio.
- **Compartilhamento (Open Graph)**: quando alguém manda o link do site no WhatsApp ou Instagram, aparece a imagem `images/og-image.jpg` com título e descrição definidos no `<head>` do `index.html` (tags `og:title`, `og:description`, `og:image`). Troque a imagem e os textos lá quando tiver a identidade visual final.
- **`robots.txt`** e **`sitemap.xml`**: já configurados para liberar a indexação do site pelo Google. Se o domínio mudar (ex: sair de `labelly.netlify.app` para `labelly.com.br`), atualize a URL nesses dois arquivos e nas tags `canonical`/`og:url` de cada página HTML.
- **Google Search Console**: para o site aparecer melhor no Google, cadastre-o em https://search.google.com/search-console, verifique a propriedade e envie o `sitemap.xml` por lá.
- **Página de Contato** (`contato.html`) e **Política de Privacidade** (`privacidade.html`): já criadas e linkadas no rodapé. A política é um modelo genérico — vale revisar com um advogado/contador antes de publicar oficialmente.

---

## 9. Como publicar o site (grátis) — via Netlify

1. Acesse **https://app.netlify.com/drop**
2. Arraste a pasta `labelly` inteira para a área indicada no navegador.
3. Em poucos segundos o Netlify te dá um link tipo `nome-aleatorio.netlify.app` — seu site já está no ar.
4. (Opcional) Em **Site settings → Change site name**, você troca esse link por algo como `labelly.netlify.app`.
5. (Opcional) Em **Domain settings**, dá pra ligar um domínio próprio (ex: `labelly.com.br`) comprado num registrador tipo Registro.br.

Toda vez que quiser atualizar o site depois de editar produtos: entre em **Deploys** no painel do Netlify e arraste a pasta atualizada de novo.

### Alternativa: Vercel
Mesmo princípio — em **https://vercel.com/new** dá pra importar a pasta ou conectar um repositório do GitHub, se preferir manter o site versionado lá.

---

## Dúvidas comuns

**Editei e não mudou nada no site.**
Salve o arquivo, feche e reabra o `index.html` no navegador (ou dê Ctrl+Shift+R para forçar recarregar sem cache).

**O carrinho de um cliente "sumiu".**
Ele fica salvo só no navegador daquele cliente (`localStorage`). Se ele limpar os dados de navegação, trocar de navegador/dispositivo, ou usar aba anônima, o carrinho começa vazio de novo. Isso é normal para um site sem login nem banco de dados.

**Quero pagamento direto no site (cartão/PIX) em vez de só WhatsApp.**
Isso exige integrar um gateway (Mercado Pago, Stripe, PagSeguro) e sai do escopo de site estático — é um próximo passo possível quando o catálogo já estiver validando vendas.

**Quero remover a busca ou os campos de promoção.**
Dá pra fazer, mas exige mexer em `js/main.js` e no HTML — melhor pedir ajuda técnica nesse caso, pra não quebrar outras partes do site.
