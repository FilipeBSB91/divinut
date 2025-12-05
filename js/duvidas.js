// Função para abrir URL em nova aba/guia
function openInNewTab(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

const msgDuvida = 'https://wa.me/5561982205427?text=Olá Dra. Divina, gostaria de tirar dúvidas!'
const btn = document.querySelector('#btnWhatsApp');

const socialMedia = 'https://www.instagram.com/'
const btn2 = document.querySelector('#btnInstagram');


btn.addEventListener('click', () => {
  openInNewTab(msgDuvida);
});

btn2.addEventListener('click', () => {
  openInNewTab(socialMedia);
});