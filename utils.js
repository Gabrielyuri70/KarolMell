let imageBase64 = ""; 

// --- MODO DARK ---
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if(!icon) return;
    icon.setAttribute('data-lucide', document.body.classList.contains('dark-mode') ? 'sun' : 'moon');
    lucide.createIcons();
}

// --- VISIBILIDADE DA SENHA (NOVIDADE) ---
function togglePassword() {
    const passInput = document.getElementById('pass');
    const eyeIcon = document.getElementById('eye-icon');
    if (passInput.type === "password") {
        passInput.type = "text";
        eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
        passInput.type = "password";
        eyeIcon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

// --- PROCESSAMENTO E COMPRESSÃO DE IMAGEM (VERSÃO ULTRA OTIMIZADA) ---
function processarImagem(event, previewId, isBanner = false) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;

        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // MUDANÇA 1: Reduzimos para 600px (ideal para telas de celular)
            const maxWidth = 600; 
            const scaleSize = maxWidth / img.width;
            
            if (img.width > maxWidth) {
                canvas.width = maxWidth;
                canvas.height = img.height * scaleSize;
            } else {
                canvas.width = img.width;
                canvas.height = img.height;
            }

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // MUDANÇA 2: Ajustamos a qualidade para 0.6 (60%)
            // Isso reduz o peso da foto drasticamente sem perder nitidez visível
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

            const preview = document.getElementById(previewId);
            if(preview) {
                preview.src = compressedBase64;
                preview.style.display = 'block';
            }

            if(isBanner) {
                localStorage.setItem('meu_catalogo_banner', compressedBase64);
                alert("Banner otimizado e processado! Clique em Aplicar no Admin para confirmar.");
            } else {
                imageBase64 = compressedBase64; 
            }
        }
    }
    reader.readAsDataURL(file);
}

// --- CRONÔMETRO ---
function updateTimers() {
    const timers = document.querySelectorAll('.timer-display');
    timers.forEach(timer => {
        const endTimeStr = timer.dataset.endtime;
        if(!endTimeStr) return;
        
        const endTime = new Date(endTimeStr).getTime();
        const now = new Date().getTime();
        const diff = endTime - now;

        if (diff > 0) {
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            timer.innerText = `🔥 Termina em: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        } else {
            timer.innerText = "Oferta encerrada!";
            timer.parentElement.style.display = 'none'; // <--- ADICIONE ISSO: Esconde a barrinha do timer quando acaba
        }
    });
}

function scrollToTop() { window.scrollTo({top: 0, behavior: 'smooth'}); }
