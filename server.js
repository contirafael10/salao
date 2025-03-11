{\rtf1\ansi\ansicpg1252\cocoartf2821
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh13200\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const express = require('express');\
const bodyParser = require('body-parser');\
const wppconnect = require('@wppconnect-team/wppconnect');\
\
const app = express();\
const port = 3000;\
\
// Vari\'e1vel global para armazenar o cliente do WhatsApp\
let whatsappClient;\
\
// Inicializando o cliente do WhatsApp uma vez\
wppconnect.create().then(client => \{\
  whatsappClient = client;\
  console.log('Conectado ao WhatsApp!');\
\}).catch(error => \{\
  console.error('Erro ao conectar ao WhatsApp:', error);\
\});\
\
// Usando body-parser para ler JSON\
app.use(bodyParser.json());\
\
// Endpoint para receber os dados do agendamento do Amelia\
app.post('/webhook/amelia', async (req, res) => \{\
  try \{\
    // Extraindo os dados do agendamento enviados pelo Amelia\
    const \{ nome_cliente, telefone, data_agendamento, 'servi\'e7o': servico \} = req.body;\
    \
    // Garantir que o n\'famero de telefone esteja no formato correto\
    const telefoneFormatado = `+$\{telefone\}`;\
\
    // Enviar mensagem de confirma\'e7\'e3o via WhatsApp\
    if (whatsappClient) \{\
      await whatsappClient.sendText(`$\{telefoneFormatado\}@c.us`, `Ol\'e1 $\{nome_cliente\}, seu agendamento para $\{servico\} est\'e1 confirmado para $\{data_agendamento\}.`)\
        .then(response => \{\
          console.log('Mensagem enviada:', response);\
          res.status(200).send('Mensagem enviada com sucesso');\
        \}).catch(error => \{\
          console.error('Erro ao enviar mensagem:', error);\
          res.status(500).send('Erro no envio da mensagem');\
        \});\
    \} else \{\
      console.error('Cliente do WhatsApp n\'e3o est\'e1 conectado.');\
      res.status(500).send('Cliente do WhatsApp n\'e3o est\'e1 dispon\'edvel');\
    \}\
  \} catch (error) \{\
    console.error('Erro no servidor:', error);\
    res.status(500).send('Erro interno no servidor');\
  \}\
\});\
\
app.listen(port, () => \{\
  console.log(`Servidor escutando na porta $\{port\}`);\
\});\
}