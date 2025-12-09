
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos
    const listaArtigos = document.getElementById('lista-anuncios');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const filtroBusca = document.getElementById('filtro-busca');
    const filtroStatus = document.getElementById('filtro-status');
    
    let todosArtigos = [];
    

    
    // Mostrar/ocultar loading
    function mostrarLoading(mostrar) {
        if (loadingState) loadingState.style.display = mostrar ? 'block' : 'none';
        if (listaArtigos) listaArtigos.style.display = mostrar ? 'none' : 'block';
        if (emptyState && !mostrar) emptyState.style.display = 'none';
    }
    
    // Carregar artigos do Firebase
    async function carregarArtigos() {
        mostrarLoading(true);
        
        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('artigos')
                .orderBy('dataCriacao', 'desc')
                .get();
            
            todosArtigos = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                todosArtigos.push({
                    id: doc.id,
                    titulo: data.titulo || 'Artigo sem título',
                    texto: data.texto || '',
                    status: data.status || 'ativo',
                    dataCriacao: data.dataCriacao,
                    temImagem: data.temImagem || false
                });
            });
            
            mostrarArtigos();
            
        } catch (error) {
            listaArtigos.innerHTML = '<p>Erro ao carregar artigos</p>';
        } finally {
            mostrarLoading(false);
        }
    }
    
    // Mostrar artigos na lista
    function mostrarArtigos() {
        const busca = filtroBusca.value.toLowerCase();
        const status = filtroStatus.value;
        
        const artigosFiltrados = todosArtigos.filter(artigo => {
            // Filtrar por status
            if (status !== 'todos' && artigo.status !== status) {
                return false;
            }
            
            // Filtrar por busca
            if (busca) {
                const tituloMatch = artigo.titulo.toLowerCase().includes(busca);
                const textoMatch = artigo.texto.toLowerCase().includes(busca);
                return tituloMatch || textoMatch;
            }
            
            return true;
        });
        
        if (artigosFiltrados.length === 0) {
            listaArtigos.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        listaArtigos.innerHTML = artigosFiltrados.map(artigo => criarCardArtigo(artigo)).join('');
        
        // Adicionar eventos
        adicionarEventos();
    }
    
    // Criar card de artigo
    function criarCardArtigo(artigo) {
        const textoCurto = artigo.texto.length > 100 ? artigo.texto.substring(0, 100) + '...' : artigo.texto;
        const dataFormatada = artigo.dataCriacao && artigo.dataCriacao.toDate 
            ? artigo.dataCriacao.toDate().toLocaleDateString('pt-BR') 
            : 'Data desconhecida';
        
        return `
            <div class="card-anuncio ${artigo.status === 'inativo' ? 'inativo' : ''}">
                <div class="card-conteudo">
                    <div class="card-cabecalho">
                        <h3 class="card-titulo">${artigo.titulo}</h3>
                        <span class="status-badge ${artigo.status === 'ativo' ? 'status-ativo' : 'status-inativo'}">
                            ${artigo.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                    
                    <p class="card-descricao">${textoCurto}</p>
                    
                    <div class="card-info">
                        <div class="card-data">Criado em: ${dataFormatada}</div>
                    </div>
                    
                    <div class="card-acoes">
                        <div class="acoes-esquerda">
                            <button class="botao-acao botao-editar" data-id="${artigo.id}">
                                <span class="material-symbols-outlined">edit</span>
                                Editar
                            </button>
                            <button class="botao-acao botao-excluir" data-id="${artigo.id}">
                                <span class="material-symbols-outlined">delete</span>
                                Excluir
                            </button>
                        </div>
                        <div class="acoes-direita">
                            <span class="toggle-label">${artigo.status === 'ativo' ? 'Ativo' : 'Inativo'}</span>
                            <label class="toggle-switch">
                                <input type="checkbox" ${artigo.status === 'ativo' ? 'checked' : ''} data-id="${artigo.id}">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Adicionar eventos aos botões
    function adicionarEventos() {
        // Editar
        document.querySelectorAll('.botao-editar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                window.location.href = `artigo.html?editar=${id}`;
            });
        });
        
        // Excluir
        document.querySelectorAll('.botao-excluir').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const titulo = this.closest('.card-anuncio').querySelector('.card-titulo').textContent;
                
                if (confirm(`Excluir o artigo "${titulo}"?`)) {
                    excluirArtigo(id);
                }
            });
        });
        
        // Alternar status
        document.querySelectorAll('.toggle-switch input').forEach(toggle => {
            toggle.addEventListener('change', function() {
                const id = this.getAttribute('data-id');
                const ativo = this.checked;
                alternarStatus(id, ativo);
            });
        });
    }
    
    // Excluir artigo
    async function excluirArtigo(id) {
        try {
            const db = firebase.firestore();
            await db.collection('artigos').doc(id).delete();
            
            // Remover da lista local
            todosArtigos = todosArtigos.filter(artigo => artigo.id !== id);
            mostrarArtigos();
            
        } catch (error) {
            alert('Erro ao excluir artigo');
        }
    }
    
    // Alternar status ativo/inativo
    async function alternarStatus(id, ativo) {
        try {
            const novoStatus = ativo ? 'ativo' : 'inativo';
            const db = firebase.firestore();
            
            await db.collection('artigos').doc(id).update({
                status: novoStatus,
                dataAtualizacao: new Date().toISOString()
            });
            
            // Atualizar lista local
            const artigoIndex = todosArtigos.findIndex(a => a.id === id);
            if (artigoIndex !== -1) {
                todosArtigos[artigoIndex].status = novoStatus;
            }
            
            // Atualizar visualização
            mostrarArtigos();
            
        } catch (error) {
            alert('Erro ao alterar status');
            // Recarregar para sincronizar
            carregarArtigos();
        }
    }
    

    
    // Eventos dos filtros
    if (filtroBusca) {
        filtroBusca.addEventListener('input', mostrarArtigos);
    }
    
    if (filtroStatus) {
        filtroStatus.addEventListener('change', mostrarArtigos);
    }
    
    // Carregar artigos
    carregarArtigos();
    
});