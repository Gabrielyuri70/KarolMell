let cupomAplicado = null; 
let currentFilter = 'todos';
function sincronizarDados() {
    // 1. Lê a lista global que você editou no dados.js
    produtos = (typeof produtosIniciais !== 'undefined') ? produtosIniciais : [];
    
    // 2. Mantém favoritos e carrinho individuais por cliente
    favoritos = (JSON.parse(localStorage.getItem('meu_catalogo_favs')) || []).map(String);
    cart = JSON.parse(localStorage.getItem('meu_catalogo_cart')) || [];
    
    // 3. Lê cupons e categorias globais do dados.js
    cupons = (typeof cuponsIniciais !== 'undefined') ? cuponsIniciais : [];
    const categorias = (typeof categoriasIniciais !== 'undefined') ? categoriasIniciais : [];
    
    aplicarNomesLoja();
    if(typeof renderCategoriasModal === 'function') renderCategoriasModal();
}
window.onload = function() {
    // 1. PRIMEIRO BUSCAMOS OS DADOS (Para evitar que as coisas sumam)
    sincronizarDados(); 

    // 2. DEPOIS EXECUTAMOS O RESTANTE
    if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    updateThemeIcon();
    aplicarNomesLoja();
    renderTestimonials();
    checkBanner();
    atualizarContadorFavoritos();
    
    setInterval(updateTimers, 1000);
    checkNotificationsBadge();
    
    const cartCountEl = document.getElementById('cart-count');
    if(cartCountEl) cartCountEl.innerText = (cart && cart.length) ? cart.length : 0;
    
    if(window.location.pathname.includes('admin.html')) {
        if(sessionStorage.getItem('isAdmin') !== 'true') {
            window.location.href = 'index.html';
        }
        renderAdminList();
        renderAdminCupons();
    }
}
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function accessAsClient() {
    sincronizarDados(); // <--- AQUI: Garante que os dados do Admin sejam carregados
    document.getElementById('screen-gate').classList.add('hidden');
    document.getElementById('screen-app').classList.remove('hidden');
    render();
}

