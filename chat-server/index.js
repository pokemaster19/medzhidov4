const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server, path: "/chat" });

const chatHistory = [];
const MAX_HISTORY = 50;

wss.on('connection', (ws) => {
  // Отправляем последние 20 сообщений при подключении
  ws.send(JSON.stringify({
    type: 'history',
    data: chatHistory.slice(-20)
  }));

  ws.on('message', (rawData) => {
    try {
      const msgData = JSON.parse(rawData);
      
      // Валидация сообщения
      if (!msgData.user || !msgData.text) return;
      
      const message = {
        user: msgData.user,
        text: msgData.text.trim(),
        timestamp: new Date().toISOString()
      };
      
      // Сохраняем в историю
      chatHistory.push(message);
      if (chatHistory.length > MAX_HISTORY) chatHistory.shift();

      // Рассылаем всем клиентам
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'message',
            data: message
          }));
        }
      });
    } catch (e) {
      console.error('Ошибка обработки сообщения:', e);
    }
  });
});

server.listen(3001, () => {
  console.log('WebSocket сервер запущен на порту 3001');
});