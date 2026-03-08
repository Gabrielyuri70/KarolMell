let idProdutoEmEdicao = null;
let categorias = JSON.parse(localStorage.getItem('meu_catalogo_categorias')) || ["Combos", "Outlet", "Perfumaria", "Cosméticos", "Skincare", "Corpo e Banho", "Cabelo", "Eletrônicos", "Streamings", "IPTV"];

// --- FUNÇÃO DE LOGIN PROTEGIDA ---
function validateLogin() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    const btn = document.querySelector('.btn-primary-pro');
    
    if(!btn) return;

    btn.innerText = "Validando...";
    
    // Credenciais mascaradas (KarolMell e 231KarolA)
    const creds = {
        u: "S2Fyb2xNZWxs",
        p: "MjMxS2Fyb2xB"
    };

    setTimeout(() => {
        // Compara os dados usando btoa() para converter o que foi digitado
        if(btoa(u) === creds.u && btoa(p) === creds.p) {
            sessionStorage.setItem('isAdmin', 'true');
            window.location.href = 'admin.html';
        } else {
            alert('Acesso negado: Usuário ou senha incorretos.');
            btn.innerText = "Entrar no Painel";
            document.getElementById('pass').value = ''; // Limpa a senha por segurança
        }
    }, 800);
}

// --- GESTÃO DE PRODUTOS ---
function renderAdminList() {
    const adminList = document.getElementById('admin-product-list');
    if (!adminList) return;
    adminList.innerHTML = '';

    produtos.forEach((p) => {
        const item = document.createElement('div');
        const isCritical = p.estoque <= 0;
        
        // NOVO: Identifica se a imagem consome os 5MB (Base64) ou se é leve (Link)
        const isPesada = p.img && p.img.startsWith('data:image');
        const iconImagem = isPesada 
            ? '<span style="color: #ff4d4f; font-weight: bold;">⚠️ Foto</span>' 
            : '<span style="color: #52c41a; font-weight: bold;">✅ Link</span>';

        item.className = isCritical ? "stock-critical" : "";
        item.style = `display: flex; align-items: center; gap: 15px; background: #fff; padding: 12px; border-radius: 18px; margin-bottom: 10px; border: 1px solid #eee; ${isCritical ? 'border-color:#ff4d4f;' : ''}`;
        
        item.innerHTML = `
            <img src="${p.img}" style="width: 45px; height: 45px; object-fit: contain; border-radius: 8px;">
            <div style="flex: 1;">
                <div style="font-size: 0.8rem; font-weight: 800;">${p.nome}</div>
                <div style="font-size: 0.7rem; color: #888;">
                    Estoque: <span style="${isCritical ? 'color:#ff4d4f; font-weight:bold;' : ''}">${p.estoque}</span> | ${p.disponivel ? 'Ativo' : 'Pausado'}
                </div>
                <div style="font-size: 0.65rem; color: #999; margin-top: 2px;">
                    Espaço: ${iconImagem}
                </div>
                <div style="font-size: 0.8rem; color: var(--primary); font-weight: 700; margin-top: 2px;">${p.revenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            </div>
            <div style="display:flex; gap: 8px;">
            <button onclick="compartilharProduto(${p.id})" style="background:none; border:none; color:#25d366;"><i data-lucide="share-2" size="18"></i></button>
                <button onclick="prepararEdicao(${p.id})" style="background:none; border:none; color:#d4af37;"><i data-lucide="edit-3" size="18"></i></button>
                <button onclick="toggleDisponibilidade(${p.id})" style="background:none; border:none; color: ${p.disponivel ? '#25d366' : '#ff4d4f'}"><i data-lucide="${p.disponivel ? 'eye' : 'eye-off'}" size="18"></i></button>
                <button onclick="removerProduto(${p.id})" style="background:none; border:none; color:#ff4d4f;"><i data-lucide="trash-2" size="18"></i></button>
            </div>
        `;
        adminList.appendChild(item);
    });

    if (window.lucide) lucide.createIcons();
}

