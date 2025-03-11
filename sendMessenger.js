const wppconnect = require('@wppconnect-team/wppconnect');

// Função para enviar mensagem
const sendMessage = async (phone, message) => {
  try {
    // Cria a conexão com o WhatsApp
    const client = await wppconnect.create();

    // Envia a mensagem para o número
    await client.sendText(`${phone}@c.us`, message);
    console.log('Mensagem enviada com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
};

module.exports = sendMessage;
