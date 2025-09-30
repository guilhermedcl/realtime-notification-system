const socket = io();

// Armazenar cores dos usuários
const userColors = {};
const availableColors = [
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
    '#F44336', '#795548', '#607D8B', '#E91E63'
];
let colorIndex = 0;

// Conectar com o servidor
socket.on('connect', () => {
    console.log('Conectado ao servidor');
});

// Função para obter cor do usuário
function getUserColor(userId) {
    if (!userColors[userId]) {
        userColors[userId] = availableColors[colorIndex % availableColors.length];
        colorIndex++;
    }
    return userColors[userId];
}

// Função para enviar mensagem
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (message) {
        socket.emit('chat_message', message);
        messageInput.value = '';
    }
}

// Escutar Enter no input
document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Escutar mensagens do servidor
socket.on('chat_message', (data) => {
    displayMessage(data.message, data.timestamp, data.user_id);
});

// Escutar histórico de mensagens
socket.on('message_history', (messages) => {
    console.log('Carregando histórico:', messages.length, 'mensagens');
    messages.forEach(msg => {
        displayMessage(msg.content, msg.timestamp, msg.user_id, true);
    });
});

// Escutar notificações não lidas
socket.on('unread_notifications', (notifications) => {
    console.log('Notificações não lidas:', notifications.length);
    notifications.forEach(notification => {
        showNotification(`Mensagem não lida: ${notification.message_content}`, 'info');
    });
});

// Escutar novas notificações
socket.on('new_notification', (notification) => {
    showNotification(notification.message, 'success');
});

// Função para exibir notificação na tela
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>🔔 ${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    document.body.appendChild(notification);

    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Exibir mensagem na tela estilo WhatsApp
function displayMessage(message, timestamp, userId, isHistory = false) {
    const messagesDiv = document.getElementById('messages');
    const messageContainer = document.createElement('div');

    // Verificar se é mensagem própria
    const isOwnMessage = userId === socket.id;
    const userColor = getUserColor(userId);
    const shortUserId = userId ? userId.substring(0, 8) : 'unknown';

    messageContainer.className = `message-container ${isOwnMessage ? 'own' : 'other'}`;

    const time = new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    messageContainer.innerHTML = `
        <div class="message-bubble ${isHistory ? 'history' : ''}" style="background-color: ${isOwnMessage ? '#DCF8C6' : userColor}">
            <div class="message-header">
                <span class="user-name">${shortUserId}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-content">${message}</div>
        </div>
    `;

    messagesDiv.appendChild(messageContainer);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}