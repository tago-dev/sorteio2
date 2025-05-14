// Selecionar elementos do DOM
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const itemsInput = document.getElementById('items-input');
const addItemsBtn = document.getElementById('add-items-btn');
const itemsList = document.getElementById('items-list');
const itemsCount = document.getElementById('items-count');
const drawBtn = document.getElementById('draw-btn');
const wheelBtn = document.getElementById('wheel-btn');
const wheelSection = document.getElementById('wheel-section');
const wheelCanvas = document.getElementById('wheel-canvas');
const spinWheelBtn = document.getElementById('spin-wheel-btn');
const resultSection = document.getElementById('result-section');
const resultText = document.getElementById('result-text');
const newLotteryBtn = document.getElementById('new-lottery-btn');
const shareBtn = document.getElementById('share-btn');
const shareModal = document.getElementById('share-modal');
const closeModal = document.querySelector('.close-modal');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const historyList = document.getElementById('history-list');
const allowRepeatSwitch = document.getElementById('allow-repeat-switch');

let items = [];
let drawnItems = [];
let history = [];
let wheel;
let wheelRotationAngle = 0;
let isSpinning = false;
let allowRepeatedItems = true;

// Carregar dados do localStorage
function loadFromLocalStorage() {
    const savedItems = localStorage.getItem('clicksorte-items');
    const savedHistory = localStorage.getItem('clicksorte-history');
    const savedTheme = localStorage.getItem('clicksorte-theme');
    const savedAllowRepeat = localStorage.getItem('clicksorte-allow-repeat');
    const savedDrawnItems = localStorage.getItem('clicksorte-drawn-items');

    if (savedItems) {
        items = JSON.parse(savedItems);
        renderItems();
    }

    if (savedHistory) {
        history = JSON.parse(savedHistory);
        renderHistory();
    }

    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    if (savedAllowRepeat !== null) {
        allowRepeatedItems = JSON.parse(savedAllowRepeat);
        allowRepeatSwitch.checked = allowRepeatedItems;
    }

    if (savedDrawnItems) {
        drawnItems = JSON.parse(savedDrawnItems);
    }
}

function saveToLocalStorage() {
    localStorage.setItem('clicksorte-items', JSON.stringify(items));
    localStorage.setItem('clicksorte-history', JSON.stringify(history));
    localStorage.setItem('clicksorte-allow-repeat', JSON.stringify(allowRepeatedItems));
    localStorage.setItem('clicksorte-drawn-items', JSON.stringify(drawnItems));
}

function renderItems() {
    itemsList.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');

        const isDrawn = !allowRepeatedItems && drawnItems.includes(item);

        li.innerHTML = `
            <span style="${isDrawn ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${item}</span>
            <button class="delete-item" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        itemsList.appendChild(li);
    });

    itemsCount.textContent = items.length;

    updateUIBasedOnItems();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">Nenhum sorteio realizado ainda.</p>';
        return;
    }

    historyList.innerHTML = '';
    history.slice(0, 5).forEach((item) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span>${item.result}</span>
            <span class="history-date">${new Date(item.date).toLocaleString()}</span>
        `;
        historyList.appendChild(historyItem);
    });
}

function addItems() {
    const text = itemsInput.value.trim();
    if (!text) return;

    const newItems = text.split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

    if (newItems.length === 0) return;

    const duplicates = [];
    const uniqueItems = [];

    newItems.forEach(item => {
        if (items.includes(item)) {
            duplicates.push(item);
        } else if (uniqueItems.includes(item)) {
            duplicates.push(item);
        } else {
            uniqueItems.push(item);
        }
    });

    items = [...items, ...uniqueItems];
    saveToLocalStorage();
    renderItems();

    itemsInput.value = '';

    if (duplicates.length > 0) {
        alert(`Os seguintes itens duplicados foram ignorados:\n${duplicates.join('\n')}`);
    }
}