// NOVO: Função para Sair do Catálogo
function logoutClient() {
    document.getElementById('screen-app').classList.add('hidden');
    document.getElementById('screen-gate').classList.remove('hidden');
    document.getElementById('gate-login').classList.add('hidden');
    document.getElementById('gate-options').classList.remove('hidden');
    currentFilter = 'todos';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
    sincronizarDados(); // <--- AQUI: Atualiza a lista antes de filtrar e mostrar na tela
    
    const grid = document.getElementById('product-grid');
    const destaquesGrid = document.getElementById('destaques-grid');
    const destaquesSection = document.getElementById('destaques-section');
    
    if (!grid) return;
    
    if (typeof checkBanner === "function") checkBanner();

    grid.innerHTML = '<div class="card skeleton" style="height:220px"></div>'.repeat(4);
    // ... restante do código continua igual


    setTimeout(() => {
        grid.innerHTML = '';
        if(destaquesGrid) destaquesGrid.innerHTML = '';

        // 2. Filtra os produtos
        let list = produtos.filter(p => p.disponivel);
                const chipContainer = document.getElementById('main-chips');
        if (chipContainer) {
            const catsAdmin = JSON.parse(localStorage.getItem('meu_catalogo_categorias')) || ["Combos", "Outlet", "Perfumaria", "Cosméticos", "Skincare", "Corpo e Banho", "Cabelo", "Eletrônicos", "Streamings", "IPTV"];
            
            // Emojis para os botões do topo
            const emojis = { 'Combos': '🔥', 'Outlet': '🏷️', 'Perfumaria': '💎', 'Skincare': '💧', 'Cosméticos': '💄', 'Cabelos': '✂️', 'Cabelo': '✂️', 'Corpo e Banho': '🧼' };

            chipContainer.innerHTML = `<button class="category-chip ${currentFilter === 'todos' ? 'active' : ''}" onclick="filtrarCategoria('todos')">✨ Tudo</button>`;
            
            catsAdmin.forEach(cat => {
                const emoji = emojis[cat] || '📦';
                const isActive = currentFilter.toLowerCase() === cat.toLowerCase();
                chipContainer.innerHTML += `<button class="category-chip ${isActive ? 'active' : ''}" onclick="filtrarCategoria('${cat}')">${emoji} ${cat}</button>`;
            });
        }
        if (currentFilter === 'favs') {
            list = list.filter(p => favoritos.includes(String(p.id)));
        } else if (currentFilter !== 'todos') {
            list = list.filter(p => 
                (p.categoria && p.categoria.toLowerCase() === currentFilter.toLowerCase()) || 
                (p.marca && p.marca.toLowerCase() === currentFilter.toLowerCase())
            );
        }

        // 3. Renderiza os Destaques (Carrossel Horizontal - Tamanho Ajustado)
        if (currentFilter === 'todos' && destaquesSection && destaquesGrid) {
            const destaques = JSON.parse(localStorage.getItem('meu_catalogo_destaques')) || [];
            
            if (destaques.length > 0) {
                destaquesSection.classList.remove('hidden');
                destaquesGrid.innerHTML = '';
                destaquesGrid.style = "display: flex; overflow-x: auto; gap: 12px; padding: 10px 5px; scrollbar-width: none; -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory;";

                destaques.forEach(p => {
                    destaquesGrid.innerHTML += `
                        <div class="card-destaque" onclick="openDetails(${p.id})" style="flex: 0 0 160px; min-width: 160px; scroll-snap-align: start;">
                            <img src="${p.img}" alt="${p.nome}" style="width: 100%; height: 160px; object-fit: contain; background: transparent; border-radius: 15px;">
                            <div class="destaque-info" style="padding: 8px 0;">
                                <h4 style="font-size: 0.8rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.nome}</h4>
                                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <div class="price" style="font-size: 0.9rem; font-weight: 700;">${p.revenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                                    <button class="btn-share-client" onclick="event.stopPropagation(); compartilharProdutoCliente(${p.id})" style="background:none; border:none; color:var(--primary); cursor:pointer; padding:2px; display:flex; align-items:center;">
                                        <i data-lucide="share-2" style="width: 13px; height: 13px;"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });

                // REFAZ AS BOLINHAS (INDICADOR)
                const oldIndicator = destaquesSection.querySelector('.scroll-indicator');
                if (oldIndicator) oldIndicator.remove();

                if (destaques.length > 1) {
                    const indicator = document.createElement('div');
                    indicator.className = "scroll-indicator";
                    indicator.style = "display: flex; justify-content: center; gap: 5px; margin-top: 10px; margin-bottom: 20px;";
                    
                    const dotsCount = Math.min(destaques.length, 5); 
                    for (let i = 0; i < dotsCount; i++) {
                        const dot = document.createElement('div');
                        dot.className = i === 0 ? "dot dot-active" : "dot";
                        indicator.appendChild(dot);
                    }
                    destaquesSection.appendChild(indicator);
                }
            } else {
                destaquesSection.classList.add('hidden');
            }
          } else if (destaquesSection) {
            destaquesSection.classList.add('hidden');
        }
        if(list.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px; color: #888;">Nenhum produto encontrado.</p>';
            return;
        }

        // 4. Renderiza a Grade Principal (ORGANIZADA POR GÊNERO)
        grid.innerHTML = ''; 

                        if (currentFilter === 'todos') {
            const categorias = [...new Set(list.map(p => p.categoria || 'Geral'))];

            categorias.forEach(cat => {
                let produtosDaCategoria = list.filter(p => (p.categoria || 'Geral') === cat);
                let quantidadeItens = produtosDaCategoria.length;

                // 1. Criar o Título e Botão Ver Todos
                const tituloContainer = document.createElement('div');
                tituloContainer.style = "grid-column: 1/-1; margin: 35px 15px 10px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px;";
                
                tituloContainer.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <h3 style="font-size: 0.85rem; color: var(--primary); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 900; display: flex; align-items: center; margin: 0;">
                            ${cat}
                        </h3>
                        <span style="font-size: 0.65rem; color: var(--gray-medium); font-weight: 600; padding-left: 2px;">
                            ${quantidadeItens} ${quantidadeItens === 1 ? 'item' : 'itens'}
                        </span>
                    </div>
                    ${quantidadeItens > 5 ? `
                    <button onclick="irParaCategoria('${cat}')" style="background: var(--primary); color: white; border: none; padding: 6px 14px; border-radius: 20px; font-size: 0.65rem; font-weight: 800; cursor: pointer; text-transform: uppercase; box-shadow: 0 4px 10px rgba(194, 24, 91, 0.2);">
                        Ver todos
                    </button>` : ''}
                `;
                grid.appendChild(tituloContainer);
                
                // 2. Criar o Container de Rolagem Horizontal (Carrossel)
                const rowContainer = document.createElement('div');
                rowContainer.className = "category-row-container";
                rowContainer.style = "grid-column: 1/-1;"; 
                
                // 3. Adiciona apenas os 5 primeiros produtos no carrossel
                produtosDaCategoria.slice(0, 5).forEach((p, index) => {
                    rowContainer.appendChild(gerarCardHTML(p, index));
                });

                grid.appendChild(rowContainer);

                // 4. ADICIONADO: Bolinhas indicadoras de rolagem
                if (quantidadeItens > 1) {
                    const indicator = document.createElement('div');
                    indicator.className = "scroll-indicator";
                    indicator.style = "grid-column: 1/-1;";
                    
                    // Mostra até 5 bolinhas para representar os itens
                    const dotsCount = Math.min(quantidadeItens, 5); 
                    for (let i = 0; i < dotsCount; i++) {
                        const dot = document.createElement('div');
                        // A primeira bolinha começa ativa (colorida)
                        dot.className = i === 0 ? "dot dot-active" : "dot";
                        indicator.appendChild(dot);
                    }
                    grid.appendChild(indicator);
                }
            });
        } else {
            // Quando estiver em uma categoria específica, volta para o grid normal (2 em 2)
            list.forEach((p, index) => {
                grid.appendChild(gerarCardHTML(p, index));
            });
        }

        if (window.lucide) lucide.createIcons();
    }, 400);
}

function toggleFav(id, event) {
    event.stopPropagation();
    const idStr = String(id);
    if(favoritos.includes(idStr)) {
        favoritos = favoritos.filter(f => f !== idStr);
    } else {
        favoritos.push(idStr);
    }
    localStorage.setItem('meu_catalogo_favs', JSON.stringify(favoritos));
    atualizarContadorFavoritos();
    render();
}

function openDetails(id) {
    let p = produtos.find(item => item.id == id);
    
    if (!p) {
        const destaques = JSON.parse(localStorage.getItem('meu_catalogo_destaques')) || [];
        p = destaques.find(item => item.id == id);
    }

    if(!p) return;
    const content = document.getElementById('details-content');
    // Guardamos o preço para o simulador usar depois
    const precoBase = parseFloat(p.revenda) || 0;

    content.innerHTML = `
        <img src="${p.img}" style="width:100%; height:250px; object-fit:contain; margin-bottom:15px;">
        <h2 style="font-weight:800; margin-bottom:5px;">${p.nome}</h2>
        <div class="price" style="font-size:1.5rem; color:var(--primary); font-weight:800;">${p.revenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
        <p style="margin:15px 0; font-size:0.9rem; color:#666; line-height:1.6;">${p.descricao || 'Sem descrição.'}</p>
        
        <div style="display:flex; flex-direction:column; gap:10px;">
            <button class="btn-checkout-final" style="background:var(--primary)" onclick="addToCart(${p.id}, event); closeDetails()">
                Adicionar à Sacola
            </button>
            
            <button onclick="toggleSimulador(${precoBase})" style="width: 100%; background: #009ee3; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
                <i data-lucide="calculator"></i> Simular Parcelamento
            </button>

            <div id="simulador-caixa" class="hidden" style="background: #f1f9ff; border: 2px solid #009ee3; border-radius: 15px; padding: 15px; margin-top: 5px;">
                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 10px;">
                    <img src="https://logospng.org/download/mercado-pago/logo-mercado-pago-icone-1024.png" style="width: 18px;">
                    <span style="font-size: 0.7rem; font-weight: 800; color: #009ee3;">TAXAS MERCADO PAGO</span>
                </div>
                <div id="lista-parcelas" style="display: flex; flex-direction: column; gap: 6px;"></div>
                <p style="color: #ff4d4f; font-size: 0.6rem; font-weight: 700; margin-top: 10px; text-align: center;">
                    * Valores aproximados para pagamentos via maquininha/link.
                </p>
            </div>

            ${p.linkPagamento ? `
                <a href="${p.linkPagamento}" target="_blank" class="btn-checkout-final" style="background:#009ee3; text-decoration:none; text-align:center; font-size:0.8rem; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:5px;">
                    <i data-lucide="credit-card"></i> Pagar Agora
                </a>
            ` : ''}
        </div>
    `;
    document.getElementById('modal-details').style.display = 'flex';
    lucide.createIcons();
}
function addToCart(id, event) {
    if(event) event.stopPropagation();
    const p = produtos.find(item => item.id == id);
    const qtyNoCart = cart.filter(item => item.id == id).length;
    
    if(p && p.estoque > qtyNoCart) {
        cart.push(p);
        salvarCarrinho();
        document.getElementById('cart-count').innerText = cart.length;
        
        const cartBtn = document.getElementById('main-cart-btn');
        if(cartBtn) {
            cartBtn.classList.add('cart-pop');
            setTimeout(() => cartBtn.classList.remove('cart-pop'), 300);
        }

        // --- INÍCIO DA ANIMAÇÃO DE VOO ---
        if (event && event.currentTarget) {
            animateFly(event.currentTarget, p.img);
        }
        // --- FIM DA ANIMAÇÃO DE VOO ---

        if(event && event.target && (event.target.classList.contains('btn-add-cart') || event.target.tagName === 'BUTTON')) {
            const btn = event.currentTarget;
            const originalText = btn.innerText;
            btn.innerText = "Adicionado! ✓";
            btn.style.background = "#25d366";
            btn.style.color = "white";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = "";
                btn.style.color = "";
            }, 1000);
        }
    } else {
        alert("Desculpe, limite de estoque atingido para este item!");
    }
}

