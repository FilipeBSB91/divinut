// Calculadora de IMC via alerta
document.getElementById('btnImc').onclick = function() {
    // Criar um prompt personalizado para altura
    const altura = prompt('Digite sua altura em centímetros (ex: 175):');
    
    if (!altura || isNaN(altura) || altura <= 0) {
        alert('Altura inválida! Operação cancelada.');
        return;
    }
    
    // Criar um prompt personalizado para peso
    const peso = prompt('Digite seu peso em quilogramas (ex: 70):');
    
    if (!peso || isNaN(peso) || peso <= 0) {
        alert('Peso inválido! Operação cancelada.');
        return;
    }
    
    // Calcular IMC
    const alturaMetros = parseFloat(altura) / 100;
    const imc = (parseFloat(peso) / (alturaMetros * alturaMetros)).toFixed(2);
    
    // Determinar classificação
    let classificacao = '';
    if (imc < 18.5) {
        classificacao = 'Abaixo do peso';
    } else if (imc < 24.9) {
        classificacao = 'Peso normal';
    } else if (imc < 29.9) {
        classificacao = 'Sobrepeso';
    } else if (imc < 34.9) {
        classificacao = 'Obesidade Grau I';
    } else if (imc < 39.9) {
        classificacao = 'Obesidade Grau II';
    } else {
        classificacao = 'Obesidade Grau III';
    }
    
    // Exibir resultado
    alert(`Seu IMC é: ${imc}\n\nClassificação: ${classificacao}\n\nAltura: ${altura}cm\nPeso: ${peso}kg`);
};

// Função para carregar artigos (exemplo)
function carregarArtigos() {
    // Aqui você pode fazer uma requisição AJAX para carregar artigos de um servidor
    // ou usar dados estáticos
    const artigos = [
        {
            titulo: "Importância do IMC para a Saúde",
            imagem: "img/artigo1.jpg",
            texto: "O Índice de Massa Corporal (IMC) é uma ferramenta importante para avaliar se o peso está adequado à altura..."
        },
        {
            titulo: "Dicas para uma Vida Saudável",
            imagem: "img/artigo2.jpg",
            texto: "Manter um estilo de vida saudável envolve alimentação balanceada, exercícios físicos regulares e cuidados com a saúde mental..."
        }
    ];
    
    // Código para renderizar os artigos na página
    // (pode ser implementado conforme necessidade)
}