// Remover item
function removeItem(index) {
    items.splice(index, 1);
    saveToLocalStorage();
    renderItems();
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Realizar sorteio normal
function drawItem() {
    // Desabilitar botão para evitar múltiplos cliques
    drawBtn.disabled = true;

    // Esconder seção de resultado
    resultSection.classList.add('hidden');

    // Rolar para a seção de resultado em dispositivos móveis
    if (window.innerWidth <= 992) {
        document.querySelector('.right-column').scrollIntoView({ behavior: 'smooth' });
    }

    // Verificar se todos os itens já foram sorteados sem repetição
    if (!allowRepeatedItems) {
        const availableItems = items.filter(item => !drawnItems.includes(item));
        if (availableItems.length === 0) {
            alert('Não há mais itens disponíveis para sorteio! Você pode permitir itens repetidos nas opções ou reiniciar os sorteios.');
            drawBtn.disabled = false;
            return;
        }
    }

    // Filtrar itens disponíveis se não permitir repetição
    let availableItems = items;
    if (!allowRepeatedItems) {
        availableItems = items.filter(item => !drawnItems.includes(item));
    }

    // Criar animação de sorteio
    const shuffledItems = shuffleArray(availableItems);
    const winner = shuffledItems[0];

    // Exibir animação de roleta
    let count = 0;
    const totalCycles = 20;
    const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * availableItems.length);
        const randomItem = availableItems[randomIndex];

        // Criar elemento temporário de roleta
        const tempResult = document.createElement('div');
        tempResult.textContent = randomItem;
        tempResult.className = 'result-text';
        tempResult.style.opacity = '0.7';

        // Limpar div de resultado e adicionar item atual
        resultText.innerHTML = '';
        resultText.appendChild(tempResult);

        // Mostrar seção de resultado
        resultSection.classList.remove('hidden');

        // Aumentar contador
        count++;

        // Parar animação e mostrar vencedor
        if (count >= totalCycles) {
            clearInterval(interval);

            // Exibir resultado final com animação
            resultText.innerHTML = '';
            const finalResult = document.createElement('div');
            finalResult.textContent = winner;
            finalResult.className = 'result-text animate-bounce';
            resultText.appendChild(finalResult);

            // Adicionar ao histórico
            addToHistory(winner);

            // Criar efeito de confete
            createConfetti();

            // Rolar para o resultado em dispositivos móveis
            if (window.innerWidth <= 992) {
                resultSection.scrollIntoView({ behavior: 'smooth' });
            }

            // Habilitar botão novamente
            drawBtn.disabled = false;
        }
    }, 100);
}

// Mostrar interface da roleta
function showWheel() {
    // Esconder resultado anterior se existir
    resultSection.classList.add('hidden');

    // Rolar para a seção da roleta em dispositivos móveis
    if (window.innerWidth <= 992) {
        document.getElementById('wheel-section').scrollIntoView({ behavior: 'smooth' });
    }

    // Desenhar a roleta
    drawWheel();
}

function drawWheel(itemsToDisplay = items) {
    const ctx = wheelCanvas.getContext('2d');
    const width = wheelCanvas.width;
    const height = wheelCanvas.height;
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    // Limpar o canvas
    ctx.clearRect(0, 0, width, height);

    if (itemsToDisplay.length === 0) {
        ctx.font = '20px Poppins, sans-serif';
        ctx.fillStyle = 'gray';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Sem itens disponíveis', centerX, centerY);
        return;
    }

    const anglePerItem = (2 * Math.PI) / itemsToDisplay.length;

    const colors = [
        '#3498db', // Azul
        '#2ecc71', // Verde
        '#e74c3c', // Vermelho
        '#f39c12', // Laranja
        '#9b59b6', // Roxo
        '#1abc9c', // Turquesa
        '#34495e', // Azul escuro
        '#e67e22'  // Laranja escuro
    ];

    for (let i = 0; i < itemsToDisplay.length; i++) {
        const startAngle = i * anglePerItem + wheelRotationAngle;
        const endAngle = (i + 1) * anglePerItem + wheelRotationAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        const midAngle = (startAngle + endAngle) / 2;

        drawRadialText(
            ctx,
            itemsToDisplay[i],
            centerX,
            centerY,
            radius * 0.75, // Distância do centro
            midAngle,
            'bold 14px Poppins, sans-serif',
            '#fff'
        );
    }

    // Desenhar círculo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.15, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // Desenhar indicador ponteiro
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 10);
    ctx.lineTo(centerX - 10, centerY - radius + 10);
    ctx.lineTo(centerX + 10, centerY - radius + 10);
    ctx.closePath();
    ctx.fillStyle = '#f39c12';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Função para desenhar texto radial (do centro para fora)
