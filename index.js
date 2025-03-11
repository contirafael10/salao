require('dotenv').config();
const express = require('express');
const axios = require('axios');
const wppconnect = require('@wppconnect-team/wppconnect');

const app = express();
app.use(express.json());

const PORT = 3000;
const AMELIA_WEBHOOK_URL = process.env.AMELIA_WEBHOOK_URL || 'http://localhost:3000/webhook/amelia';

wppconnect.create().then(client => {
  console.log('Conectado ao WhatsApp!');

  async function sendMessage(phone, message) {
    try {
      if (!phone) throw new Error("Número de telefone ausente.");

      console.log("Número recebido do webhook:", phone);
      let formattedPhone = phone.replace(/\D/g, '');

      if (formattedPhone.startsWith("55")) {
        if (formattedPhone.slice(2, 4) == 31) {
          formattedPhone = formattedPhone.slice(0, 4) + formattedPhone.slice(5);
        }
        console.log("Número formatado para envio:", formattedPhone);

        await client.sendText(`${formattedPhone}@c.us`, message);
        console.log(`✅ Mensagem enviada para ${formattedPhone}: ${message}`);
      } else {
        console.error("❌ Erro: O número não contém o código do país esperado.");
      }
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
    }
  }

  const moment = require('moment-timezone');

  app.post('/webhook/amelia', async (req, res) => {
    console.log("🚨 Webhook recebido do Amelia");

    try {
      console.log("📋 Dados completos do webhook:", JSON.stringify(req.body, null, 2));

      const appointment = req.body.appointment;
      const customer = appointment?.bookings?.[0]?.customer;
      const isRescheduled = appointment?.isRescheduled;
      const customerPanelUrl = appointment?.bookings?.[0]?.customerPanelUrl || "";

      let service = appointment?.service?.name || "Serviço não especificado";
      let status = appointment?.status?.toLowerCase();
      let novaDataAgendamento = appointment?.bookingStart || "Data não informada";

      console.log(`🔍 Nome Cliente: ${customer?.firstName} ${customer?.lastName}`);
      console.log(`🔍 Nova Data Agendamento: ${novaDataAgendamento}`);
      console.log(`🔗 Link da área do cliente (customerPanelUrl): ${customerPanelUrl}`);

      let telefone = customer?.phone;
      if (!telefone) {
        console.error("⚠️ Número de telefone ausente.");
        return res.status(400).send("Erro: Número de telefone ausente.");
      }

      telefone = telefone.replace(/\D/g, '');
      console.log(`📞 Número formatado para envio: ${telefone}`);

      let dataFormatada = "Data não informada";
      if (moment(novaDataAgendamento, moment.ISO_8601, true).isValid()) {
        dataFormatada = moment(novaDataAgendamento).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm");
      }

      let message = "";

      if (isRescheduled) {
        message = `🔄 Olá ${customer?.firstName || "Cliente"}, seu atendimento na *Luz e Art* foi REAGENDADO para o dia *${dataFormatada}*.`;
      } else if (status === "approved") {
        message = `✅ Olá ${customer?.firstName || "Cliente"}, seu agendamento para *${service}* está confirmado para *${dataFormatada}*. Obrigado por escolher nossos serviços! 😊\n\n👉 [Clique aqui](<${customerPanelUrl}>) para acessar sua área do cliente.`;
      } else if (status === "canceled") {
        message = `⚠️ Olá ${customer?.firstName || "Cliente"}, seu agendamento para *${service}* no dia *${dataFormatada}* foi CANCELADO. Se precisar reagendar, entre em contato conosco. 😞`;
      } else {
        message = `🚨 O status do agendamento é desconhecido.`;
      }

      await sendMessage(telefone, message);
      res.status(200).send("✅ Mensagem enviada com sucesso!");
    } catch (error) {
      console.error("❌ Erro no webhook:", error);
      res.status(500).send("Erro ao processar o webhook.");
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });

}).catch(error => console.error('❌ Erro ao conectar ao WhatsApp:', error));