// Nova função auxiliar para o efeito visual (cole abaixo da addToCart)
function animateFly(button, imgSrc) {
    // Localiza o ícone do carrinho pela ID específica dele
    const cartIcon = document.getElementById('main-cart-btn');
    if (!cartIcon || !button) return;

    // Criar o clone da imagem que vai voar
    const flyer = document.createElement('img');
    flyer.src = imgSrc;
    flyer.classList.add('flying-item');
    document.body.appendChild(flyer);

    // Pegar as coordenadas do clique e do destino
    const btnRect = button.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    // Posição inicial do voo
    flyer.style.left = `${btnRect.left + btnRect.width / 2 - 35}px`;
    flyer.style.top = `${btnRect.top + btnRect.height / 2 - 35}px`;

    // Dispara o movimento para o carrinho
    setTimeout(() => {
        flyer.style.left = `${cartRect.left + cartRect.width / 2 - 20}px`;
        flyer.style.top = `${cartRect.top + cartRect.height / 2 - 20}px`;
        flyer.style.width = '20px';
        flyer.style.height = '20px';
        flyer.style.opacity = '0.3';
        flyer.style.transform = 'rotate(360deg)';
    }, 50);

    // Remove o elemento após terminar a transição
    flyer.addEventListener('transitionend', () => {
        flyer.remove();
        // Efeito de pulo no ícone do carrinho ao "receber" o item
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => cartIcon.classList.remove('cart-bounce'), 400);
    });
}
function updateCartUI() {
    const list = document.getElementById('cart-items');
    if(!list) return;
    list.innerHTML = '';
    let subtotal = 0;
    
    if(cart.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:40px;"><p style="color:#aaa; font-weight:600;">Sua sacola está vazia 🛍️</p></div>`;
    } else {
        cart.forEach((item, index) => {
            subtotal += item.revenda;
            list.innerHTML += `
                <div class="cart-item">
                    <div style="flex:1">
                        <div class="cart-item-name">${item.nome}</div>
                        <div class="cart-item-price">${item.revenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    </div>
                    <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#ff4d4f; padding: 10px;"><i data-lucide="trash-2"></i></button>
                </div>`;
        });
    }

    const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
    const deliveryType = deliveryRadio ? deliveryRadio.value : 'retirada';
    const bairroSelect = document.getElementById('bairro-select');
    const bairroContainer = document.getElementById('bairro-select-container');
    
    let frete = 0;
    let freteTexto = "R$ 0,00";

    if(deliveryType === 'entrega') {
        if(bairroContainer) bairroContainer.classList.remove('hidden');
        const bairro = bairroSelect ? bairroSelect.value : 'oeiras';
        if(bairro === 'oeiras') {
            frete = 0;
            freteTexto = "Grátis (Oeiras)";
        } else {
            frete = 7.00;
            freteTexto = "R$ 7,00";
        }
        if(document.getElementById('delivery-row')) document.getElementById('delivery-row').classList.remove('hidden');
    } else {
        if(bairroContainer) bairroContainer.classList.add('hidden');
        if(document.getElementById('delivery-row')) document.getElementById('delivery-row').classList.add('hidden');
    }

    let desconto = 0;
    const discountRow = document.getElementById('discount-row');
    if(cupomAplicado) {
        desconto = subtotal * (cupomAplicado.pct / 100);
        if(discountRow) {
            discountRow.classList.remove('hidden');
            document.getElementById('discount-value').innerText = `- R$ ${desconto.toFixed(2)}`;
        }
    } else if(discountRow) {
        discountRow.classList.add('hidden');
    }

    const total = (subtotal - desconto) + frete;

    if(document.getElementById('sub-total')) document.getElementById('sub-total').innerText = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if(document.getElementById('cart-total')) document.getElementById('cart-total').innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if(document.getElementById('delivery-price')) document.getElementById('delivery-price').innerText = freteTexto;
    lucide.createIcons();
}

