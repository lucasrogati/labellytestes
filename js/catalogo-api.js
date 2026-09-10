/* Carregamento público: Supabase quando disponível; catálogo local como fallback seguro. */
window.carregarCatalogo = async function(){
  const modo = (window.APP_CONFIG && window.APP_CONFIG.CATALOGO_MODE) || 'auto';
  if (modo === 'fallback' || !window.supabaseClient) {
    console.info('[La Belly] Catálogo local em uso. Configure js/app-config.js para usar Supabase.');
    return { fonte: 'fallback' };
  }
  try {
    const [produtosResposta, categoriasResposta] = await Promise.all([
      window.supabaseClient.from('produtos_publicos')
      .select('id,nome,categoria,preco,preco_promocional,descricao,descricao_detalhada,tamanhos,cores,estoque,novidade,destaque,imagem,imagens,ordem')
      .order('ordem', { ascending: true }),
      window.supabaseClient.from('categorias').select('id,nome,descricao,imagem_capa,ordem').eq('ativa', true).order('ordem', { ascending: true })
    ]);
    const { data, error } = produtosResposta;
    if (error || categoriasResposta.error) throw (error || categoriasResposta.error);
    window.CATEGORIAS_REMOTAS = categoriasResposta.data || [];
    if (!Array.isArray(data) || !data.length) throw new Error('Nenhum produto público retornado.');
    PRODUCTS = data.map(p => ({
      id: p.id, nome: p.nome, categoria: p.categoria, preco: Number(p.preco),
      precoPromocional: p.preco_promocional == null ? null : Number(p.preco_promocional),
      descricao: p.descricao || '', descricaoDetalhada: p.descricao_detalhada || '',
      tamanhos: Array.isArray(p.tamanhos) ? p.tamanhos : [],
      cor: Array.isArray(p.cores) ? p.cores : (p.cores || ''), estoque: p.estoque !== false,
      novidade: !!p.novidade, destaque: !!p.destaque,
      imagem: p.imagem || 'images/placeholder-1.svg',
      imagens: Array.isArray(p.imagens) && p.imagens.length ? p.imagens : [p.imagem || 'images/placeholder-1.svg']
    }));
    return { fonte: 'supabase' };
  } catch (err) {
    console.warn('[La Belly] Falha ao carregar Supabase; fallback local usado.', err.message);
    if (modo === 'supabase') console.warn('[La Belly] Modo supabase foi solicitado, mas o fallback protegeu a vitrine.');
    return { fonte: 'fallback', erro: err.message };
  }
};
