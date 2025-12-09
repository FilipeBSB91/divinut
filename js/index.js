
console.log('index.js iniciado');

// Carregar quando a página estiver pronta
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - inicializando...');
    iniciarPagina();
});

function iniciarPagina() {
    console.log('Iniciando página index...');
    

    carregarReceitas();
    

    const buscaInput = document.getElementById('searchReceitas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            const termo = this.value.toLowerCase();
            document.querySelectorAll('.receita-card').forEach(card => {
                const texto = card.textContent.toLowerCase();
                card.style.display = texto.includes(termo) ? 'flex' : 'none';
            });
        });
    }
    
 
    configurarFiltros();
}

function carregarReceitas() {
    console.log('Carregando receitas do JSON...');
    
    fetch('js/receitas.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Receitas carregadas:', data.receitas.length);
            mostrarReceitasNaLista(data.receitas);
        })
        .catch(error => {
            console.error('Erro ao carregar receitas:', error);
            mostrarReceitasFallback();
        });
}

function mostrarReceitasNaLista(receitas) {
    const lista = document.querySelector('.receitas-list ul');
    if (!lista) {
        console.error('Lista não encontrada!');
        return;
    }
    
    // Limpar lista
    lista.innerHTML = '';
    
    // Para cada receita
    receitas.forEach(receita => {
        // Verificar se é favorita
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        const ehFavorita = favoritos.includes(receita.id);
        
        // Criar elemento
        const item = document.createElement('li');
        item.className = 'item-content receita-card';
        item.setAttribute('data-categoria', receita.categoria.toLowerCase());
        item.setAttribute('data-id', receita.id);
        
        item.innerHTML = `
            <div class="item-media">
                <img src="${receita.img}" 
                     alt="${receita.nome}" 
                     onerror="this.src='img/receitas/01.png'">
            </div>
            <div class="item-inner">
                <div class="item-header">
                    <div class="item-subtitle tempo">${receita.tempo_preparo}</div>
                    <button class="btn-favorito" data-id="${receita.id}">
                        <span class="material-symbols-outlined ${ehFavorita ? 'favorited' : ''}">
                            ${ehFavorita ? 'favorite' : 'favorite_border'}
                        </span>
                    </button>
                </div>
                <div class="item-title titulo">${receita.nome}</div>
                <div class="item-subtitle categoria">${receita.categoria}</div>
            </div>
        `;
        
   
        item.addEventListener('click', function(event) {

            if (!event.target.closest('.btn-favorito')) {
                console.log('=== CLICOU NA RECEITA ===');
                console.log('ID:', receita.id);
                console.log('Nome:', receita.nome);
                
    
                localStorage.setItem('receitaAtual', receita.id.toString());
                console.log('LocalStorage salvo:', localStorage.getItem('receitaAtual'));
                

                const testId = localStorage.getItem('receitaAtual');
                console.log('Teste de leitura:', testId, 'Tipo:', typeof testId);
                
   
                console.log('Navegando para descricao.html');
                
  
                setTimeout(() => {

                    const timestamp = Date.now();
                    window.location.href = 'descricao.html?t=' + timestamp;
                }, 50);
            }
        });
        
        // Botão favorito
        const btnFavorito = item.querySelector('.btn-favorito');
        btnFavorito.addEventListener('click', function(event) {
            event.stopPropagation();
            alternarFavorito(receita.id, this);
        });
        
        lista.appendChild(item);
    });
    
    console.log('Receitas exibidas na lista!');
    

    window.testeNavegacao = function(id) {
        console.log('=== TESTE MANUAL ===');
        localStorage.setItem('receitaAtual', id.toString());
        console.log('ID salvo:', localStorage.getItem('receitaAtual'));
        window.location.href = 'descricao.html?test=' + Date.now();
    };
}

