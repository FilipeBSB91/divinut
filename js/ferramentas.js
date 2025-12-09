

// Configuração do Firebase
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAvTtAzbg9cbxHpwPWFOUvTIADdqZywPAA",
    authDomain: "divinut-d522f.firebaseapp.com",
    projectId: "divinut-d522f",
    storageBucket: "divinut-d522f.firebasestorage.app",
    messagingSenderId: "326583467016",
    appId: "1:326583467016:web:d42dcb58d74c73fa3ee5bd",
    measurementId: "G-2HEP9C4SKY"
};



// Executar SEMPRE que a página for acessada
function executarTudo() {
    // 1. Configurar botão IMC
    configurarIMC();
    
    // 2. Mostrar conteúdo inicial
    mostrarConteudoInicial();
    
    // 3. Carregar Firebase e artigos
    carregarConteudo();
}



function configurarIMC() {
    // Procurar botão periodicamente
    const procurarBotao = setInterval(() => {
        const btn = document.getElementById('btnImc');
        if (btn) {
            clearInterval(procurarBotao);
            
            // Remover qualquer evento antigo
            const novoBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(novoBtn, btn);
            
            // Adicionar evento
            novoBtn.onclick = function() {
                const altura = prompt('Digite sua altura em centímetros (ex: 175):');
                if (!altura || isNaN(altura)) {
                    alert('Altura inválida!');
                    return;
                }
                
                const peso = prompt('Digite seu peso em quilogramas (ex: 70):');
                if (!peso || isNaN(peso)) {
                    alert('Peso inválido!');
                    return;
                }
                
                const alturaM = altura / 100;
                const imc = (peso / (alturaM * alturaM)).toFixed(2);
                
                let classificacao = '';
                if (imc < 18.5) classificacao = 'Abaixo do peso';
                else if (imc < 24.9) classificacao = 'Peso normal';
                else if (imc < 29.9) classificacao = 'Sobrepeso';
                else if (imc < 34.9) classificacao = 'Obesidade Grau I';
                else if (imc < 39.9) classificacao = 'Obesidade Grau II';
                else classificacao = 'Obesidade Grau III';
                
                alert(`Seu IMC é: ${imc}\n\nClassificação: ${classificacao}\n\nAltura: ${altura}cm\nPeso: ${peso}kg`);
            };
        }
    }, 100);
    
    // Parar após 3 segundos
    setTimeout(() => clearInterval(procurarBotao), 3000);
}


function mostrarConteudoInicial() {
    const container = document.getElementById('artigos-container');
    if (container) {
        container.innerHTML = `
            <div class="card artigo-card">
                            <div class="card-content card-content-padding">
                                <div class="artigo-header">
                                    <img src="img/01.jpg" alt="Imagem do Artigo" class="artigo-imagem">
                                    <h3 class="artigo-titulo">A importância da hidratação</h3>
                                </div>
                                <div class="artigo-texto">
                                    <p>A hidratação é crucial porque a água transporta nutrientes, regula a temperatura corporal, lubrifica articulações, auxilia na digestão e eliminação de toxinas, sendo vital para o funcionamento de órgãos como rins e cérebro, prevenindo problemas como pedras nos rins e fadiga, e mantendo a pele e músculos saudáveis.</p>
                                </div>
                            </div>
                        </div>
        `;
    }
}



function carregarConteudo() {
    atualizarStatus('Conectando ao banco de dados...');
    
    // Verificar se Firebase já está disponível
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
        carregarArtigos();
    } else {
        carregarFirebase();
    }
}

function carregarFirebase() {
    atualizarStatus('Carregando módulos...');
    
    // Carregar scripts do Firebase
    const script1 = document.createElement('script');
    script1.src = 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js';
    
    script1.onload = function() {
        const script2 = document.createElement('script');
        script2.src = 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js';
        
        script2.onload = function() {
            inicializarFirebase();
        };
        
        script2.onerror = function() {
            mostrarErro('Erro ao carregar Firebase');
        };
        
        document.head.appendChild(script2);
    };
    
    script1.onerror = function() {
        mostrarErro('Erro ao carregar Firebase');
    };
    
    document.head.appendChild(script1);
}

function inicializarFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        
        atualizarStatus('Conectado! Buscando artigos...');
        carregarArtigos();
        
    } catch (error) {
        mostrarErro('Não foi possível conectar ao banco de dados.');
    }
}

async function carregarArtigos() {
    try {
        atualizarStatus('Buscando artigos...');
        
        const db = firebase.firestore();
        
        const snapshot = await db.collection('artigos')
            .where('status', '==', 'ativo')
            .orderBy('dataCriacao', 'desc')
            .get();
        
        if (snapshot.empty) {
            mostrarMensagem('Nenhum artigo disponível no momento.');
            return;
        }
        
        mostrarArtigos(snapshot);
        
        atualizarStatus(snapshot.size + ' artigo(s) carregado(s)', 'verde');
        
    } catch (error) {
        mostrarErro('Erro ao carregar artigos. Tente novamente.');
    }
}

function mostrarArtigos(snapshot) {
    const container = document.getElementById('artigos-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    snapshot.forEach(doc => {
        const artigo = doc.data();
        container.innerHTML += criarArtigoHTML(artigo);
    });
}

function criarArtigoHTML(artigo) {
    let imagemSrc = 'img/01.jpg';
    if (artigo.imagemBase64 && artigo.imagemBase64.startsWith('data:')) {
        imagemSrc = artigo.imagemBase64;
    }
    
    return `
        <div class="card artigo-card">
            <div class="card-content card-content-padding">
                <div class="artigo-header">
                    <img src="${imagemSrc}" 
                         alt="${artigo.titulo || 'Artigo'}" 
                         class="artigo-imagem"
                         onerror="this.src='img/01.jpg'">
                    <h3 class="artigo-titulo">${artigo.titulo || 'Artigo sem título'}</h3>
                </div>
                <div class="artigo-texto">
                    <p>${artigo.texto || ''}</p>
                </div>
            </div>
        </div>
    `;
}


function atualizarStatus(mensagem, cor = 'branco') {
    const elemento = document.getElementById('status-text');
    if (elemento) {
        elemento.textContent = mensagem;
        
        if (cor === 'verde') {
            elemento.style.color = '#4CAF50';
        } else if (cor === 'vermelho') {
            elemento.style.color = '#F44336';
        } else {
            elemento.style.color = 'white';
        }
    }
}

function mostrarMensagem(mensagem) {
    const container = document.getElementById('artigos-container');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-content card-content-padding text-center">
                    <p>${mensagem}</p>
                </div>
            </div>
        `;
    }
}

function mostrarErro(mensagem) {
    const container = document.getElementById('artigos-container');
    if (container) {
        container.innerHTML = `
            <div class="card" style="border-left: 4px solid #F44336;">
                <div class="card-content card-content-padding text-center">
                    <h4 style="color: #F44336;">Erro</h4>
                    <p>${mensagem}</p>
                    <button onclick="window.location.reload()" 
                            style="margin-top: 15px; padding: 10px 20px; background: #F44336; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Recarregar Página
                    </button>
                </div>
            </div>
        `;
    }
}




setTimeout(executarTudo, 100);


if (typeof Framework7 !== 'undefined') {

    document.addEventListener('page:init', function(e) {
        const page = e.target;
        if (page.getAttribute('data-name') === 'ferramentas') {
            setTimeout(executarTudo, 50);
        }
    });
}


setInterval(function() {
    const paginaAtual = document.querySelector('.page-current');
    if (paginaAtual && paginaAtual.getAttribute('data-name') === 'ferramentas') {

        const container = document.getElementById('artigos-container');
        if (container && (!container.innerHTML || container.innerHTML.includes('Carregando conteúdo'))) {
            executarTudo();
        }
    }
}, 2000);


let ultimaURL = window.location.href;
setInterval(function() {
    if (window.location.href !== ultimaURL) {
        ultimaURL = window.location.href;
        if (window.location.href.includes('ferramentas')) {
            setTimeout(executarTudo, 300);
        }
    }
}, 500);