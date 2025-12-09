
document.addEventListener('DOMContentLoaded', function() {
    

    const btnCadastrar = document.getElementById('btn-cadastrar');
    const tituloInput = document.getElementById('titulo');
    const textoInput = document.getElementById('texto');
    const fotoInput = document.getElementById('foto-input');
    const fotoPreview = document.getElementById('foto-preview');
    const removerFotoBtn = document.getElementById('remover-foto');
    
    let imagemComprimida = null;
    let isProcessando = false;
    let artigoIdParaEditar = null;
    let modoEdicao = false;
    

    const urlParams = new URLSearchParams(window.location.search);
    const idEdicao = urlParams.get('editar');
    
    if (idEdicao) {
        modoEdicao = true;
        artigoIdParaEditar = idEdicao;
        carregarArtigoParaEdicao(idEdicao);
    }
    

    
    // Carregar artigo para edição
    async function carregarArtigoParaEdicao(id) {
        try {
            const db = firebase.firestore();
            const doc = await db.collection('artigos').doc(id).get();
            
            if (doc.exists) {
                const artigo = doc.data();
                
                // Preencher formulário
                tituloInput.value = artigo.titulo || '';
                textoInput.value = artigo.texto || '';
                
                // Se tiver imagem
                if (artigo.imagemBase64) {
                    imagemComprimida = artigo.imagemBase64;
                    fotoPreview.innerHTML = `
                        <img src="${imagemComprimida}" 
                             style="width:100%; height:100%; object-fit:cover; border-radius:8px;"
                             alt="Preview">
                    `;
                    removerFotoBtn.style.display = 'flex';
                }
                
                // Atualizar interface
                btnCadastrar.textContent = 'Atualizar Artigo';
                document.querySelector('.title').textContent = 'Editar Artigo';
                
                console.log('Artigo carregado para edição:', id);
            } else {
                alert('Artigo não encontrado!');
                window.history.back();
            }
            
        } catch (error) {
            console.error('Erro ao carregar artigo:', error);
            alert('Erro ao carregar artigo para edição');
            window.history.back();
        }
    }
    
    // Comprimir imagem
    function comprimirImagem(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Redimensionar para máximo 600px
                    let width = img.width;
                    let height = img.height;
                    const maxWidth = 600;
                    
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Comprimir
                    ctx.drawImage(img, 0, 0, width, height);
                    const base64Comprimido = canvas.toDataURL('image/jpeg', 0.6);
                    
                    resolve(base64Comprimido);
                };
                
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Resetar imagem
    function resetarImagem() {
        imagemComprimida = null;
        fotoInput.value = '';
        fotoPreview.innerHTML = `
            <span class="material-symbols-outlined icone-foto">image</span>
            <p class="texto-foto">Clique para adicionar imagem</p>
        `;
        removerFotoBtn.style.display = 'none';
    }
    
    // Salvar ou atualizar artigo
    async function salvarArtigo() {
        const titulo = tituloInput.value.trim();
        const texto = textoInput.value.trim();
        
        if (!titulo) {
            alert("Digite o título do artigo");
            tituloInput.focus();
            return false;
        }
        
        if (!texto) {
            alert("Digite o conteúdo do artigo");
            textoInput.focus();
            return false;
        }
        
        if (isProcessando) {
            alert("Aguarde, processando imagem...");
            return false;
        }
        
        btnCadastrar.disabled = true;
        btnCadastrar.textContent = modoEdicao ? 'Atualizando...' : 'Salvando...';
        
        try {
            const db = firebase.firestore();
            const artigoData = {
                titulo: titulo,
                texto: texto,
                dataAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Adicionar dados específicos do modo
            if (!modoEdicao) {
                artigoData.dataCriacao = firebase.firestore.FieldValue.serverTimestamp();
                artigoData.status = 'ativo';
            }
            
            // Adicionar imagem se for pequena
            if (imagemComprimida && imagemComprimida.length < 1000000) {
                artigoData.imagemBase64 = imagemComprimida;
                artigoData.temImagem = true;
            } else if (imagemComprimida === '' && modoEdicao) {
                // Em modo edição, se imagem foi removida
                artigoData.imagemBase64 = '';
                artigoData.temImagem = false;
            }
            
            // Salvar ou atualizar
            if (modoEdicao && artigoIdParaEditar) {
                await db.collection('artigos').doc(artigoIdParaEditar).update(artigoData);
                alert("Artigo atualizado com sucesso!");
            } else {
                await db.collection('artigos').add(artigoData);
                alert("Artigo salvo com sucesso!");
            }
            
            // Limpar formulário se for cadastro novo
            if (!modoEdicao) {
                tituloInput.value = '';
                textoInput.value = '';
                resetarImagem();
            }
            
            // Redirecionar se for edição
            if (modoEdicao) {
                setTimeout(() => {
                    window.location.href = 'gerenciar-artigo.html';
                }, 1000);
            }
            
            return true;
            
        } catch (error) {
            if (error.message.includes("longer than 1048487 bytes")) {
                alert("Imagem muito grande. Tente salvar sem imagem.");
            } else {
                alert("Erro ao salvar: " + error.message);
            }
            return false;
        } finally {
            btnCadastrar.disabled = false;
            btnCadastrar.textContent = modoEdicao ? 'Atualizar Artigo' : 'Cadastrar artigo';
        }
    }
    

    
    // Clicar na área de foto
    fotoPreview.addEventListener('click', function() {
        if (!isProcessando) {
            fotoInput.click();
        }
    });
    
    // Selecionar imagem
    fotoInput.addEventListener('change', async function(e) {
        if (!e.target.files[0]) return;
        
        isProcessando = true;
        btnCadastrar.disabled = true;
        
        try {
            const file = e.target.files[0];
            
            // Verificar tamanho
            if (file.size > 5 * 1024 * 1024) {
                alert("Imagem muito grande! Use arquivos menores que 5MB.");
                fotoInput.value = '';
                return;
            }
            
            // Verificar tipo
            if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
                alert("Formato não suportado! Use JPG, PNG ou WebP.");
                fotoInput.value = '';
                return;
            }
            
            // Comprimir
            imagemComprimida = await comprimirImagem(file);
            
            // Mostrar preview
            fotoPreview.innerHTML = `
                <img src="${imagemComprimida}" 
                     style="width:100%; height:100%; object-fit:cover; border-radius:8px;"
                     alt="Preview">
            `;
            removerFotoBtn.style.display = 'flex';
            
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao processar imagem.");
            resetarImagem();
        } finally {
            isProcessando = false;
            btnCadastrar.disabled = false;
        }
    });
    
    // Botão remover imagem
    removerFotoBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        imagemComprimida = '';
        resetarImagem();
    });
    
    // Botão salvar/atualizar
    btnCadastrar.addEventListener('click', salvarArtigo);
    
});