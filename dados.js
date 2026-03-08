// ========================================================
// 1. BANCO DE DADOS GLOBAL (O que você mudar aqui, muda para todas as clientes)
// ========================================================

const produtosIniciais = [
    {
        id: 1001,
        nome: "Bermuda Jeans Premium - Karol Mell",
        revenda: 89.90,
        precoAntigo: 120.00,
        img: "https://images.tcdn.com.br/img/img_prod/1128362/bermuda_jeans_feminina_ciclista_com_elastano_1669_1_02097e8865f3708451152d19266157f1.jpg",
        categoria: "Outlet",
        disponivel: true,
        estoque: 10,
        descricao: "Bermuda com elastano, veste super bem e modela o corpo.",
        tag: "EM ALTA"
    }
    // Para adicionar mais produtos, basta copiar o bloco acima e colar aqui embaixo.
];

const categoriasIniciais = ["Combos", "Outlet", "Perfumaria", "Cosméticos", "Skincare", "Corpo e Banho", "Cabelo", "Eletrônicos"];

const cuponsIniciais = [
    { nome: "BEMVINDA", pct: 10, ativo: true }
];

// ========================================================
// 2. VARIÁVEIS DE CONTROLE E SINCRONIZAÇÃO
// ========================================================

let produtos = [];
let cart = [];
let favoritos = [];
let cupons = [];
let bannerUrl = "";

function sincronizarDados() {
    try {
        // PRODUTOS, CATEGORIAS E CUPONS: Agora vêm deste arquivo (Globais)
        produtos = produtosIniciais;
        cupons = cuponsIniciais;
        
        // CARRINHO E FAVORITOS: Continuam vindo do navegador da cliente (Individuais)
        favoritos = (JSON.parse(localStorage.getItem('meu_catalogo_favs')) || []).map(String);
        cart = (JSON.parse(localStorage.getItem('meu_catalogo_cart')) || []);
        
        // BANNER E CONFIGURAÇÕES DA LOJA:
        bannerUrl = localStorage.getItem('meu_catalogo_banner') || "";
        
        if(typeof aplicarNomesLoja === 'function') aplicarNomesLoja();
        if(typeof renderCategoriasModal === 'function') renderCategoriasModal();

    } catch (e) {
        console.error("Erro crítico ao sincronizar dados:", e);
    }
}

// Inicializa a carga de dados
sincronizarDados();

// --- FUNÇÕES DE PERSISTÊNCIA ---
function salvarCarrinho() {
    localStorage.setItem('meu_catalogo_cart', JSON.stringify(cart));
}

function salvarFavoritos() {
    localStorage.setItem('meu_catalogo_favs', JSON.stringify(favoritos));
}

// Esta função agora serve para você testar no seu navegador antes de levar para o GitHub
function salvarDados() {
    localStorage.setItem('meu_catalogo_dados', JSON.stringify(produtos));
}
