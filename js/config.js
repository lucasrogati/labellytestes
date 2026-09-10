/* ==========================================================
   CONFIGURAÇÕES DA LOJA — La Belly
   Edite só este arquivo para trocar o nome da loja, o número
   de WhatsApp, o Instagram ou o slogan usado no site.
   ========================================================== */
const CONFIG = {
  nomeLoja: "La Belly",
  slogan: "Bem-estar íntimo e sensualidade com elegância",

  // Formato: 55 + DDD + número, só números, sem espaço/traço/parênteses
  whatsappNumber: "5513997338148",

  instagramUrl: "https://instagram.com/la_belly.__013",
  instagramHandle: "@la_belly.__013",

  // Mensagem enviada ao clicar em "Comprar no WhatsApp" de um produto único
  mensagemBase: (produto) =>
    `Olá! Vim pelo site da La Belly e quero comprar: *${produto.nome}* (${formatarPreco(precoAtual(produto))}).`
};
