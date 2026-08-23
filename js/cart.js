/* ==========================================================
   CARRINHO DE COMPRAS — La Belly
   Guarda os itens no LocalStorage do navegador, então o
   carrinho continua lá mesmo se a página for recarregada.
   Não depende de banco de dados nem servidor.
   ========================================================== */

const CARRINHO_STORAGE_KEY = 'labelly_carrinho';

/* Gera uma chave única por combinação de produto + tamanho + cor,
   para que "Baby-Doll M Bege" e "Baby-Doll G Bege" sejam itens
   separados no carrinho. */
function chaveItemCarrinho(produtoId, tamanho, cor){
  return `${produtoId}__${tamanho || '-'}__${cor || '-'}`;
}

function lerCarrinho(){
  let itens;
  try {
    const dados = localStorage.getItem(CARRINHO_STORAGE_KEY);
    itens = dados ? JSON.parse(dados) : [];
    if (!Array.isArray(itens)) itens = [];
  } catch (erro) {
    console.warn('Não foi possível ler o carrinho salvo:', erro);
    return [];
  }

  // Descarta itens salvos em formato antigo/incompleto (ex: de uma versão anterior
  // do site), pra nunca travar a página com um preço ou nome ausente.
  const itensValidos = itens.filter(item =>
    item &&
    typeof item.chave === 'string' &&
    typeof item.nome === 'string' &&
    typeof item.preco === 'number' && !Number.isNaN(item.preco) &&
    typeof item.quantidade === 'number' && item.quantidade > 0
  );

  if (itensValidos.length !== itens.length){
    console.warn('Carrinho salvo continha itens em formato antigo — foram removidos automaticamente.');
    salvarCarrinho(itensValidos);
  }

  return itensValidos;
}

function salvarCarrinho(itens){
  try {
    localStorage.setItem(CARRINHO_STORAGE_KEY, JSON.stringify(itens));
  } catch (erro) {
    console.warn('Não foi possível salvar o carrinho:', erro);
  }
}

function adicionarAoCarrinho(produto, quantidade, tamanho, cor){
  const itens = lerCarrinho();
  const chave = chaveItemCarrinho(produto.id, tamanho, cor);
  const existente = itens.find(i => i.chave === chave);

  if (existente){
    existente.quantidade += quantidade;
  } else {
    itens.push({
      chave,
      produtoId: produto.id,
      nome: produto.nome,
      preco: precoAtual(produto),
      imagem: produto.imagem,
      tamanho: tamanho || null,
      cor: cor || null,
      quantidade
    });
  }

  salvarCarrinho(itens);
  atualizarContadorCarrinho();
  renderizarCarrinho();
  abrirCarrinho();
}

function alterarQuantidadeCarrinho(chave, delta){
  const itens = lerCarrinho();
  const item = itens.find(i => i.chave === chave);
  if (!item) return;

  item.quantidade += delta;

  const itensFinal = item.quantidade <= 0
    ? itens.filter(i => i.chave !== chave)
    : itens;

  salvarCarrinho(itensFinal);
  atualizarContadorCarrinho();
  renderizarCarrinho();
}

function removerDoCarrinho(chave){
  const itens = lerCarrinho().filter(i => i.chave !== chave);
  salvarCarrinho(itens);
  atualizarContadorCarrinho();
  renderizarCarrinho();
}

function limparCarrinho(){
  salvarCarrinho([]);
  atualizarContadorCarrinho();
  renderizarCarrinho();
}

function totalItensCarrinho(itens){
  return itens.reduce((soma, i) => soma + i.quantidade, 0);
}

function subtotalCarrinho(itens){
  return itens.reduce((soma, i) => soma + (i.preco * i.quantidade), 0);
}

function atualizarContadorCarrinho(){
  const itens = lerCarrinho();
  const total = totalItensCarrinho(itens);
  const contador = document.getElementById('cartCount');
  if (!contador) return;

  contador.textContent = total;
  contador.hidden = total === 0;
}

function itemCarrinhoHTML(item){
  const detalhes = [item.tamanho, item.cor].filter(Boolean).join(' · ');

  return `
    <div class="cart-item" data-chave="${item.chave}">
      <img class="cart-item-img" src="${item.imagem}" alt="${item.nome}" loading="lazy">
      <div class="cart-item-info">
        <p class="cart-item-nome">${item.nome}</p>
        ${detalhes ? `<p class="cart-item-detalhes">${detalhes}</p>` : ''}
        <p class="cart-item-preco">${formatarPreco(item.preco)}</p>
        <div class="cart-item-qtd">
          <button type="button" class="cart-qtd-btn" data-qtd-menos="${item.chave}" aria-label="Diminuir quantidade">−</button>
          <span class="cart-qtd-valor">${item.quantidade}</span>
          <button type="button" class="cart-qtd-btn" data-qtd-mais="${item.chave}" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <button type="button" class="cart-item-remover" data-remover="${item.chave}" aria-label="Remover item">✕</button>
    </div>
  `;
}