function alternarFavorito(id, botao) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const icone = botao.querySelector('.material-symbols-outlined');
    
    if (favoritos.includes(id)) {
        // Remover
        favoritos = favoritos.filter(favId => favId !== id);
        icone.textContent = 'favorite_border';
        icone.classList.remove('favorited');
        
        // Mostrar feedback
        mostrarToast('Receita removida dos favoritos');
    } else {
        // Adicionar
        favoritos.push(id);
        icone.textContent = 'favorite';
        icone.classList.add('favorited');
        
        // Mostrar feedback
        mostrarToast('Receita adicionada aos favoritos');
    }
    
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    
    // Disparar evento para atualizar outras partes
    window.dispatchEvent(new CustomEvent('favoritosAtualizados'));
}

function configurarFiltros() {
    const botoes = document.querySelectorAll('.filter-btn');
    
    botoes.forEach(botao => {
        botao.addEventListener('click', function() {
            // Remover active de todos
            botoes.forEach(b => b.classList.remove('active'));
            
            // Adicionar ao clicado
            this.classList.add('active');
            
            // Filtrar
            const categoriaSelecionada = this.textContent.trim();
            const cards = document.querySelectorAll('.receita-card');
            
            cards.forEach(card => {
                if (categoriaSelecionada === 'Todas') {
                    card.style.display = 'flex';
                } else {
                    const categoriaCard = card.getAttribute('data-categoria');
                    card.style.display = categoriaCard.includes(categoriaSelecionada.toLowerCase()) ? 'flex' : 'none';
                }
            });
        });
    });
    
    // Ativar filtro "Todas" por padrão
    const botaoTodas = document.querySelector('.filter-btn');
    if (botaoTodas && botaoTodas.textContent.trim() === 'Todas') {
        botaoTodas.classList.add('active');
    }
}

function mostrarToast(mensagem) {
    // Criar elemento toast se não existir
    let toast = document.querySelector('.toast-mensagem');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-mensagem';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(toast);
    }
    
    // Mostrar mensagem
    toast.textContent = mensagem;
    toast.style.opacity = '1';
    
    // Esconder após 2 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.textContent = '';
        }, 300);
    }, 2000);
}

function mostrarReceitasFallback() {
    const lista = document.querySelector('.receitas-list ul');
    if (!lista) return;
    
    lista.innerHTML = `
        <li class="item-content receita-card" data-id="1">
            <div class="item-media">
                <img src="img/receitas/01.png" alt="Salada de Quinoa">
            </div>
            <div class="item-inner">
                <div class="item-header">
                    <div class="item-subtitle tempo">20 minutos</div>
                    <button class="btn-favorito" data-id="1">
                        <span class="material-symbols-outlined">favorite_border</span>
                    </button>
                </div>
                <div class="item-title titulo">Salada de Quinoa com Legumes Frescos</div>
                <div class="item-subtitle categoria">Almoço</div>
            </div>
        </li>
        <li class="item-content receita-card" data-id="2">
            <div class="item-media">
                <img src="img/receitas/02.png" alt="Frango Grelhado">
            </div>
            <div class="item-inner">
                <div class="item-header">
                    <div class="item-subtitle tempo">35 minutos</div>
                    <button class="btn-favorito" data-id="2">
                        <span class="material-symbols-outlined">favorite_border</span>
                    </button>
                </div>
                <div class="item-title titulo">Frango Grelhado com Batata-Doce</div>
                <div class="item-subtitle categoria">Almoço</div>
            </div>
        </li>
    `;
    
    // Reconfigurar eventos
    document.querySelectorAll('.receita-card').forEach(card => {
        const id = card.getAttribute('data-id');
        
        card.addEventListener('click', function(event) {
            if (!event.target.closest('.btn-favorito')) {
                console.log('=== CLICOU NA RECEITA (fallback) ===');
                console.log('ID:', id);
                
                // Salvar no localStorage
                localStorage.setItem('receitaAtual', id);
                console.log('LocalStorage salvo:', localStorage.getItem('receitaAtual'));
                
                // Navegação simples
                setTimeout(() => {
                    window.location.href = 'descricao.html?t=' + Date.now();
                }, 50);
            }
        });
        
        const btnFavorito = card.querySelector('.btn-favorito');
        if (btnFavorito) {
            btnFavorito.addEventListener('click', function(event) {
                event.stopPropagation();
                alternarFavorito(parseInt(id), this);
            });
        }
    });
}

