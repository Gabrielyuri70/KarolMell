// 1. Declaramos as variáveis globalmente (sem valor inicial aqui para não bugar)

let produtos = [];

let cart = [];

let favoritos = [];

let cupons = [];

let bannerUrl = "";



// --- CENTRALIZANDO A CARGA DE DADOS ---

function sincronizarDados() {

try {

// Buscamos tudo do LocalStorage de uma vez

produtos = JSON.parse(localStorage.getItem('meu_catalogo_dados')) || [];

favoritos = (JSON.parse(localStorage.getItem('meu_catalogo_favs')) || []).map(String);

cart = JSON.parse(localStorage.getItem('meu_catalogo_cart')) || [];

bannerUrl = localStorage.getItem('meu_catalogo_banner') || "";


cupons = JSON.parse(localStorage.getItem('meu_catalogo_cupons')) || [];

// Adicione esta linha para garantir que os nomes da loja e categorias carreguem junto

if(typeof aplicarNomesLoja === 'function') aplicarNomesLoja();

if(typeof renderCategoriasModal === 'function') renderCategoriasModal();



} catch (e) {

console.error("Erro crítico ao sincronizar LocalStorage:", e);

}

}



// 2. Chamamos a função IMEDIATAMENTE após ela ser definida

sincronizarDados();



// --- FUNÇÕES DE PERSISTÊNCIA (Mantenha como estão) ---

function salvarDados() {

localStorage.setItem('meu_catalogo_dados', JSON.stringify(produtos));

}

// ... restante das funções de salvar seguem iguais
