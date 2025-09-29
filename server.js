const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
// const pool = require('./database');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

console.log('Servidor iniciado - teste do chat em tempo real');

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configuração do Socket.IO para chat
io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    // Escutar mensagens do chat
    socket.on('chat_message', (message) => {
        console.log('Mensagem recebida:', message);

        // Enviar mensagem para todos os usuários
        io.emit('chat_message', {
            message: message,
            timestamp: new Date().toISOString(),
            user_id: socket.id
        });
    });

    // Escutar desconexão
    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});