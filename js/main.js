/* ==========================================================
   As configurações da loja (nome, WhatsApp, Instagram) ficam
   em js/config.js — edite lá, não aqui.
   ========================================================== */

function formatarPreco(valor){
  const numero = typeof valor === 'number' && !Number.isNaN(valor) ? valor : 0;
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* Retorna o preço vigente do produto: o promocional, se houver, senão o normal */
function precoAtual(produto){
  return (produto.precoPromocional !== null && produto.precoPromocional !== undefined)
    ? produto.precoPromocional
    : produto.preco;
}

/* Escapa caracteres HTML perigosos antes de inserir texto (ex.: o que o usuário
   digitou na busca) dentro de innerHTML — evita que alguém injete um
   <script>/<img onerror=...> na página digitando isso na busca. */
function escaparHTML(texto){
  const div = document.createElement('div');
  div.textContent = texto == null ? '' : String(texto);
  return div.innerHTML;
}

function linkWhatsapp(mensagem){
  const texto = encodeURIComponent(mensagem);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${texto}`;
}

/* Estado atual do catálogo: categoria selecionada + termo de busca.
   As duas coisas funcionam juntas — buscar não reseta o filtro de categoria e vice-versa. */
const estadoCatalogo = {
  categoria: "Todos",
  busca: ""
};

/* Remove acentos para a busca não depender de o usuário digitar "á" certinho */
function normalizarTexto(texto){
  return (texto || "")
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function produtoCasaComBusca(produto, termoNormalizado){
  if (!termoNormalizado) return true;

  const cores = Array.isArray(produto.cor) ? produto.cor.join(' ') : (produto.cor || '');
  const camposBusca = [
    produto.nome,
    produto.categoria,
    produto.descricao,
    produto.descricaoDetalhada,
    cores
  ].map(normalizarTexto).join(' ');

  return camposBusca.includes(termoNormalizado);
}

function montarCategorias(){
  const categorias = ["Todos", ...new Set(PRODUCTS.map(p => p.categoria))];

  const nav = document.getElementById('mainNav');
  nav.innerHTML = categorias
    .filter(c => c !== "Todos")
    .map(c => `<a href="#catalogo" data-cat="${c}">${c}</a>`)
    .join('');

  const drawerNav = document.getElementById('drawerNav');
  drawerNav.innerHTML = categorias
    .map(c => `<a href="#catalogo" data-cat="${c}">${c}</a>`)
    .join('');

  const filtros = document.getElementById('filtros');
  filtros.innerHTML = categorias
    .map((c, i) => `<button class="filtro-btn ${i === 0 ? 'ativo' : ''}" data-cat="${c}">${c}</button>`)
    .join('');

  function ativarCategoria(cat){
    estadoCatalogo.categoria = cat;
    filtros.querySelectorAll('.filtro-btn').forEach(b => b.classList.toggle('ativo', b.dataset.cat === cat));
    renderizarGrid();
  }

  filtros.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => ativarCategoria(btn.dataset.cat));
  });

  [...nav.querySelectorAll('a[data-cat]'), ...drawerNav.querySelectorAll('a[data-cat]')].forEach(link => {
    link.addEventListener('click', () => {
      ativarCategoria(link.dataset.cat);
      fecharDrawer();
    });
  });
}

/* ---------- busca de produtos ---------- */
function montarBusca(){
  const input = document.getElementById('buscaInput');
  const btnLimpar = document.getElementById('buscaLimpar');
  if (!input) return;

  let debounceId = null;

  input.addEventListener('input', () => {
    btnLimpar.hidden = input.value.length === 0;
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      estadoCatalogo.busca = input.value;
      renderizarGrid();
    }, 180);
  });

  // Enter finaliza a busca na hora, sem esperar o debounce
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      e.preventDefault();
      clearTimeout(debounceId);
      estadoCatalogo.busca = input.value;
      renderizarGrid();
      input.blur();
    }
    if (e.key === 'Escape'){
      input.value = '';
      btnLimpar.hidden = true;
      estadoCatalogo.busca = '';
      renderizarGrid();
    }
  });

  btnLimpar.addEventListener('click', () => {
    input.value = '';
    btnLimpar.hidden = true;
    estadoCatalogo.busca = '';
    renderizarGrid();
    input.focus();
  });
}

/* ---------- menu mobile (drawer) ---------- */
function montarMenuMobile(){
  const toggle = document.getElementById('menuToggle');
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');

  toggle.addEventListener('click', () => {
    const estaAberto = drawer.classList.contains('open');
    if (estaAberto) fecharDrawer(); else abrirDrawerMenu();
  });

  backdrop.addEventListener('click', fecharDrawer);
}

function abrirDrawerMenu(){
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const toggle = document.getElementById('menuToggle');
  empilharEstadoOverlay();
  drawer.classList.add('open');
  backdrop.classList.add('open');
  toggle.setAttribute('aria-expanded', 'true');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/* Apenas esconde o menu visualmente (usada pelo handler de popstate) */
function ocultarDrawerMenu(){
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const toggle = document.getElementById('menuToggle');
  drawer.classList.remove('open');
  backdrop.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* Fecha o menu a pedido do usuário (X, clique fora). Mesma lógica do modal
   e do carrinho: se o overlay estiver no histórico, usa history.back(). */
function fecharDrawer(){
  if (overlayEstaNoHistorico()){
    history.back();
  } else {
    ocultarDrawerMenu();
  }
}

/* ---------- scroll reveal ---------- */
function ativarScrollReveal(){
  const alvos = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)){
    alvos.forEach(el => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  alvos.forEach(el => observer.observe(el));
}

/* ==========================================================
   CARD DE PRODUTO NA VITRINE
   ========================================================== */
function cardHTML(produto){
  const mensagem = CONFIG.mensagemBase(produto);
  const href = linkWhatsapp(mensagem);
  const temPromo = produto.precoPromocional !== null && produto.precoPromocional !== undefined;
  const semEstoque = produto.estoque === false;

  const precoHTML = temPromo
    ? `<span class="tag-price-riscado">${formatarPreco(produto.preco)}</span>
       <span class="tag-price tag-price-promo">${formatarPreco(produto.precoPromocional)}</span>`
    : `<span class="tag-price">${formatarPreco(produto.preco)}</span>`;

  return `
    <article class="card ${semEstoque ? 'card-esgotado' : ''}" data-id="${produto.id}">
      <div class="card-media" data-abrir-produto="${produto.id}">
        ${produto.novidade && !semEstoque ? '<span class="badge">Novo</span>' : ''}
        ${temPromo && !semEstoque ? '<span class="badge badge-promo">Promoção</span>' : ''}
        ${semEstoque ? '<span class="badge badge-esgotado">Esgotado</span>' : ''}
        <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
        <div class="tag" tabindex="0">
          <div class="tag-body">
            ${precoHTML}
            ${semEstoque
              ? `<span class="tag-cta tag-cta-desabilitado">Esgotado</span>`
              : `<button class="tag-cta tag-cta-carrinho" data-add-carrinho="${produto.id}">Adicionar ao carrinho</button>`
            }
          </div>
        </div>
      </div>
      <div class="card-info" data-abrir-produto="${produto.id}">
        <p class="card-category">${produto.categoria}</p>
        <h3 class="card-name">${produto.nome}</h3>
        <p class="card-desc">${produto.descricao}</p>
      </div>
    </article>
  `;
}

function renderizarGrid(){
  const grid = document.getElementById('grid');
  const { categoria, busca } = estadoCatalogo;
  const termoNormalizado = normalizarTexto(busca);

  let lista = categoria === "Todos"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.categoria === categoria);

  lista = lista.filter(p => produtoCasaComBusca(p, termoNormalizado));

  document.getElementById('itemCount').textContent =
    `${lista.length} ${lista.length === 1 ? 'peça' : 'peças'}`;

  if (lista.length === 0){
    const mensagem = busca
      ? `Nenhum resultado para "${escaparHTML(busca)}"${categoria !== 'Todos' ? ` em ${escaparHTML(categoria)}` : ''}.`
      : 'Nenhuma peça encontrada nessa categoria por enquanto.';
    grid.innerHTML = `<div class="empty-state">${mensagem}</div>`;
    return;
  }

  grid.innerHTML = lista.map(cardHTML).join('');

  // ao trocar filtro/busca, os novos cards entram com uma leve cascata
  requestAnimationFrame(() => {
    grid.querySelectorAll('.card').forEach((card, i) => {
      setTimeout(() => card.classList.add('in-view'), i * 45);
    });
  });
}

function montarFooter(){
  const mensagem = `Olá! Vim pelo site da ${CONFIG.nomeLoja} e queria tirar uma dúvida.`;
  const link = linkWhatsapp(mensagem);
  document.getElementById('footerWhatsapp').href = link;
  document.getElementById('drawerWhatsapp').href = link;
  document.getElementById('year').textContent = new Date().getFullYear();
}

/* ==========================================================
   MODAL DE PRODUTO
   ========================================================== */
let tamanhoSelecionado = null;
let corSelecionada = null;

function produtoModalHTML(produto){
  const galeria = (produto.imagens && produto.imagens.length ? produto.imagens : [produto.imagem]);
  const temPromo = produto.precoPromocional !== null && produto.precoPromocional !== undefined;
  const semEstoque = produto.estoque === false;

  const miniaturas = galeria.map((img, i) => `
    <button class="galeria-thumb ${i === 0 ? 'ativa' : ''}" data-thumb="${i}" aria-label="Ver foto ${i + 1}">
      <img src="${img}" alt="${produto.nome} - foto ${i + 1}" loading="lazy">
    </button>
  `).join('');

  const tamanhos = (produto.tamanhos || []).map(t => `
    <button class="tamanho-chip" data-tamanho="${t}">${t}</button>
  `).join('');

  const cores = Array.isArray(produto.cor) ? produto.cor : (produto.cor ? [produto.cor] : []);
  const coresHTML = cores.length > 1 ? cores.map(c => `
    <button class="cor-chip" data-cor="${c}">${c}</button>
  `).join('') : '';

  const precoHTML = temPromo
    ? `<span class="produto-preco-riscado">${formatarPreco(produto.preco)}</span>
       <span class="produto-preco produto-preco-promo">${formatarPreco(produto.precoPromocional)}</span>`
    : `<span class="produto-preco">${formatarPreco(produto.preco)}</span>`;

  return `
    <div class="produto-galeria">
      <div class="produto-galeria-principal">
        ${semEstoque ? '<span class="badge badge-esgotado produto-badge-esgotado">Esgotado</span>' : ''}
        <img id="galeriaImagemPrincipal" src="${galeria[0]}" alt="${produto.nome}">
      </div>
      ${galeria.length > 1 ? `<div class="galeria-thumbs">${miniaturas}</div>` : ''}
    </div>
    <div class="produto-info">
      <p class="produto-categoria">${produto.categoria}</p>
      <h2 class="produto-nome" id="produtoModalNome">${produto.nome}</h2>
      <p class="produto-preco-linha">${precoHTML}</p>

      ${cores.length === 1 ? `<p class="produto-atributo"><span>Cor:</span> ${cores[0]}</p>` : ''}

      ${coresHTML ? `
        <div class="produto-cores">
          <span class="produto-atributo-label">Cor:</span>
          <div class="cores-lista" id="coresLista">${coresHTML}</div>
        </div>
      ` : ''}

      ${produto.tamanhos && produto.tamanhos.length ? `
        <div class="produto-tamanhos">
          <span class="produto-atributo-label">Tamanho:</span>
          <div class="tamanhos-lista" id="tamanhosLista">${tamanhos}</div>
        </div>
      ` : ''}

      <p class="produto-descricao">${produto.descricaoDetalhada || produto.descricao}</p>

      ${semEstoque ? `
        <p class="produto-aviso produto-aviso-esgotado">Este produto está esgotado no momento.</p>
      ` : `
        <div class="produto-modal-acoes">
          <div class="produto-qtd" id="produtoQtdWrap">
            <button type="button" class="produto-qtd-btn" id="produtoQtdMenos" aria-label="Diminuir quantidade">−</button>
            <span class="produto-qtd-valor" id="produtoQtdValor">1</span>
            <button type="button" class="produto-qtd-btn" id="produtoQtdMais" aria-label="Aumentar quantidade">+</button>
          </div>
          <button class="produto-carrinho-btn magnetic" id="produtoAddCarrinhoBtn">Adicionar ao carrinho</button>
        </div>
        <a class="produto-comprar-btn" id="produtoComprarBtn" target="_blank" rel="noopener">
          Comprar direto no WhatsApp
        </a>
        <p class="produto-aviso" id="produtoAviso"></p>
      `}
    </div>
  `;
}

function atualizarLinkCompra(produto){
  const btn = document.getElementById('produtoComprarBtn');
  if (!btn) return;

  let mensagem = `Oi! Quero comprar:\n• ${produto.nome} — ${formatarPreco(precoAtual(produto))}`;
  if (tamanhoSelecionado) mensagem += `\nTamanho: ${tamanhoSelecionado}`;
  if (corSelecionada || (produto.cor && !Array.isArray(produto.cor))) {
    mensagem += `\nCor: ${corSelecionada || produto.cor}`;
  }
  mensagem += `\n\nPode me passar as formas de pagamento e frete?`;

  btn.href = linkWhatsapp(mensagem);
}

/* ---------- controle de histórico para overlays (modal de produto / carrinho) ----------
   No mobile, o botão "voltar" do navegador precisa fechar o modal ou o carrinho
   que estiver aberto em vez de sair do site inteiro. Para isso, ao abrir um
   overlay empilhamos um estado no histórico do navegador; o botão "voltar" então
   apenas consome esse estado (dispara popstate) e nós fechamos o overlay nessa hora,
   em vez de deixar o navegador seguir para a página anterior. */
function overlayEstaNoHistorico(){
  return !!(history.state && history.state.labellyOverlay);
}

function empilharEstadoOverlay(){
  if (!overlayEstaNoHistorico()){
    history.pushState({ labellyOverlay: true }, '');
  }
}

function fecharOverlaysAtivos(){
  const modal = document.getElementById('produtoModal');
  const drawer = document.getElementById('cartDrawer');
  const menu = document.getElementById('mobileDrawer');
  if (modal && modal.classList.contains('open')) ocultarProdutoModal();
  if (drawer && drawer.classList.contains('open')) ocultarCarrinho();
  if (menu && menu.classList.contains('open')) ocultarDrawerMenu();
}

window.addEventListener('popstate', () => {
  if (!overlayEstaNoHistorico()) fecharOverlaysAtivos();
});

function abrirProdutoModal(id){
  const produto = PRODUCTS.find(p => p.id === Number(id));
  if (!produto) return;

  tamanhoSelecionado = null;
  corSelecionada = Array.isArray(produto.cor) ? null : produto.cor;
  let quantidadeModal = 1;

  const modal = document.getElementById('produtoModal');
  const conteudo = document.getElementById('produtoModalConteudo');
  conteudo.innerHTML = produtoModalHTML(produto);

  // troca de foto na galeria
  conteudo.querySelectorAll('.galeria-thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      const galeria = produto.imagens && produto.imagens.length ? produto.imagens : [produto.imagem];
      document.getElementById('galeriaImagemPrincipal').src = galeria[Number(btn.dataset.thumb)];
      conteudo.querySelectorAll('.galeria-thumb').forEach(t => t.classList.remove('ativa'));
      btn.classList.add('ativa');
    });
  });

  const avisoEl = document.getElementById('produtoAviso');

  // seleção de tamanho
  conteudo.querySelectorAll('.tamanho-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      conteudo.querySelectorAll('.tamanho-chip').forEach(c => c.classList.remove('selecionado'));
      chip.classList.add('selecionado');
      tamanhoSelecionado = chip.dataset.tamanho;
      if (avisoEl) avisoEl.textContent = '';
      atualizarLinkCompra(produto);
    });
  });

  // seleção de cor (quando há mais de uma opção)
  conteudo.querySelectorAll('.cor-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      conteudo.querySelectorAll('.cor-chip').forEach(c => c.classList.remove('selecionado'));
      chip.classList.add('selecionado');
      corSelecionada = chip.dataset.cor;
      if (avisoEl) avisoEl.textContent = '';
      atualizarLinkCompra(produto);
    });
  });

  // controle de quantidade (só existe se o produto tem estoque)
  const qtdValorEl = document.getElementById('produtoQtdValor');
  const qtdMenosBtn = document.getElementById('produtoQtdMenos');
  const qtdMaisBtn = document.getElementById('produtoQtdMais');
  if (qtdMenosBtn && qtdMaisBtn){
    qtdMenosBtn.addEventListener('click', () => {
      quantidadeModal = Math.max(1, quantidadeModal - 1);
      qtdValorEl.textContent = quantidadeModal;
    });
    qtdMaisBtn.addEventListener('click', () => {
      quantidadeModal = quantidadeModal + 1;
      qtdValorEl.textContent = quantidadeModal;
    });
  }

  // validação obrigatória de tamanho/cor antes de comprar ou adicionar
  function validarSelecao(){
    if (produto.tamanhos && produto.tamanhos.length && !tamanhoSelecionado){
      if (avisoEl) avisoEl.textContent = 'Escolha um tamanho antes de continuar.';
      return false;
    }
    if (Array.isArray(produto.cor) && produto.cor.length && !corSelecionada){
      if (avisoEl) avisoEl.textContent = 'Escolha uma cor antes de continuar.';
      return false;
    }
    return true;
  }

  const comprarBtn = document.getElementById('produtoComprarBtn');
  if (comprarBtn){
    comprarBtn.addEventListener('click', (e) => {
      if (!validarSelecao()) e.preventDefault();
    });
  }

  const addCarrinhoBtn = document.getElementById('produtoAddCarrinhoBtn');
  if (addCarrinhoBtn){
    addCarrinhoBtn.addEventListener('click', () => {
      if (!validarSelecao()) return;
      adicionarAoCarrinho(produto, quantidadeModal, tamanhoSelecionado, corSelecionada);
      if (avisoEl) avisoEl.textContent = 'Adicionado ao carrinho!';
      setTimeout(() => { if (avisoEl) avisoEl.textContent = ''; }, 1800);
    });
  }

  atualizarLinkCompra(produto);

  empilharEstadoOverlay();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/* Apenas esconde o modal visualmente (usada pelo handler de popstate) */
function ocultarProdutoModal(){
  const modal = document.getElementById('produtoModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* Fecha o modal a pedido do usuário (botão X, clique fora, Esc). Se o overlay
   ainda estiver empilhado no histórico, "desfaz" esse estado com history.back(),
   o que dispara o popstate e esconde o modal — assim o botão "voltar" físico do
   celular também some pela mesma "porta" que o X do modal. */
function fecharProdutoModal(){
  if (overlayEstaNoHistorico()){
    history.back();
  } else {
    ocultarProdutoModal();
  }
}

function montarModalProduto(){
  document.getElementById('produtoModalFechar').addEventListener('click', fecharProdutoModal);
  document.getElementById('produtoModalBackdrop').addEventListener('click', fecharProdutoModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharProdutoModal();
  });

  // delegação: qualquer clique num elemento com data-abrir-produto abre o modal
  document.getElementById('grid').addEventListener('click', (e) => {
    if (e.target.closest('.tag')) return; // clique na etiqueta não abre o modal
    const alvo = e.target.closest('[data-abrir-produto]');
    if (alvo) abrirProdutoModal(alvo.dataset.abrirProduto);
  });
}

/* Roda cada etapa de inicialização isoladamente: se uma falhar por algum motivo
   inesperado, as outras continuam funcionando normalmente (o site não trava por inteiro
   por causa de um problema pontual, como dado antigo salvo no navegador do cliente). */
function iniciar(nome, fn){
  try {
    fn();
  } catch (erro) {
    console.error(`Falha ao iniciar "${nome}":`, erro);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  iniciar('categorias', montarCategorias);
  iniciar('busca', montarBusca);
  iniciar('grid', () => renderizarGrid());
  iniciar('footer', montarFooter);
  iniciar('menu mobile', montarMenuMobile);
  iniciar('modal de produto', montarModalProduto);
  iniciar('carrinho', montarCarrinho);
  iniciar('scroll reveal', ativarScrollReveal);
});