function adicionarProduto() {
    const nome = document.getElementById('adm-nome').value;
    const marca = document.getElementById('adm-marca').value;
    const categoria = document.getElementById('adm-categoria').value.trim();
const tag = document.getElementById('adm-tag').value.trim(); // Nova linha
const precoAntigo = parseFloat(document.getElementById('adm-preco-de').value) || 0;
    const preco = parseFloat(document.getElementById('adm-preco').value);
    const estoque = parseInt(document.getElementById('adm-estoque').value) || 0;
    const descricao = document.getElementById('adm-desc').value;
    const urlImg = document.getElementById('adm-img').value;
    const linkPagamento = document.getElementById('adm-link-pag').value; 
    const ofertaAte = document.getElementById('adm-oferta-ate').value; 
    const Destaque = document.getElementById('adm-destaque').checked;

    const finalImg = (typeof imageBase64 !== 'undefined' && imageBase64) ? imageBase64 : urlImg;

    if (!nome || !preco || !finalImg || !categoria) {
        return alert("Preencha Nome, Preço, Categoria e Imagem!");
    }

    const novoProduto = {
        nome, 
        marca, 
        categoria, 
        precoAntigo, 
        tag,
        revenda: preco,
        custo: parseFloat(document.getElementById('adm-custo').value) || 0,
        estoque, 
        descricao, 
        img: finalImg, 
        linkPagamento, 
        ofertaAte, 
        destaque: Destaque,
        disponivel: true
    };

        if (Destaque) {
        // Se marcou o quadradinho, salva APENAS na lista separada de destaques
        let destaquesSalvos = JSON.parse(localStorage.getItem('meu_catalogo_destaques')) || [];
        destaquesSalvos.push({ id: Date.now(), ...novoProduto });
        localStorage.setItem('meu_catalogo_destaques', JSON.stringify(destaquesSalvos));
        alert("Adicionado apenas aos Destaques! ✨");
    } else {
        // Se NÃO marcou, salva na lista normal de produtos
        if (typeof idProdutoEmEdicao !== 'undefined' && idProdutoEmEdicao !== null) {
            const index = produtos.findIndex(p => p.id === idProdutoEmEdicao);
            if (index !== -1) {
                produtos[index] = { ...produtos[index], ...novoProduto, id: idProdutoEmEdicao };
            }
            idProdutoEmEdicao = null;
        } else {
            produtos.push({ id: Date.now(), ...novoProduto });
        }
        salvarDados();
        alert("Produto salvo no catálogo! ✅");
    }

    renderAdminList();
    renderAdminDestaques();
    limparFormulario();

    if (typeof atualizarMedidorEspaco === 'function') {
        atualizarMedidorEspaco();
    }
}
function prepararEdicao(id) {
    const p = produtos.find(prod => prod.id === id);
    if(!p) return;
    idProdutoEmEdicao = id;
    
    document.getElementById('form-title').innerText = "Editando Item ✨";
    document.getElementById('upload-container').classList.add('editing');
    document.getElementById('btn-cancelar-edit').classList.remove('hidden');

    document.getElementById('adm-nome').value = p.nome;
    document.getElementById('adm-marca').value = p.marca;
    document.getElementById('adm-categoria').value = p.categoria;
document.getElementById('adm-tag').value = p.tag || ''; // Nova linha
document.getElementById('adm-preco-de').value = p.precoAntigo || '';
    document.getElementById('adm-preco').value = p.revenda;
    document.getElementById('adm-estoque').value = p.estoque;
    document.getElementById('adm-desc').value = p.descricao;
    document.getElementById('adm-img').value = (p.img && p.img.startsWith('data:')) ? '' : p.img;
    document.getElementById('adm-link-pag').value = p.linkPagamento || ''; 
    document.getElementById('adm-oferta-ate').value = p.ofertaAte || ''; 
    document.getElementById('adm-custo').value = p.custo || 0;
calcularLucroReal();
    document.getElementById('btn-salvar-texto').innerText = "Confirmar Alterações";
document.querySelector('.btn-save').style.background = "#d4af37"; // Muda para dourado ao editar
window.scrollTo({top: 0, behavior: 'smooth'});
}

function toggleDisponibilidade(id) {
    const index = produtos.findIndex(p => p.id === id);
    produtos[index].disponivel = !produtos[index].disponivel;
    salvarDados();
    renderAdminList();
}

