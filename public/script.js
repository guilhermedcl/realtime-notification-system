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
    displayMessage(data.message, data.timestamp);
});

// Exibir mensagem na tela
function displayMessage(message, timestamp) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    const time = new Date(timestamp).toLocaleTimeString();
    messageElement.innerHTML = `<strong>${time}</strong>: ${message}`;

    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}