function applyCoupon() {
    const input = document.getElementById('coupon-input').value.trim().toUpperCase();
    if(!input) return;
    const cupom = cupons.find(c => c.nome === input && c.ativo);
    if(cupom) {
        cupomAplicado = cupom;
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#c2185b', '#d4af37', '#25d366'] });
        alert(`Cupom ${cupom.nome} de ${cupom.pct}% aplicado!`);
        updateCartUI();
    } else {
        alert("Cupom inválido ou expirado.");
        cupomAplicado = null;
        updateCartUI();
    }
}

function clearCart() {
    if(confirm("Deseja limpar todos os itens da sacola?")) {
        cart = [];
        salvarCarrinho();
        document.getElementById('cart-count').innerText = 0;
        updateCartUI();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    salvarCarrinho();
    document.getElementById('cart-count').innerText = cart.length;
    updateCartUI();
}

function sendOrderWhatsApp() {
    if (cart.length === 0) return alert("Sua sacola está vazia!");
    const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
    const deliveryType = deliveryRadio ? deliveryRadio.value : 'retirada';
    const bairroValue = document.getElementById('bairro-select')?.value || '';
    
    let mensagem = `*Novo Pedido - Karol Mell* 🛍️\n\n*Produtos:*\n`;
    cart.forEach(item => {
        mensagem += `• 1x ${item.nome} (${item.revenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})\n`;
    });

    const totalExibido = document.getElementById('cart-total').innerText;
    mensagem += `\n*Resumo do Pedido:*`;
    if (cupomAplicado) mensagem += `\nCupom: ${cupomAplicado.nome} (-${cupomAplicado.pct}%)`;
    mensagem += `\n*Total: ${totalExibido}*`;

    let entregaTexto = deliveryType === 'retirada' ? 'Retirada no Local' : `Entrega (${bairroValue})`;
    mensagem += `\n\n*Forma de Recebimento:* ${entregaTexto}`;

    const fone = "5591993770606";
    window.open(`https://wa.me/${fone}?text=${encodeURIComponent(mensagem)}`, '_blank');
}

function closeDetails() { document.getElementById('modal-details').style.display = 'none'; }
function openCategories() { document.getElementById('modal-categories').style.display = 'flex'; }
function closeCategories() { document.getElementById('modal-categories').style.display = 'none'; }
function openCart() { updateCartUI(); document.getElementById('cart-modal').style.display = 'flex'; }
function closeCart() { document.getElementById('cart-modal').style.display = 'none'; }

function toggleExtraMenu() {
    const m = document.getElementById('extra-menu');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
    lucide.createIcons();
}

// --- ÁREA DE FILTROS ATUALIZADA ---

function filterSearch() {
    const q = document.getElementById('search-input').value.toLowerCase().trim();
    const cards = document.querySelectorAll('.card');
    
    // Apenas manipula a visibilidade sem recarregar o banco de dados
    cards.forEach(c => {
        const h4 = c.querySelector('h4');
        if(!h4) return;
        const match = h4.innerText.toLowerCase().includes(q);
        c.style.display = match ? 'flex' : 'none';
    });
}
// NOVO: Função que o botão de funil (Select) chama no index.html
function handleQuickFilter(val) {
    const selectEl = document.getElementById('price-filter');
    
    if (val === "todos") {
        clearAllFilters();
        if(selectEl) selectEl.value = ""; // Reseta o ícone do select
    } else if (val !== "") {
        const [min, max] = val.split('-').map(Number);
        filterByPrice(min, max);
    }
}

function setFilter(el, filter) {
    currentFilter = filter;
    render();
    if(el) {
        document.querySelectorAll('.brand-chip, .category-chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
    }
}

function filterByPrice(min, max) {
    // Quando filtramos por preço, voltamos para a visão geral "todos"
    currentFilter = 'todos';
    render(); 
    
    setTimeout(() => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(c => {
            const priceEl = c.querySelector('.price');
            if(!priceEl) return;
            // Converte o texto "R$ 50,00" em número puro para comparar
            const price = parseFloat(priceEl.innerText.replace(/[^\d,]/g, '').replace(',', '.'));
            c.style.display = (price >= min && price <= max) ? 'flex' : 'none';
        });
        
        // Rola para o topo para ver os resultados
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
}

function clearAllFilters() {
    const searchInput = document.getElementById('search-input');
    const priceFilter = document.getElementById('price-filter');
    
    if(searchInput) searchInput.value = '';
    if(priceFilter) priceFilter.value = '';
    
    currentFilter = 'todos';
    render();
}
function checkBanner() {
    const bannerContainer = document.getElementById('promo-banner-container');
    const bannerImg = document.getElementById('banner-img');
    const bUrl = localStorage.getItem('meu_catalogo_banner');
    
    if(bannerContainer && bannerImg && bUrl) {
        // O banner só aparece se estivermos na aba "Tudo"
        if (currentFilter === 'todos') {
            bannerImg.src = bUrl;
            
            // Mantém suas configurações de altura do admin
            const salvaAltura = localStorage.getItem('meu_catalogo_banner_height') || "200";
            bannerImg.style.height = salvaAltura + "px";
            bannerImg.style.objectFit = "cover"; 
            
            bannerContainer.style.display = 'block';
        } else {
            // Esconde o banner em outras categorias para não atrapalhar
            bannerContainer.style.display = 'none';
        }
    } else if (bannerContainer) {
        bannerContainer.style.display = 'none';
    }
}
function renderTestimonials() {
    const list = document.getElementById('testimonials-list');
    if(!list) return;
    const items = [
        { n: "Julia M.", t: "Melior preço da cidade! 😍" },
        { n: "Aline R.", t: "Chegou super rápido, amei!" },
        { n: "Carla S.", t: "Atendimento nota 10." }
    ];
    list.innerHTML = items.map(i => `
        <div style="min-width:200px; background:var(--white); border:1px solid #eee; padding:15px; border-radius:20px; font-size:0.8rem;">
            <strong>${i.n}</strong>
            <p style="margin-top:5px;">${i.t}</p>
        </div>
    `).join('');
}

function showLogin() {
    document.getElementById('gate-options').classList.add('hidden');
    document.getElementById('gate-login').classList.remove('hidden');
}

function filtrarCategoria(slug) {
    currentFilter = slug;
    render();
    document.querySelectorAll('.category-chip, .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        const txt = btn.innerText.toLowerCase();
        if ((slug === 'todos' && (txt.includes('tudo') || txt.includes('início'))) || txt.includes(slug.toLowerCase())) {
            btn.classList.add('active');
        }
    });
}

function atualizarContadorFavoritos() {
    const countElement = document.getElementById('fav-count');
    if (!countElement) return;
    countElement.innerText = favoritos.length;
    countElement.style.display = favoritos.length > 0 ? 'flex' : 'none';
}

window.addEventListener('scroll', function() {
    const btn = document.getElementById('btn-top');
    if (!btn) return;
    if (window.scrollY > 400) {
        btn.classList.replace('btn-top-hidden', 'btn-top-visible');
    } else {
        btn.classList.replace('btn-top-visible', 'btn-top-hidden');
    }
});
// --- SISTEMA DE SIMULAÇÃO MERCADO PAGO ---

function toggleSimulador(valor) {
    const caixa = document.getElementById('simulador-caixa');
    const lista = document.getElementById('lista-parcelas');
    
    // Mostra ou esconde a caixinha azul
    caixa.classList.toggle('hidden');

    // Se ela estiver visível, faz o cálculo
    if (!caixa.classList.contains('hidden')) {
        const taxas = [
            { nome: "Débito", valor: valor * 1.0199, parc: 1 },
            { nome: "Crédito à Vista", valor: valor * 1.0498, parc: 1 },
            { nome: "Crédito 2x", valor: valor * 1.0574, parc: 2 },
            { nome: "Crédito 3x", valor: valor * 1.1024, parc: 3 }
        ];

        lista.innerHTML = taxas.map(t => `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #d1e9ff; padding: 6px 0;">
                <span style="font-size: 0.75rem; color: #333; font-weight: 600;">${t.nome}</span>
                <span style="font-size: 0.75rem; font-weight: 800; color: #009ee3;">
                    ${t.parc}x de ${(t.valor / t.parc).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                </span>
            </div>
        `).join('');
        
        // Atualiza os ícones se necessário
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }
}
// Função para o cliente compartilhar o produto com amigos
function compartilharProdutoCliente(id) {
    const p = produtos.find(prod => prod.id === id);
    if(!p) return;

    const precoFormatado = p.revenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Mensagem amigável para envio entre amigos
    const texto = `✨ *Olha o que eu vi na Karol Mell!* ✨%0A%0A` +
                  `🛍️ *${p.nome}*%0A` +
                  `💰 Valor: *${precoFormatado}*%0A%0A` +
                  `Dá uma olhadinha aqui: 👇%0A${p.linkPagamento || 'https://karolmell.com.br'}`;

    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
}
function gerarCardHTML(p, index) {
    const esgotado = !p.disponivel || p.estoque <= 0;
    const temPromo = p.precoAntigo && p.precoAntigo > p.revenda;
    const isFav = favoritos.includes(String(p.id));
    const lowStock = p.estoque > 0 && p.estoque <= 2;
    const temTimer = p.ofertaAte && new Date(p.ofertaAte) > new Date();

let textoTag = temPromo ? "PROMOÇÃO" : "";

        const card = document.createElement('div');
    card.className = `card ${esgotado ? 'esgotado' : ''}`;
    card.style.animationDelay = `${index * 0.05}s`;
    
    card.innerHTML = `
        ${textoTag ? `<span class="badge-promo">${textoTag}</span>` : ''}
        
        ${p.tag ? `<span class="custom-tag">${p.tag}</span>` : ''}

        <button class="fav-btn-card ${isFav ? 'active' : ''}" onclick="toggleFav('${p.id}', event)">
            <i data-lucide="heart" ${isFav ? 'style="fill:currentColor"' : ''}></i>
        </button>
        <img src="${p.img}" alt="${p.nome}" style="${esgotado ? 'filter: grayscale(1);' : ''}" onclick="openDetails(${p.id})">
        
        ${temTimer ? `<div class="offer-timer"><span class="timer-display" data-endtime="${p.ofertaAte}">--:--:--</span></div>` : ''}
        
        <h4 onclick="openDetails(${p.id})" style="font-size: 0.75rem; min-height: 32px; margin-bottom: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.nome}</h4>
        
        <div class="price-container" style="display: flex; flex-direction: column; align-items: flex-start; gap: 0px; min-height: 40px;">
            ${temPromo ? `<span class="old-price" style="font-size: 0.65rem; margin-bottom: -2px;">${p.precoAntigo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>` : ''}
            <div class="price" style="font-size: 0.95rem; font-weight: 800; color: var(--primary);">${p.revenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
        </div>
        
        ${lowStock ? `<div class="stock-warning" style="font-size: 0.6rem; margin-bottom: 5px;">⚠️ Restam ${p.estoque} un!</div>` : ''}
        
        <div style="display: flex; gap: 5px; margin-top: auto; width: 100%;">
            ${esgotado 
                ? `<button class="btn-add-cart" disabled style="background:#ccc; flex: 1; font-size: 0.7rem; padding: 8px 2px;">Esgotado</button>` 
                : `<button class="btn-add-cart" onclick="addToCart(${p.id}, event)" style="flex: 1; font-size: 0.7rem; padding: 8px 2px;">Adicionar</button>`}
            <button class="btn-share-client" onclick="compartilharProdutoCliente(${p.id})" style="width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 0; border-radius: 10px;">
                <i data-lucide="share-2" style="width: 14px;"></i>
            </button>
        </div>
    `;
    return card;
}
function irParaCategoria(nomeCategoria) {
    // 1. Filtra os produtos
    setFilter(null, nomeCategoria);
    
    // 2. Remove o destaque de todos os chips (incluindo o "Tudo")
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // 3. Ativa o chip da categoria correspondente no topo
    document.querySelectorAll('.category-chip').forEach(chip => {
        if (chip.innerText.trim() === nomeCategoria) {
            chip.classList.add('active');
        }
    });
    
    // 4. Sobe para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderCategoriasModal() {
    const container = document.getElementById('modal-category-list');
    if (!container) return;

    const categoriasSalvas = JSON.parse(localStorage.getItem('meu_catalogo_categorias')) || ["Combos", "Outlet", "Perfumaria", "Cosméticos", "Skincare", "Corpo e Banho", "Cabelo", "Eletrônicos", "Streamings", "IPTV"];
    
    // Mapeamento de Ícones e Cores (Igual à sua Imagem 1)
    const iconesMap = {
        'Combos': { icon: 'zap', color: '#f39c12' },
        'Outlet': { icon: 'tag', color: '#e74c3c' },
        'Perfumaria': { icon: 'sparkles', color: '#9b59b6' },
        'Cosméticos': { icon: 'heart', color: '#e91e63' },
        'Skincare': { icon: 'droplets', color: '#3498db' },
        'Corpo e Banho': { icon: 'bath', color: '#1abc9c' },
        'Cabelos': { icon: 'scissors', color: '#7f8c8d' },
        'Cabelo': { icon: 'scissors', color: '#7f8c8d' },
        'Streamings': { icon: 'play-circle', color: '#e74c3c' },
        'Eletrônicos': { icon: 'smartphone', color: '#2c3e50' },
        'IPTV': { icon: 'tv', color: '#2980b9' }
    };

    container.innerHTML = ''; 

    categoriasSalvas.forEach(cat => {
        const config = iconesMap[cat] || { icon: 'package', color: '#888' };
        const btn = document.createElement('button');
        btn.className = 'category-item-btn';
        
        // Estilo manual para garantir o visual da Imagem 1
        btn.style = "display: flex; align-items: center; gap: 15px; padding: 15px; border-radius: 15px; border: 1px solid #eee; margin-bottom: 10px; background: white; width: 100%; font-weight: 600; color: #333; cursor: pointer;";
        
        btn.innerHTML = `
            <i data-lucide="${config.icon}" style="color: ${config.color}; width: 22px; height: 22px;"></i>
            <span>${cat}</span>
        `;
        
        btn.onclick = () => {
            filtrarCategoria(cat);
            closeCategories();
        };
        container.appendChild(btn);
    });

    if (window.lucide) lucide.createIcons();
}
function aplicarNomesLoja() {
    // Busca os nomes do LocalStorage (cadastrados no Admin)
    const nomeCurto = localStorage.getItem('loja_nome_curto') || "KAROL MELL";
    const nomeCompleto = localStorage.getItem('loja_nome_completo') || "Cosméticos e Variedades";

    // 1. Atualiza o Título da Aba do Navegador
    document.title = `${nomeCurto} | ${nomeCompleto}`;

    // 2. Atualiza a Tela de Entrada (Gate)
    const gateTitle = document.getElementById('gate-name');
    if(gateTitle) gateTitle.innerText = nomeCurto.toUpperCase();

    const gateSub = document.getElementById('gate-slogan');
    if(gateSub) gateSub.innerText = nomeCompleto;

    // 3. Atualiza o Topo do Catálogo (brand-small)
    const mainStoreName = document.getElementById('main-store-name');
    if(mainStoreName) mainStoreName.innerText = nomeCurto.toUpperCase();

    // 4. Atualiza o Título do Admin (Caso esteja na página admin)
    const adminStoreName = document.getElementById('admin-store-name');
    if(adminStoreName) adminStoreName.innerText = `Painel ${nomeCurto}`;
}
function updateTimers() {
    const displays = document.querySelectorAll('.timer-display');
    displays.forEach(display => {
        const endTime = new Date(display.getAttribute('data-endtime')).getTime();
        const now = new Date().getTime();
        const diff = endTime - now;

        if (diff <= 0) {
            display.parentElement.innerHTML = "Oferta encerrada";
            return;
        }

        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        display.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    });
}
// --- SISTEMA DE NOTIFICAÇÕES ---

function openNotifications() {
    renderNotifications();
    document.getElementById('modal-notifications').style.display = 'flex';
    // Ao abrir, a bolinha vermelha some (consideramos como lidas)
    const badge = document.getElementById('notif-badge');
    if(badge) badge.style.display = 'none';
}

function closeNotifications() {
    document.getElementById('modal-notifications').style.display = 'none';
}
function renderNotifications() {
    const list = document.getElementById('notifications-list');
    if (!list) return;

    list.innerHTML = '';
    let temNotificacao = false;

    // 1. Verificar Estoque Crítico (Menos de 3 unidades)
    produtos.forEach(p => {
        if (p.disponivel && p.estoque > 0 && p.estoque <= 2) {
            temNotificacao = true;
            list.innerHTML += `
                <div class="notification-item notif-critico" onclick="openDetails(${p.id}); closeNotifications()">
                    <i data-lucide="alert-triangle"></i>
                    <div>
                        <p><strong>Estoque Baixo:</strong> ${p.nome}</p>
                        <span style="font-size:0.7rem; color:#666;">Restam apenas ${p.estoque} unidades!</span>
                    </div>
                </div>
            `;
        }
    });

    // 2. Verificar Promoções Ativas (Com cronômetro)
    produtos.forEach(p => {
        const agora = new Date();
        const fimOferta = p.ofertaAte ? new Date(p.ofertaAte) : null;
        
        if (p.disponivel && fimOferta && fimOferta > agora) {
            temNotificacao = true;
            list.innerHTML += `
                <div class="notification-item" onclick="openDetails(${p.id}); closeNotifications()">
                    <i data-lucide="zap"></i>
                    <div>
                        <p><strong>Oferta Relâmpago:</strong> ${p.nome}</p>
                        <span style="font-size:0.7rem; color:#666;">Aproveite antes que o tempo acabe!</span>
                    </div>
                </div>
            `;
        }
    });

    if (!temNotificacao) {
        list.innerHTML = `<div style="text-align:center; padding:20px; color:#999; font-size:0.85rem;">Nenhuma novidade no momento. ✨</div>`;
    }

    if (window.lucide) lucide.createIcons();
}
function checkNotificationsBadge() {
    const badge = document.getElementById('notif-badge');
    if(!badge) return;

    // Verifica se existe algum produto com estoque baixo ou oferta ativa
    const temUrgente = produtos.some(p => 
        (p.disponivel && p.estoque > 0 && p.estoque <= 2) || 
        (p.disponivel && p.ofertaAte && new Date(p.ofertaAte) > new Date())
    );

    badge.style.display = temUrgente ? 'block' : 'none';
}