function removerProduto(id) {
    const produto = produtos.find(p => p.id === id);
    const nome = produto ? produto.nome : "este produto";
    
    if(confirm(`⚠️ ATENÇÃO: Deseja excluir o produto "${nome}" que custa ${produto.revenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}?`)) {
        produtos = produtos.filter(p => p.id !== id);
        salvarDados();
        renderAdminList();
        renderAdminDestaques();
        atualizarMedidorEspaco();
    }
}
function renderAdminDestaques() {
    const list = document.getElementById('admin-destaques-list');
    if(!list) return;

    // MUDANÇA AQUI: Agora ele lê a gaveta exclusiva de destaques
    const itensDestaque = JSON.parse(localStorage.getItem('meu_catalogo_destaques')) || [];

    if(itensDestaque.length === 0) {
        list.innerHTML = '<p style="font-size: 0.75rem; color: #bbb; text-align: center; padding: 20px;">Nenhum item em destaque no momento.</p>';
        return;
    }

    list.innerHTML = '';
    itensDestaque.forEach(p => {
        list.innerHTML += `
            <div style="display: flex; align-items: center; gap: 10px; background: #fff; padding: 8px; border-radius: 12px; margin-bottom: 8px; border: 1px solid #ffeaa7;">
                <img src="${p.img}" style="width: 30px; height: 30px; object-fit: cover; border-radius: 6px;">
                <div style="flex: 1; font-size: 0.75rem; font-weight: 700; color: #333;">${p.nome}</div>
                <button onclick="removerDestaque(${p.id})" style="background: none; border: none; color: #ff4d4f; cursor: pointer;">
                    <i data-lucide="star-off" style="width: 16px;"></i>
                </button>
            </div>`;
    });
    if (window.lucide) lucide.createIcons();
}
function removerDestaque(id) {
    let destaques = JSON.parse(localStorage.getItem('meu_catalogo_destaques')) || [];
    
    if(confirm("Deseja remover este item dos destaques?")) {
        // Filtra para manter apenas os itens que NÃO tem esse ID
        destaques = destaques.filter(p => p.id !== id);
        
        // Salva a lista limpa de volta
        localStorage.setItem('meu_catalogo_destaques', JSON.stringify(destaques));
        
        renderAdminDestaques(); 
        alert("Removido dos destaques!");
    }
}
// --- GESTÃO DE CUPONS ---
function renderAdminCupons() {
    const list = document.getElementById('admin-coupon-list');
    if(!list) return;
    list.innerHTML = '';
    cupons.forEach(c => {
        list.innerHTML += `
            <div style="background:#f8f9fa; padding:10px; border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border:1px solid #eee;">
                <div style="font-size:0.8rem;"><strong>${c.nome}</strong> (${c.pct}%)<br><small>${c.ativo ? '✅ Ativo' : '❌ Inativo'}</small></div>
                <div style="display:flex; gap:8px;">
                    <button onclick="toggleStatusCupom('${c.nome}')" style="background:none; border:none; color:var(--primary); font-size:0.7rem; font-weight:800;">${c.ativo ? 'Finalizar' : 'Ativar'}</button>
                    <button onclick="removerCupom('${c.nome}')" style="background:none; border:none; color:red;"><i data-lucide="trash-2" size="16"></i></button>
                </div>
            </div>`;
    });
    lucide.createIcons();
}

function salvarCupom() {
    const nome = document.getElementById('adm-cupom-nome').value.trim().toUpperCase();
    const pct = parseFloat(document.getElementById('adm-cupom-pct').value);
    if(!nome || isNaN(pct)) return alert("Preencha o código e a porcentagem!");

    const index = cupons.findIndex(c => c.nome === nome);
    if(index > -1) cupons[index] = { nome, pct, ativo: true };
    else cupons.push({ nome, pct, ativo: true });

    salvarCupons();
    renderAdminCupons();
    alert("Cupom salvo!");
}

function toggleStatusCupom(nome) {
    const index = cupons.findIndex(c => c.nome === nome);
    cupons[index].ativo = !cupons[index].ativo;
    salvarCupons();
    renderAdminCupons();
}

function removerCupom(nome) {
    if(confirm(`Deseja remover o cupom de desconto "${nome}"?`)) {
        cupons = cupons.filter(c => c.nome !== nome);
        salvarCupons();
        renderAdminCupons();
    }
}

