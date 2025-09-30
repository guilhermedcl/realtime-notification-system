# 💬 Sistema de Notificações em Tempo Real

Sistema de chat com notificações em tempo real desenvolvido com Node.js, Socket.IO e PostgreSQL.

## 🚀 Tecnologias

- Node.js
- Express
- Socket.IO
- PostgreSQL (Supabase)
- HTML/CSS/JavaScript

## 📱 Funcionalidades

- Chat em tempo real
- Notificações visuais
- Histórico e horário de mensagens
- Cores diferentes por usuário

## 🖼️ Screenshots

### Chat em funcionamento
<img src="chat-screenshot.png" alt="Chat em funcionamento" width="600">

### Notificações em tempo real
<img src="notification-screenshot.png" alt="Notificação" width="400">

## ⚙️ Como usar

1. Clone o repositório
```bash
git clone https://github.com/guilhermedcl/realtime-notification-system
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
   - Renomeie o arquivo `.env.example` para `.env`
   - Preencha com suas credenciais do Supabase:
```bash
PORT=3000
DB_HOST=seu-host-supabase.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=sua-senha-supabase
```

4. Execute o projeto
```bash
npm run dev
```

5. Acesse `http://localhost:3000`

## 📦 Scripts

- `npm start` - Inicia o servidor
- `npm run dev` - Inicia em modo desenvolvimento com nodemon

---