function renderizarCarrinho(){
  const itens = lerCarrinho();
  const lista = document.getElementById('cartLista');
  const vazio = document.getElementById('cartVazio');
  const rodape = document.getElementById('cartRodape');
  const subtotalEl = document.getElementById('cartSubtotal');
  const finalizarBtn = document.getElementById('cartFinalizar');

  if (!lista) return;

  if (itens.length === 0){
    lista.innerHTML = '';
    vazio.hidden = false;
    rodape.hidden = true;
    return;
  }

  vazio.hidden = true;
  rodape.hidden = false;

  lista.innerHTML = itens.map(itemCarrinhoHTML).join('');

  const subtotal = subtotalCarrinho(itens);
  subtotalEl.textContent = formatarPreco(subtotal);
  finalizarBtn.href = linkWhatsappCarrinho(itens, subtotal);

  // eventos de quantidade e remoção (delegação simples, refeita a cada render)
  lista.querySelectorAll('[data-qtd-menos]').forEach(btn => {
    btn.addEventListener('click', () => alterarQuantidadeCarrinho(btn.dataset.qtdMenos, -1));
  });
  lista.querySelectorAll('[data-qtd-mais]').forEach(btn => {
    btn.addEventListener('click', () => alterarQuantidadeCarrinho(btn.dataset.qtdMais, 1));
  });
  lista.querySelectorAll('[data-remover]').forEach(btn => {
    btn.addEventListener('click', () => removerDoCarrinho(btn.dataset.remover));
  });
}

function linkWhatsappCarrinho(itens, subtotal){
  const linhas = itens.map(item => {
    const detalhes = [];
    if (item.tamanho) detalhes.push(`Tamanho: ${item.tamanho}`);
    if (item.cor) detalhes.push(`Cor: ${item.cor}`);
    const detalhesTexto = detalhes.length ? ` (${detalhes.join(', ')})` : '';
    return `• ${item.nome} — ${formatarPreco(item.preco)}${detalhesTexto} x${item.quantidade}`;
  });

  const mensagem =
    `Oi! Quero fazer um pedido na ${CONFIG.nomeLoja}:\n\n` +
    linhas.join('\n') +
    `\n\nTotal: ${formatarPreco(subtotal)}` +
    `\n\nPode me passar as formas de pagamento e o frete?`;

  return linkWhatsapp(mensagem);
}

/* ---------- abrir/fechar o drawer do carrinho ---------- */
function abrirCarrinho(){
  const drawer = document.getElementById('cartDrawer');
  const toggle = document.getElementById('cartToggle');
  empilharEstadoOverlay();
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  if (toggle) toggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

/* Apenas esconde o carrinho visualmente (usada pelo handler de popstate) */
function ocultarCarrinho(){
  const drawer = document.getElementById('cartDrawer');
  const toggle = document.getElementById('cartToggle');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* Fecha o carrinho a pedido do usuário (botão X, clique fora, "continuar
   comprando"). Se o overlay ainda estiver empilhado no histórico, "desfaz"
   esse estado com history.back() — assim o botão "voltar" físico do celular
   fecha o carrinho em vez de sair do site. */
function fecharCarrinho(){
  if (overlayEstaNoHistorico()){
    history.back();
  } else {
    ocultarCarrinho();
  }
}

function montarCarrinho(){
  const toggle = document.getElementById('cartToggle');
  const fechar = document.getElementById('cartFechar');
  const backdrop = document.getElementById('cartBackdrop');
  const limpar = document.getElementById('cartLimpar');
  const continuar = document.getElementById('cartContinuar');
  const continuarVazio = document.getElementById('cartContinuarVazio');

  toggle.addEventListener('click', () => {
    const estaAberto = document.getElementById('cartDrawer').classList.contains('open');
    if (estaAberto) fecharCarrinho(); else abrirCarrinho();
  });
  fechar.addEventListener('click', fecharCarrinho);
  backdrop.addEventListener('click', fecharCarrinho);
  continuar.addEventListener('click', fecharCarrinho);
  continuarVazio.addEventListener('click', fecharCarrinho);

  limpar.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar o carrinho?')){
      limparCarrinho();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharCarrinho();
  });

  // Delegação: clique em "Adicionar ao carrinho" direto no card da vitrine
  document.getElementById('grid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-carrinho]');
    if (!btn) return;
    e.stopPropagation();
    const produto = PRODUCTS.find(p => p.id === Number(btn.dataset.addCarrinho));
    if (!produto) return;

    // Se o produto exige tamanho ou tem mais de uma cor, manda pro modal
    // pra garantir que a escolha seja feita antes de ir pro carrinho.
    const exigeEscolha = (produto.tamanhos && produto.tamanhos.length) ||
                          (Array.isArray(produto.cor) && produto.cor.length > 1);
    if (exigeEscolha){
      abrirProdutoModal(produto.id);
      return;
    }

    const cor = Array.isArray(produto.cor) ? null : produto.cor;
    adicionarAoCarrinho(produto, 1, null, cor);
  });

  atualizarContadorCarrinho();
  renderizarCarrinho();
}
