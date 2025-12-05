// Busca super simples
document.getElementById('searchReceitas').oninput = function() {
    const busca = this.value.toLowerCase();
    
    document.querySelectorAll('.receita-card').forEach(function(card) {
        const textoCard = card.textContent.toLowerCase();
        card.style.display = textoCard.includes(busca) ? 'flex' : 'none';
    });
};