function limparFormulario() {
    document.querySelectorAll('.input-adm').forEach(i => i.value = '');
    const fileInput = document.getElementById('adm-file');
    if(fileInput) fileInput.value = '';
    const preview = document.getElementById('preview-img');
    if(preview) preview.style.display = 'none';
    document.getElementById('adm-custo').value = '';
document.getElementById('valor-lucro').innerText = 'R$ 0,00';
document.getElementById('porcentagem-lucro').innerText = '(0%)';
    document.getElementById('form-title').innerText = "Novo Produto ou Combo";
    document.getElementById('upload-container').classList.remove('editing');
    const cancelBtn = document.getElementById('btn-cancelar-edit');
    if(cancelBtn) cancelBtn.classList.add('hidden');

    imageBase64 = "";
    idProdutoEmEdicao = null;
    const btnTexto = document.getElementById('btn-salvar-texto');
    if(btnTexto) btnTexto.innerText = "Adicionar ao Catálogo";
}

// --- BANNER E BACKUP ---
function ajustarPreviewBanner(valor) {
    const preview = document.getElementById('preview-banner');
    if(preview) {
        preview.style.height = valor + "px";
        preview.style.display = 'block';
    }
}

function carregarBannerAtual() {
    const preview = document.getElementById('preview-banner');
    const inputUrl = document.getElementById('adm-banner-url');
    const inputHeight = document.getElementById('adm-banner-height');
    
    const bannerSalvo = localStorage.getItem('meu_catalogo_banner');
    const alturaSalva = localStorage.getItem('meu_catalogo_banner_height');

    if (bannerSalvo && preview) {
        preview.src = bannerSalvo;
        preview.style.display = 'block';
        preview.style.height = (alturaSalva || "200") + "px";
        preview.style.objectFit = "cover";
        
        if(inputUrl && !bannerSalvo.startsWith('data:')) inputUrl.value = bannerSalvo;
        if(inputHeight) inputHeight.value = alturaSalva || "200";
    }
}

function atualizarBanner() {
    const inputUrl = document.getElementById('adm-banner-url').value;
    const novaAltura = document.getElementById('adm-banner-height').value;
    const finalBannerUrl = (typeof imageBase64 !== 'undefined' && imageBase64) ? imageBase64 : inputUrl;

    if(!finalBannerUrl) {
        return alert("Insira um link ou envie uma imagem para o banner!");
    }

    localStorage.setItem('meu_catalogo_banner', finalBannerUrl);
    localStorage.setItem('meu_catalogo_banner_height', novaAltura);
    
    alert("Banner atualizado com sucesso!");
    carregarBannerAtual(); 
    if(typeof atualizarMedidorEspaco === 'function') atualizarMedidorEspaco();
}

