const socket = io();

// Conectar com o servidor
socket.on('connect', () => {
    console.log('Conectado ao servidor');
});

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

// Exibir mensagem na tela
function displayMessage(message, timestamp, userId, isHistory = false) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    if (isHistory) {
        messageElement.classList.add('history');
    }

    const time = new Date(timestamp).toLocaleTimeString();
    const shortUserId = userId ? userId.substring(0, 8) : 'unknown';
    messageElement.innerHTML = `<strong>${time} [${shortUserId}]</strong>: ${message}`;

    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}