// CSS para favoritos
if (!document.querySelector('#estilos-favoritos')) {
    const estilo = document.createElement('style');
    estilo.id = 'estilos-favoritos';
    estilo.textContent = `
        .btn-favorito {
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            position: relative;
        }
        
        .btn-favorito .material-symbols-outlined {
            font-size: 24px;
            color: #ccc;
            transition: all 0.3s ease;
        }
        
        .btn-favorito .material-symbols-outlined.favorited {
            color: #ff4444;
            font-variation-settings: 'FILL' 1;
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .categoria {
            color: #666;
            font-size: 13px;
            margin-top: 4px;
        }
        
        .receita-card {
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        
        .receita-card:hover {
            transform: translateY(-2px);
        }
        
        .tempo {
            color: #4c9a4c;
            font-weight: 500;
            font-size: 13px;
        }
        
        .titulo {
            font-weight: 600;
            font-size: 15px;
            line-height: 1.3;
            color: #333;
        }
        
        .filter-btn.active {
            background-color: #4c9a4c !important;
            color: white !important;
        }
        
        #searchReceitas {
            border-radius: 20px;
            padding: 10px 15px;
            border: 1px solid #ddd;
            width: 100%;
            margin-bottom: 15px;
            font-size: 14px;
        }
        
        .item-media img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
        }
        
        /* Estilo para debug */
        .debug-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2196f3;
            color: white;
            padding: 10px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 9999;
        }
    `;
    document.head.appendChild(estilo);
}

// Sincronizar favoritos quando a página for carregada via Framework7
if (typeof Framework7 !== 'undefined') {
    document.addEventListener('framework7:init', function() {
        console.log('Framework7 inicializado na página index');
        
        // Atualizar favoritos quando voltar para a página
        app.on('pageAfterIn', function(e) {
            if (e.detail.page && e.detail.page.name === 'index') {
                console.log('Página index carregada via Framework7');
                
                // Recarregar favoritos
                const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
                document.querySelectorAll('.btn-favorito').forEach(btn => {
                    const id = parseInt(btn.getAttribute('data-id'));
                    const icone = btn.querySelector('.material-symbols-outlined');
                    
                    if (favoritos.includes(id)) {
                        icone.textContent = 'favorite';
                        icone.classList.add('favorited');
                    } else {
                        icone.textContent = 'favorite_border';
                        icone.classList.remove('favorited');
                    }
                });
            }
        });
    });
}

// Fallback para garantir inicialização
setTimeout(function() {
    console.log('Verificando fallback...');
    if (document.querySelector('.page[data-name="index"]')) {
        // Verificar se já foi inicializado
        const receitasCarregadas = document.querySelectorAll('.receita-card').length > 0;
        if (!receitasCarregadas) {
            console.log('Fallback: reinicializando página...');
            iniciarPagina();
        }
    }
}, 500);

// Adicionar evento global para favoritos
window.addEventListener('favoritosAtualizados', function() {
    console.log('Evento favoritosAtualizados recebido');
    
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    document.querySelectorAll('.btn-favorito').forEach(btn => {
        const id = parseInt(btn.getAttribute('data-id'));
        const icone = btn.querySelector('.material-symbols-outlined');
        
        if (favoritos.includes(id)) {
            icone.textContent = 'favorite';
            icone.classList.add('favorited');
        } else {
            icone.textContent = 'favorite_border';
            icone.classList.remove('favorited');
        }
    });
});

// Função de teste global
window.testarNavegacao = function(id) {
    console.log('=== TESTE DE NAVEGAÇÃO ===');
    console.log('Usando ID:', id);
    localStorage.setItem('receitaAtual', id.toString());
    console.log('Salvo no localStorage:', localStorage.getItem('receitaAtual'));
    window.location.href = 'descricao.html?test=' + Date.now();
};