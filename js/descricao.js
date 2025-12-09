
console.log('=== descricao.js CARREGADO ===');


(async function() {
    console.log('Iniciando carregamento da receita...');
    
    try {
    
        const receitaId = localStorage.getItem('receitaAtual');
        console.log('ID do localStorage:', receitaId);
        
        if (!receitaId) {
            console.error('ERRO: Nenhuma receita selecionada');
            document.getElementById('nome-receita').textContent = 'Erro: Nenhuma receita selecionada';
            return;
        }
        

        console.log('Carregando receitas.json...');
        const response = await fetch('js/receitas.json');
        const data = await response.json();
        console.log('JSON carregado. Total de receitas:', data.receitas.length);
        

        const receita = data.receitas.find(r => r.id === parseInt(receitaId));
        
        if (!receita) {
            console.error('ERRO: Receita não encontrada. ID:', receitaId);
            document.getElementById('nome-receita').textContent = 'Erro: Receita não encontrada';
            return;
        }
        
        console.log('Receita encontrada:', receita);
        
  
        // Nome
        document.getElementById('nome-receita').textContent = receita.nome;
        
        // Imagem
        const img = document.getElementById('imagem-receita');
        img.src = receita.img;
        img.alt = receita.nome;
        img.onerror = function() {
            this.src = 'img/receitas/01.png';
        };
        
        // Informações básicas
        document.getElementById('categoria-receita').textContent = receita.categoria;
        document.getElementById('tempo-receita').textContent = receita.tempo_preparo;
        document.getElementById('serve-receita').textContent = receita.serve;
        
        // Ingredientes
        const ingredientesLista = document.getElementById('ingredientes-lista');
        ingredientesLista.innerHTML = '';
        if (receita.ingredientes && receita.ingredientes.length > 0) {
            receita.ingredientes.forEach(ingrediente => {
                const li = document.createElement('li');
                
                // Criar checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                
                // Criar span para o texto
                const span = document.createElement('span');
                span.textContent = ingrediente;
                
                // Adicionar à lista
                li.appendChild(checkbox);
                li.appendChild(span);
                ingredientesLista.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Sem ingredientes informados';
            ingredientesLista.appendChild(li);
        }
        
        // Modo de preparo
        const modoPreparoLista = document.getElementById('modo-preparo-lista');
        modoPreparoLista.innerHTML = '';
        if (receita.modo_preparo && receita.modo_preparo.length > 0) {
            receita.modo_preparo.forEach((passo, index) => {
                const li = document.createElement('li');
                li.textContent = passo;
                modoPreparoLista.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Sem modo de preparo informado';
            modoPreparoLista.appendChild(li);
        }
        
        console.log('✅ TODOS os dados foram exibidos com sucesso!');
        
    } catch (error) {
        console.error('ERRO CRÍTICO:', error);
        document.getElementById('nome-receita').textContent = 'Erro ao carregar a receita';
    }
})();

// Função de debug
window.debugReceita = function() {
    console.log('=== DEBUG ===');
    console.log('LocalStorage receitaAtual:', localStorage.getItem('receitaAtual'));
    console.log('URL atual:', window.location.href);
};