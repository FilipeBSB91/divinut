
let carregamentoEmAndamento = false;

$(document).ready(function() {

    if ($('.page[data-name="fav"]').length > 0) {
        carregarFavoritos();
    }
});


$(document).on('page:init', '.page[data-name="fav"]', function() {
    carregarFavoritos();
});


function carregarFavoritos() {

    if (carregamentoEmAndamento) {
        console.log('Carregamento já em andamento, ignorando...');
        return;
    }
    
    carregamentoEmAndamento = true;
    console.log('Iniciando carregamento de favoritos...');
    

    var favoritosIds = JSON.parse(localStorage.getItem('favoritos')) || [];
    

    var listaFavoritos = $(".favoritos-list ul");
    

    listaFavoritos.empty();
    

    if (favoritosIds.length === 0) {
        listaFavoritos.html(`
            <li class="text-align-center padding-top">
                <span class="material-symbols-outlined" style="font-size: 64px; color: #ccc; margin-bottom: 16px;">
                    favorite
                </span>
                <h3 style="color: #666;">Nenhuma receita!</h3>
                <p style="color: #888; margin-bottom: 30px;">Adicione receitas aos favoritos na página principal</p>
                <a href="/index/" class="button" style="
                    display: inline-block;
                    padding: 12px 24px;
                    background: #4c9a4c;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 500;
                ">
                    Explorar Receitas
                </a>
            </li>
        `);
        carregamentoEmAndamento = false;
        return;
    }
    

    $.getJSON('js/receitas.json')
        .done(function(data) {

            var receitasFavoritas = data.receitas.filter(function(receita) {
                return favoritosIds.includes(receita.id);
            });
            

            if (receitasFavoritas.length === 0) {
                listaFavoritos.html(`
                    <li class="text-align-center padding-top">
                        <span class="material-symbols-outlined" style="font-size: 64px; color: #ff6b6b; margin-bottom: 16px;">
                            error
                        </span>
                        <h3 style="color: #666;">Erro nos dados</h3>
                        <p style="color: #888; margin-bottom: 30px;">IDs dos favoritos não correspondem</p>
                    </li>
                `);
                carregamentoEmAndamento = false;
                return;
            }
            

            receitasFavoritas.forEach(function(receita) {
                var itemFavorito = `
                    <li class="item-content favorito-card" data-receita-id="${receita.id}">
                        <div class="item-media">
                            <img src="${receita.img}" alt="${receita.nome}" 
                                 onerror="this.src='img/receitas/01.png'">
                        </div>
                        <div class="item-inner">
                            <div class="item-header">
                                <div class="item-subtitle tempo">${receita.tempo_preparo}</div>
                                <button class="btn-favorito remover-favorito" data-id="${receita.id}">
                                    <span class="material-symbols-outlined favorited">favorite</span>
                                </button>
                            </div>
                            <div class="item-title titulo">${receita.nome}</div>
                            <div class="item-subtitle categoria">${receita.categoria}</div>
                            <div class="item-text descricao">
                                ${receita.ingredientes ? receita.ingredientes.slice(0, 2).join(', ') + '...' : ''}
                            </div>
                        </div>
                    </li>
                `;
                
                listaFavoritos.append(itemFavorito);
            });
            

            configurarEventos();
            carregamentoEmAndamento = false;
        })
        .fail(function() {
            listaFavoritos.html(`
                <li class="text-align-center padding-top">
                    <span class="material-symbols-outlined" style="font-size: 64px; color: #ff6b6b; margin-bottom: 16px;">
                        error
                    </span>
                    <h3 style="color: #666;">Erro ao carregar</h3>
                    <p style="color: #888; margin-bottom: 30px;">Tente novamente</p>
                    <button onclick="carregarFavoritos()" class="button" style="
                        padding: 12px 24px;
                        background: #4c9a4c;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                    ">
                        Tentar Novamente
                    </button>
                </li>
            `);
            carregamentoEmAndamento = false;
        });
}

function configurarEventos() {

    $(".remover-favorito").off('click');
    $(".favorito-card").off('click');
    

    $(".remover-favorito").on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var receitaId = parseInt($(this).data('id'));
        removerFavorito(receitaId);
    });
    

    $(".favorito-card").on('click', function(e) {
        if (!$(e.target).closest('.remover-favorito').length) {
            var receitaId = $(this).data('receita-id');
            
            if (typeof app !== 'undefined' && app.views && app.views.main) {
                app.views.main.router.navigate(`/descricao/?id=${receitaId}`);
            }
        }
    });
}

function removerFavorito(receitaId) {
    var favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    var index = favoritos.indexOf(receitaId);
    
    if (index !== -1) {
        favoritos.splice(index, 1);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        

        $(`[data-receita-id="${receitaId}"]`).fadeOut(300, function() {
            $(this).remove();
            

            if (favoritos.length === 0) {
                setTimeout(function() {
                    carregamentoEmAndamento = false;
                    carregarFavoritos();
                }, 300);
            }
        });
        

        $(document).trigger('favoritosAtualizados');
    }
}