function removerBanner() {
    if(confirm("Deseja remover o banner da loja?")) {
        localStorage.removeItem('meu_catalogo_banner');
        localStorage.removeItem('meu_catalogo_banner_height');
        
        // Isso limpa a imagem da sua tela no Admin
        const preview = document.getElementById('preview-banner');
        if(preview) {
            preview.src = "";
            preview.style.display = 'none';
        }
        
        // Isso limpa o campo de texto do link
        const inputUrl = document.getElementById('adm-banner-url');
        if(inputUrl) inputUrl.value = "";
        
        alert("Banner removido!");
        if(typeof atualizarMedidorEspaco === 'function') atualizarMedidorEspaco();
    }
}
function exportarDados() {
    const backup = { produtos, cupons, banner: localStorage.getItem('meu_catalogo_banner'), height: localStorage.getItem('meu_catalogo_banner_height'), data: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_karolmell.json`;
    a.click();
    alert("Backup baixado com sucesso!");
}

function importarDados(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if(dados.produtos) {
                produtos = dados.produtos;
                cupons = dados.cupons || [];
                if(dados.banner) localStorage.setItem('meu_catalogo_banner', dados.banner);
                if(dados.height) localStorage.setItem('meu_catalogo_banner_height', dados.height);
                salvarDados();
                salvarCupons();
                alert("Dados importados com sucesso!");
                location.reload();
            }
        } catch (err) { alert("Erro ao ler arquivo de backup."); }
    };
    reader.readAsText(file);
}

// --- LÓGICA DO MEDIDOR DE MEMÓRIA ---
function atualizarMedidorEspaco() {
    let total = 0;
    for (let x in localStorage) {
        if (localStorage.hasOwnProperty(x)) {
            total += ((localStorage[x].length + x.length) * 2);
        }
    }
    
    const totalMB = (total / 1024 / 1024).toFixed(2);
    const limiteMB = 5; 
    const percent = Math.min(((totalMB / limiteMB) * 100), 100).toFixed(1);

    const bar = document.getElementById('storage-bar');
    const percentText = document.getElementById('storage-percent');
    const descText = document.getElementById('storage-text');

    if(bar && percentText && descText) {
        bar.style.width = percent + "%";
        percentText.innerText = percent + "%";
        descText.innerText = `${totalMB}MB de ${limiteMB}MB usados`;

        if (percent > 85) bar.style.background = "#ff4d4f"; 
        else if (percent > 50) bar.style.background = "#ffa940"; 
        else bar.style.background = "var(--primary)"; 
    }
}

// Função que verifica segurança APENAS se estiver no arquivo admin.html
function verificarSeguranca() {
    const estaNoAdmin = window.location.pathname.includes('admin.html');
    const estaLogado = sessionStorage.getItem('isAdmin') === 'true';

    // Só bloqueia se tentar entrar no admin sem ter feito login
    if (estaNoAdmin && !estaLogado) {
        alert("Acesso restrito! Por favor, faça login na tela inicial.");
        window.location.href = 'index.html';
    }
}
function logoutAdmin() {
    if(confirm("Deseja realmente sair do painel administrativo?")) {
        sessionStorage.removeItem('isAdmin'); // Remove a permissão
        window.location.href = 'index.html';    // Volta para o início
    }
}
// Evento de carregamento da página
window.addEventListener('load', () => {
    verificarSeguranca(); // Roda a checagem inteligente
    
    atualizarMedidorEspaco();
    if(window.location.pathname.includes('admin.html')) {
        renderAdminList();
        renderAdminCupons();
        renderAdminDestaques();
        carregarBannerAtual();
        renderAdminCategorias();
        carregarCamposConfig();
    }
});
if (typeof salvarDados === 'function') {
    const originalSalvarDados = salvarDados;
    window.salvarDados = function() {
        originalSalvarDados();
        atualizarMedidorEspaco();
    };
}

// --- FUNÇÕES DOS BOTÕES DE FILTRO E LIMPEZA ---
function filtrarEsgotados() {
    const btn = document.getElementById('btn-filtro-esgotados');
    if (!btn) return;

    const isFiltrado = btn.getAttribute('data-filtrado') === 'true';

    if (isFiltrado) {
        btn.innerHTML = '<i data-lucide="search" style="width: 14px;"></i> Ver Esgotados';
        btn.style.background = '#f0f0f0';
        btn.setAttribute('data-filtrado', 'false');
        renderAdminList(); 
    } else {
        const esgotados = produtos.filter(p => Number(p.estoque) <= 0);
        
        if (esgotados.length === 0) {
            alert("Não há produtos esgotados no catálogo!");
            return;
        }

        btn.innerHTML = '<i data-lucide="x" style="width: 14px;"></i> Mostrar Todos';
        btn.style.background = '#e6f7ff'; 
        btn.setAttribute('data-filtrado', 'true');

        const adminList = document.getElementById('admin-product-list');
        adminList.innerHTML = '';
        
        const listaOriginal = [...produtos];
        produtos = esgotados;
        renderAdminList(); 
        produtos = listaOriginal; 
    }
    if (window.lucide) lucide.createIcons();
}

function limparEsgotadosConfirmacao() {
    const esgotados = produtos.filter(p => Number(p.estoque) <= 0);
    
    if (esgotados.length === 0) {
        alert("Não há nada para limpar. Todos os produtos têm estoque!");
        return;
    }

    const confirmacao = confirm(`🚨 AÇÃO IRREVERSÍVEL:\n\nVocê está prestes a apagar ${esgotados.length} produtos esgotados.\n\nDeseja continuar?`);
    
    if (confirmacao) {
        produtos = produtos.filter(p => Number(p.estoque) > 0);
        salvarDados(); 
        renderAdminList();
        alert("Limpeza concluída com sucesso!");
    }
}
function compartilharProduto(id) {
    const p = produtos.find(prod => prod.id === id);
    if(!p) return;

    const precoFormatado = p.revenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Montando a mensagem (o %0A serve para pular linha no WhatsApp)
    const texto = `✨ *Olha essa novidade na Karol Mell!* ✨%0A%0A` +
                  `🛍️ *${p.nome}*%0A` +
                  `💰 Por apenas: *${precoFormatado}*%0A%0A` +
                  `👇 *Compre aqui:*%0A${p.linkPagamento || 'Consulte disponibilidade'}`;

    // Abre o WhatsApp
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
}
function calcularLucroReal() {
    const custo = parseFloat(document.getElementById('adm-custo').value) || 0;
    const venda = parseFloat(document.getElementById('adm-preco').value) || 0;
    const lucroValor = venda - custo;
    const lucroPorcentagem = custo > 0 ? (lucroValor / custo) * 100 : 0;

    document.getElementById('valor-lucro').innerText = lucroValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('porcentagem-lucro').innerText = `(${lucroPorcentagem.toFixed(0)}% de margem)`;
}
// --- GESTÃO DINÂMICA DE CATEGORIAS ---
function renderAdminCategorias() {
    const list = document.getElementById('admin-categorias-list');
    const select = document.getElementById('adm-categoria');
    if(!list || !select) return;

    list.innerHTML = '';
    select.innerHTML = '<option value="">Selecione a Categoria</option>';

    categorias.forEach(cat => {
        list.innerHTML += `
            <div style="background: #eee; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                ${cat}
                <i data-lucide="x" onclick="removerCategoria('${cat}')" style="width: 14px; cursor: pointer; color: #ff4d4f;"></i>
            </div>`;
        select.innerHTML += `<option value="${cat}">${cat}</option>`;
    });

    if (window.lucide) lucide.createIcons();
}
function adicionarNovaCategoria() {
    const input = document.getElementById('nova-categoria-nome');
    const nome = input.value.trim();
    if(!nome) return alert("Digite o nome da categoria!");
    if(categorias.includes(nome)) return alert("Essa categoria já existe!");
    
    categorias.push(nome);
    localStorage.setItem('meu_catalogo_categorias', JSON.stringify(categorias));
    
    input.value = ''; // Limpa o campo
    renderAdminCategorias(); // Atualiza a lista na tela
}

function removerCategoria(nome) {
    if(confirm(`Deseja remover a categoria "${nome}"?`)) {
        categorias = categorias.filter(c => c !== nome);
        localStorage.setItem('meu_catalogo_categorias', JSON.stringify(categorias));
        renderAdminCategorias();
    }
}
function salvarConfiguracoesLoja() {
    // Pegando os valores dos inputs
    const nomeCurto = document.getElementById('cfg-nome-curto').value.trim();
    const nomeCompleto = document.getElementById('cfg-nome-completo').value.trim();

    if(!nomeCurto || !nomeCompleto) {
        return alert("Por favor, preencha os dois campos antes de salvar!");
    }

    // Salva no LocalStorage
    localStorage.setItem('loja_nome_curto', nomeCurto);
    localStorage.setItem('loja_nome_completo', nomeCompleto);

    alert("Configurações salvas com sucesso! ✨");
    
    // Tenta atualizar na tela na hora
    if(typeof aplicarNomesLoja === 'function') {
        aplicarNomesLoja();
    }
    
    // Recarrega para validar todas as instâncias
    location.reload(); 
}
function carregarCamposConfig() {
    const nomeCurtoSalvo = localStorage.getItem('loja_nome_curto') || "KAROL MELL";
    const nomeCompletoSalvo = localStorage.getItem('loja_nome_completo') || "Cosméticos e Variedades";
    
    const campoCurto = document.getElementById('cfg-nome-curto');
    const campoCompleto = document.getElementById('cfg-nome-completo');
    
    if(campoCurto) campoCurto.value = nomeCurtoSalvo;
    if(campoCompleto) campoCompleto.value = nomeCompletoSalvo;

    // ESSA LINHA ABAIXO É A CHAVE: Ela avisa o script.js para atualizar os nomes na tela agora
    if(typeof aplicarNomesLoja === 'function') aplicarNomesLoja();
}

