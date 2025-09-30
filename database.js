const { Pool } = require('pg');
require('dotenv').config();

// Usar Transaction Pooler que é mais estável para queries SQL
const connectionString = `postgresql://postgres.nvrxfrkofaztusqujzgs:${process.env.DB_PASSWORD}@aws-1-sa-east-1.pooler.supabase.com:6543/postgres`;

console.log('Tentando conectar via Transaction Pooler...');

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    },
    max: 5, // Limitar conexões simultâneas
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

// Função para testar conexão
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Conectado ao Supabase PostgreSQL com sucesso!');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco:', error.message);
        return false;
    }
}

// Função para salvar mensagem
async function saveMessage(content, userId) {
    try {
        const query = 'INSERT INTO messages (content, user_id) VALUES ($1, $2) RETURNING *';
        const result = await pool.query(query, [content, userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Erro ao salvar mensagem:', error);
        throw error;
    }
}

// Função para buscar mensagens recentes
async function getRecentMessages(limit = 50) {
    try {
        const query = 'SELECT * FROM messages ORDER BY timestamp DESC LIMIT $1';
        const result = await pool.query(query, [limit]);
        return result.rows.reverse(); // Retornar em ordem cronológica
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        throw error;
    }
}

// Função para criar notificação
async function createNotification(messageId, userId, notificationType = 'message') {
    try {
        const query = 'INSERT INTO notifications (message_id, user_id, notification_type) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(query, [messageId, userId, notificationType]);
        return result.rows[0];
    } catch (error) {
        console.error('Erro ao criar notificação:', error);
        throw error;
    }
}

// Função para buscar notificações não lidas
async function getUnreadNotifications(userId) {
    try {
        const query = `
            SELECT n.*, m.content as message_content, m.user_id as sender_id 
            FROM notifications n 
            JOIN messages m ON n.message_id = m.id 
            WHERE n.user_id = $1 AND n.is_read = false 
            ORDER BY n.timestamp DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        throw error;
    }
}

// Função para marcar notificação como lida
async function markNotificationAsRead(notificationId) {
    try {
        const query = 'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [notificationId]);
        return result.rows[0];
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        throw error;
    }
}

module.exports = {
    pool,
    testConnection,
    saveMessage,
    getRecentMessages,
    createNotification,
    getUnreadNotifications,
    markNotificationAsRead
};