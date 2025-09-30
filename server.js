const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const {
    pool,
    testConnection,
    saveMessage,
    getRecentMessages,
    createNotification,
    getUnreadNotifications,
    markNotificationAsRead
} = require('./database');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Armazenar usuários conectados
const connectedUsers = new Map();

// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

console.log('Servidor iniciado - teste do chat em tempo real');

// Testar conexão com o banco ao iniciar
testConnection();

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para buscar histórico de mensagens
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await getRecentMessages();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
});

// Configuração do Socket.IO para chat
io.on('connection', async (socket) => {
    console.log('Usuário conectado:', socket.id);

    // Adicionar usuário à lista de conectados
    connectedUsers.set(socket.id, { id: socket.id, connected_at: new Date() });

    // Enviar histórico de mensagens ao conectar
    try {
        const recentMessages = await getRecentMessages(20);
        socket.emit('message_history', recentMessages);

        // Enviar notificações não lidas
        const unreadNotifications = await getUnreadNotifications(socket.id);
        if (unreadNotifications.length > 0) {
            socket.emit('unread_notifications', unreadNotifications);
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }

    // Escutar mensagens do chat
    socket.on('chat_message', async (message) => {
        console.log('Mensagem recebida:', message);

        try {
            // Salvar mensagem no banco
            const savedMessage = await saveMessage(message, socket.id);

            // Criar notificações para todos os outros usuários conectados
            const otherUsers = Array.from(connectedUsers.keys()).filter(id => id !== socket.id);

            for (const userId of otherUsers) {
                try {
                    await createNotification(savedMessage.id, userId, 'message');
                } catch (notificationError) {
                    console.error('Erro ao criar notificação para usuário:', userId, notificationError);
                }
            }

            // Enviar mensagem para todos os usuários
            io.emit('chat_message', {
                id: savedMessage.id,
                message: savedMessage.content,
                timestamp: savedMessage.timestamp,
                user_id: savedMessage.user_id
            });

            // Enviar notificação para outros usuários
            socket.broadcast.emit('new_notification', {
                type: 'message',
                message: `Nova mensagem de ${socket.id.substring(0, 8)}`,
                timestamp: savedMessage.timestamp
            });

        } catch (error) {
            console.error('Erro ao processar mensagem:', error);

            // Enviar mensagem mesmo se não salvou no banco
            io.emit('chat_message', {
                message: message,
                timestamp: new Date().toISOString(),
                user_id: socket.id
            });
        }
    });

    // Escutar desconexão
    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
        connectedUsers.delete(socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});