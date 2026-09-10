/*
  ==========================================================
  CATÁLOGO DE PRODUTOS — La Belly
  ==========================================================
  Este é o ÚNICO arquivo que você precisa editar para
  adicionar, remover ou alterar produtos no site.

  COMO ADICIONAR UM PRODUTO:
  Copie um bloco { ... } inteiro (de uma chave { até a chave
  correspondente }), cole antes do "];" no final do arquivo,
  e troque os valores.

  COMO REMOVER UM PRODUTO:
  Apague o bloco { ... } inteiro dele (incluindo a vírgula
  no final do bloco anterior, se ele virar o último item).

  CAMPOS:
  id                 -> número único (não repita)
  nome               -> nome do produto
  categoria          -> usada nos filtros (ex: "Vestidos", "Blusas")
  preco              -> número, use ponto para centavos (ex: 129.90)
  imagem             -> foto principal (aparece no card da vitrine)
  imagens            -> lista de fotos da galeria (aparece ao clicar
                        no produto). Pode repetir a mesma foto se
                        ainda não tiver mais de uma.
  descricao          -> frase curta que aparece no card da vitrine
  descricaoDetalhada -> texto mais completo, aparece na página do
                        produto (tecido, caimento, cuidados etc.)
  tamanhos           -> lista dos tamanhos disponíveis, ex: ["P","M","G"]
  cor                -> cor(es) da peça, texto livre (ex: "Terracota")
  novidade           -> true ou false (mostra a etiqueta "NOVO")
  precoPromocional   -> número com o preço em promoção, ou null se não
                        houver promoção. Quando preenchido, o site mostra
                        o preço antigo riscado e o promocional em destaque.
                        Ex: 79.90  (ou null)
  estoque            -> true ou false. Quando false, o produto aparece
                        marcado como "Esgotado" e o botão de compra fica
                        desabilitado.
  destaque           -> true ou false. Produtos com destaque: true podem
                        futuramente aparecer em uma vitrine especial.
  ==========================================================
*/

const PRODUCTS = [
  {
    id: 1,
    nome: "Baby-Doll Bege",
    categoria: "Conjuntos",
    preco: 95.90,
    imagem: "images/babydoll.bege.png",
    imagens: ["images/babydoll.bege.png", "images/babydoll_bege2.png", "images/babydoll_bege3.png"],
    descricao: "Baby Doll com detalhes em renda, lindo e confortavel.",
    descricaoDetalhada: "Baby doll feminino que combina conforto, delicadeza e estilo em uma única peça. Com tecido macio e modelagem confortável, proporciona liberdade de movimento e um toque agradável ao corpo. Ideal para suas noites de sono e momentos de descanso, é uma peça essencial para quem valoriza bem-estar e elegância até na hora de dormir.",
    tamanhos: ["P", "M", "G"],
    cor: "Bege",
    novidade: true,
    precoPromocional: 79.90,
    estoque: true,
    destaque: true
  },
  {
    id: 2,
    nome: "Baby-Doll Preto",
    categoria: "Conjuntos",
    preco: 95.90,
    imagem: "images/babydoll.png",
    imagens: ["images/babydoll.png", "images/babydoll_preto1.png", "images/babydoll_preto2.png"],
    descricao: "Baby Doll com detalhes em renda, lindo e confortavel.",
    descricaoDetalhada: "Baby doll feminino que combina conforto, delicadeza e estilo em uma única peça. Com tecido macio e modelagem confortável, proporciona liberdade de movimento e um toque agradável ao corpo. Ideal para suas noites de sono e momentos de descanso, é uma peça essencial para quem valoriza bem-estar e elegância até na hora de dormir.",
    tamanhos: ["P", "M", "G"],
    cor: "Preto",
    novidade: true,
    precoPromocional: null,
    estoque: true,
    destaque: false
  },
  {
    id: 3,
    nome: "Baby-Doll Vermelho",
    categoria: "Conjuntos",
    preco: 99.90,
    imagem: "images/babydoll_vermelho.png",
    imagens: ["images/babydoll_vermelho.png", "images/babydollvermelho.png", "images/babydoll_vermelho2.png"],
    descricao: "Baby Doll com detalhes em renda, lindo e confortavel.",
    descricaoDetalhada: "Baby doll feminino que combina conforto, delicadeza e estilo em uma única peça. Com tecido macio e modelagem confortável, proporciona liberdade de movimento e um toque agradável ao corpo. Ideal para suas noites de sono e momentos de descanso, é uma peça essencial para quem valoriza bem-estar e elegância até na hora de dormir.",
    tamanhos: ["PP", "P", "M", "G"],
    cor: "Vermelho",
    novidade: true,
    precoPromocional: null,
    estoque: true,
    destaque: false
  },
  {
    id: 4,
    nome: "Lubrificante Sexy Hot",
    categoria: "Utensílios",
    preco: 159.90,
    imagem: "images/bglhai.png",
    imagens: ["images/bglhai.png", "images/bglhloko.png"],
    descricao: "Lubrificante Sexy Hot Back Door.",
    descricaoDetalhada: "Lubrificante 'Back Door' (porta dos fundos), perfeito pra quem quer apimentar a relação sem dor.",
    tamanhos: ["15g - 0.5oz"],
    cor: "preto",
    novidade: true,
    precoPromocional: null,
    estoque: true,
    destaque: false
  },
  {
    id: 5,
    nome: "Preservativo Masculino Olla",
    categoria: "Utensílios",
    preco: 139.90,
    imagem: "images/bglhcamisa.png",
    imagens: ["images/bglhcamisa.png", "images/bglhcamisa1.png"],
    descricao: "Preservativo masculino Olla Sensitive.",
    descricaoDetalhada: "Preservativo Sensitive, feito de forma que se possa sentir tudo, mas sem abster da segurança na hora H.",
    tamanhos: ["Tamanho unico"],
    cor: "Transparente",
    novidade: true,
    precoPromocional: null,
    estoque: true,
    destaque: false
  },
  {
    id: 6,
    nome: "Calcinha de Renda",
    categoria: "Peças Íntimas",
    preco: 329.90,
    imagem: "images/calcinhafio.png",
    imagens: ["images/calcinhafio.png", "images/calcinha.png", "images/calcinha1.png"],
    descricao: "Calcinha de Renda, diversas cores e tamanhos.",
    descricaoDetalhada: "Calcinha de renda com tecido de qualidade, beleza e sensualidade sem abandonar o conforto.",
    tamanhos: ["P", "M", "G", "GG"],
    cor: ["Preto", "Azul", "Bege", "Rosa", "Amarelo"],
    novidade: true,
    precoPromocional: null,
    estoque: true,
    destaque: false
  },
  {
    id: 7,
    nome: "Sutiã",
    categoria: "Peças Íntimas",
    preco: 79.90,
    imagem: "images/sutia.png",
    imagens: ["images/sutia.png"],
    descricao: "Conforto e Beleza, feito pra comportar o melhor dos dois mundos.",
    descricaoDetalhada: "Sutiã de cores e tamanhos variados, tecido de qualidade sem abrir mão de deixar você bonita.",
    tamanhos: ["PP", "P", "M", "G"],
    cor: ["Preto", "Azul", "Vermelho"],
    novidade: false,
    precoPromocional: null,
    estoque: true,
    destaque: false
  },
];