function drawRadialText(ctx, text, centerX, centerY, radius, angle, font, color) {
    let displayText = text;
    if (displayText.length > 12) {
        displayText = displayText.substring(0, 10) + '...';
    }

    ctx.save();

    ctx.font = font;
    ctx.fillStyle = color;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.translate(centerX, centerY);

    ctx.rotate(angle);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (angle > Math.PI / 2 && angle < Math.PI * 3 / 2) {
        ctx.rotate(Math.PI);
        ctx.fillText(displayText, -radius * 0.7, 0);
    } else {
        ctx.fillText(displayText, radius * 0.7, 0);
    }

    ctx.restore();
}

// Girar a roleta
function spinWheel() {
    if (isSpinning) return;

    if (!allowRepeatedItems) {
        const availableItems = items.filter(item => !drawnItems.includes(item));
        if (availableItems.length === 0) {
            alert('Não há mais itens disponíveis para sorteio! Você pode permitir itens repetidos nas opções ou reiniciar os sorteios.');
            return;
        }
    }

    let availableItems = items;
    if (!allowRepeatedItems) {
        availableItems = items.filter(item => !drawnItems.includes(item));

        updateWheelWithAvailableItems(availableItems);
    }

    isSpinning = true;

    spinWheelBtn.disabled = true;

    let speed = 0.3;

    const stopAngle = 2 * Math.PI * (5 + Math.random() * 10);
    let totalRotation = 0;

    const spinAnimation = () => {
        wheelRotationAngle += speed;
        totalRotation += speed;

        if (totalRotation > stopAngle * 0.5) {
            speed *= 0.998;
        }

        drawWheel();

        if (totalRotation < stopAngle || speed > 0.01) {
            requestAnimationFrame(spinAnimation);
        } else {
            const wheelItems = allowRepeatedItems ? items : availableItems;
            const winner = getWinnerFromWheelPosition(wheelItems);

            isSpinning = false;
            spinWheelBtn.disabled = false;

            setTimeout(() => {
                resultText.innerHTML = '';
                const finalResult = document.createElement('div');
                finalResult.textContent = winner;
                finalResult.className = 'result-text animate-bounce';
                resultText.appendChild(finalResult);

                resultSection.classList.remove('hidden');

                addToHistory(winner);

                createConfetti();

                if (!allowRepeatedItems) {
                    updateWheelWithAvailableItems(items);
                }
            }, 500);
        }
    };

    spinAnimation();
}

function updateWheelWithAvailableItems(availableItems) {
    drawWheel(availableItems);
}

function getWinnerFromWheelPosition(wheelItems = items) {
    const pointerAngle = Math.PI * 1.5;

    let normalizedRotation = wheelRotationAngle % (2 * Math.PI);
    if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;

    let relativeAngle = (pointerAngle - normalizedRotation) % (2 * Math.PI);
    if (relativeAngle < 0) relativeAngle += 2 * Math.PI;

    const anglePerItem = (2 * Math.PI) / wheelItems.length;
    const itemIndex = Math.floor(relativeAngle / anglePerItem);

    const safeIndex = itemIndex % wheelItems.length;

    return wheelItems[safeIndex];
}

function addToHistory(result) {
    const historyItem = {
        result,
        date: new Date().toISOString()
    };

    history.unshift(historyItem);

    if (history.length > 10) {
        history = history.slice(0, 10);
    }

    if (!allowRepeatedItems && !drawnItems.includes(result)) {
        drawnItems.push(result);

        updateUIBasedOnItems();
    }

    saveToLocalStorage();
    renderHistory();
}

function createConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    confettiContainer.innerHTML = '';

    const colors = ['#f39c12', '#3498db', '#2ecc71', '#e74c3c', '#9b59b6'];

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.position = 'absolute';
        confetti.style.top = `${Math.random() * 100}%`;
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.opacity = Math.random() * 0.8 + 0.2;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';

        // Animação
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear`;

        confettiContainer.appendChild(confetti);
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            0% {
                transform: translateY(-10px) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            100% {
                transform: translateY(${window.innerHeight}px) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function toggleTheme() {
    if (document.body.getAttribute('data-theme') === 'dark') {
        document.body.removeAttribute('data-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('clicksorte-theme', 'light');
    } else {
        document.body.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('clicksorte-theme', 'dark');
    }

    if (!wheelSection.classList.contains('hidden')) {
        drawWheel();
    }
}

function resetLottery() {
    resultSection.classList.add('hidden');

    // Rolar para a seção de entrada em dispositivos móveis
    if (window.innerWidth <= 992) {
        document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
    }
}

function openShareModal() {
    shareModal.style.display = 'flex';
}

function closeShareModal() {
    shareModal.style.display = 'none';
}

function copyResult() {
    const result = resultText.textContent.trim();

    navigator.clipboard.writeText(result)
        .then(() => {
            const notification = document.createElement('div');
            notification.className = 'copy-notification';
            notification.textContent = 'Copiado para a área de transferência!';
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 2000);

            closeShareModal();
        })
        .catch(err => {
            alert('Erro ao copiar: ' + err);
        });
}

function downloadResult() {
    const result = resultText.textContent.trim();

    // Criar card para redes sociais
    const socialCard = document.createElement('div');
    socialCard.className = 'social-card';
    socialCard.style.position = 'fixed';
    socialCard.style.top = '-9999px';
    socialCard.style.left = '-9999px';
    socialCard.style.width = '1080px'; // Tamanho bom para redes sociais
    socialCard.style.height = '1080px';
    socialCard.style.padding = '40px';
    socialCard.style.borderRadius = '20px';
    socialCard.style.background = 'linear-gradient(135deg, var(--primary-color), var(--accent-color))';
    socialCard.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    socialCard.style.display = 'flex';
    socialCard.style.flexDirection = 'column';
    socialCard.style.alignItems = 'center';
    socialCard.style.justifyContent = 'center';
    socialCard.style.fontFamily = "'Poppins', sans-serif";
    socialCard.style.color = '#fff';
    socialCard.style.textAlign = 'center';

    // Logo
    const logo = document.createElement('div');
    logo.style.marginBottom = '50px';
    logo.style.fontSize = '36px';
    logo.style.fontWeight = 'bold';
    logo.style.display = 'flex';
    logo.style.alignItems = 'center';
    logo.style.gap = '15px';
    logo.innerHTML = '<svg width="60" height="60" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm3 7H9v-2h6v2z"/></svg>ClickSorte';
    socialCard.appendChild(logo);

    // Titulo
    const title = document.createElement('div');
    title.style.fontSize = '42px';
    title.style.marginBottom = '40px';
    title.style.color = 'rgba(255, 255, 255, 0.9)';
    title.textContent = 'Item Sorteado';
    socialCard.appendChild(title);

    // Resultado
    const resultDiv = document.createElement('div');
    resultDiv.style.fontSize = '72px';
    resultDiv.style.fontWeight = 'bold';
    resultDiv.style.marginBottom = '50px';
    resultDiv.style.padding = '40px 60px';
    resultDiv.style.background = 'rgba(255, 255, 255, 0.15)';
    resultDiv.style.backdropFilter = 'blur(10px)';
    resultDiv.style.borderRadius = '20px';
    resultDiv.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
    resultDiv.style.maxWidth = '90%';
    resultDiv.style.wordBreak = 'break-word';
    resultDiv.textContent = result;
    socialCard.appendChild(resultDiv);

    // Data e hora
    const dateTimeDiv = document.createElement('div');
    dateTimeDiv.style.fontSize = '24px';
    dateTimeDiv.style.opacity = '0.8';
    const now = new Date();
    dateTimeDiv.textContent = now.toLocaleDateString() + ' - ' + now.toLocaleTimeString();
    socialCard.appendChild(dateTimeDiv);

    // Adicionar confete decorativo
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = Math.random() * 20 + 10 + 'px';
        confetti.style.height = Math.random() * 20 + 10 + 'px';
        confetti.style.backgroundColor = ['#f39c12', '#3498db', '#2ecc71', '#e74c3c', '#9b59b6'][Math.floor(Math.random() * 5)];
        confetti.style.opacity = Math.random() * 0.5 + 0.5;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.top = Math.random() * 100 + '%';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        socialCard.appendChild(confetti);
    }

    // Rodapé
    const footer = document.createElement('div');
    footer.style.position = 'absolute';
    footer.style.bottom = '40px';
    footer.style.fontSize = '24px';
    footer.style.opacity = '0.7';
    footer.textContent = 'Parabéns!';
    socialCard.appendChild(footer);

    document.body.appendChild(socialCard);

    if (window.html2canvas) {
        html2canvas(socialCard, {
            backgroundColor: null,
            scale: 1
        }).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'clicksorte-resultado.png';
            link.click();

            document.body.removeChild(socialCard);

            closeShareModal();
        });
    } else {
        alert('Funcionalidade não disponível. Biblioteca html2canvas não encontrada.');

        document.body.removeChild(socialCard);

        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = () => {
            alert('Biblioteca carregada. Tente novamente.');
        };
        document.head.appendChild(script);
    }
}

function resizeWheel() {
    if (!wheelSection.classList.contains('hidden')) {
        drawWheel();
    }
}

function toggleAllowRepeated() {
    allowRepeatedItems = allowRepeatSwitch.checked;
    console.log("Permitir repetidos:", allowRepeatedItems); // Debug

    if (!allowRepeatedItems && drawnItems.length > 0) {
        if (confirm('Deseja reiniciar a lista de itens já sorteados?')) {
            drawnItems = [];
        }
    }

    if (allowRepeatedItems) {
        drawnItems = [];
    }

    saveToLocalStorage();

    updateUIBasedOnItems();
}

function updateUIBasedOnItems() {
    // Se não permitir repetições, verificar se ainda há itens disponíveis
    if (!allowRepeatedItems) {
        const availableItems = items.filter(item => !drawnItems.includes(item));

        // Atualizar botões
        if (availableItems.length === 0 && items.length > 0) {
            drawBtn.disabled = true;
            wheelBtn.disabled = true;
            spinWheelBtn.disabled = true;

            // Mostrar mensagem ao usuário
            if (document.querySelector('.no-items-message') === null) {
                const message = document.createElement('div');
                message.className = 'no-items-message';
                message.style.color = 'var(--error-color)';
                message.style.textAlign = 'center';
                message.style.padding = '10px';
                message.style.marginTop = '10px';
                message.innerHTML = 'Todos os itens já foram sorteados. <button id="reset-items-btn" class="btn primary-btn" style="margin-top: 5px;">Reiniciar Sorteios</button>';

                // Adicionar a mensagem à seção de itens
                const itemsSection = document.querySelector('.items-list-section');
                itemsSection.appendChild(message);

                // Adicionar evento ao botão
                document.getElementById('reset-items-btn').addEventListener('click', () => {
                    drawnItems = [];
                    saveToLocalStorage();
                    updateUIBasedOnItems();
                    message.remove();
                });
            }
        } else {
            drawBtn.disabled = false;
            wheelBtn.disabled = false;
            spinWheelBtn.disabled = false;

            // Remover mensagem se existir
            const message = document.querySelector('.no-items-message');
            if (message) {
                message.remove();
            }
        }
    } else {
        // Se permitir repetições, apenas verificar se há itens
        const hasEnoughItems = items.length >= 2;
        drawBtn.disabled = !hasEnoughItems;
        wheelBtn.disabled = !hasEnoughItems;
        spinWheelBtn.disabled = !hasEnoughItems;

        // Remover mensagem se existir
        const message = document.querySelector('.no-items-message');
        if (message) {
            message.remove();
        }
    }

    // Redesenhar a roleta com os itens atuais
    drawWheel();
}

document.addEventListener('DOMContentLoaded', () => {

    loadFromLocalStorage();


    themeToggleBtn.addEventListener('click', toggleTheme);
    addItemsBtn.addEventListener('click', addItems);
    drawBtn.addEventListener('click', drawItem);
    wheelBtn.addEventListener('click', showWheel);
    spinWheelBtn.addEventListener('click', spinWheel);
    newLotteryBtn.addEventListener('click', resetLottery);
    shareBtn.addEventListener('click', openShareModal);
    closeModal.addEventListener('click', closeShareModal);
    copyBtn.addEventListener('click', copyResult);
    downloadBtn.addEventListener('click', downloadResult);

    if (allowRepeatSwitch) {
        allowRepeatSwitch.addEventListener('change', toggleAllowRepeated);
        console.log("Switch de repetição registrado"); // Debug
    } else {
        console.log("Switch de repetição não encontrado"); // Debug
    }

    itemsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            addItems();
        }
    });

    itemsList.addEventListener('click', (e) => {
        if (e.target.closest('.delete-item')) {
            const button = e.target.closest('.delete-item');
            const index = button.dataset.index;
            removeItem(index);
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            closeShareModal();
        }
    });

    window.addEventListener('resize', resizeWheel);

    const script = document.createElement('script');
    script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    document.head.appendChild(script);
}); 