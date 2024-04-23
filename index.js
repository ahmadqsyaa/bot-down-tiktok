const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const app = express();

app.get('/',async (req,res) =>{
    res.json({"respons":"OK"})
})


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const token = '6830537126:AAFmP4fYhtaFmVbOkK3cJY1Cloo4Cyujyqk';
const bot = new TelegramBot(token, {polling: true});


bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  bot.sendMessage(chatId, resp);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
console.log(msg)
const text = msg.text
const msg_id = msg.message_id
const msgid = msg_id+1
const name = msg.from.first_name

const regex = /^https?:\/\/([a-z]+\.|)tiktok\.com\/([\w]+|\@\D+\w+)/g;
  //bot.sendMessage(chatId, `${text}`);
  if (text == '/start'){
      bot.sendMessage(chatId, 'bot started 😁👋 paste tiktok video or photo link.',{"reply_to_message_id":`${msg_id}`});
  } else if (text.match(regex)){
      bot.sendMessage(chatId, `wait.. check photo or video.`,{"reply_to_message_id":`${msg_id}`})
      
      async function get(url) {
          try {
            const { data } = await axios.get(`https://tt-api-dl.vercel.app/down?version=v3&link=${url}`);
            const type = data.result.type
            const author = data.result.author.nickname
            const desc = data.result.desc
            const escaped = desc.replace(/#/g, "\\#")
            bot.editMessageText(`detect ${type} type.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
            if (type == "video"){
            //bot.deleteMessage(chatId, `${msgid}`)
            await bot.sendVideo(chatId, `${data.result.video2}`,
            {
            "caption":`\>${escaped}`,
            "parse_mode":"markdownv2"
            });
            //sleep(200)
            //bot.sendAudio(chatId, `${data.result.music}`)
            sleep(300)
            bot.editMessageText(`success.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
            } else {
              //bot.deleteMessage(chatId, `${msgid}`)
                const dat = data.result.images
            for (let i = 0; i < dat.length; i++) {
                const slide = i+1
                bot.sendDocument(chatId, `${dat[i]}`,{"caption":`@${author} slide ${slide}`});
            }
            }
          } catch (er){
            bot.sendMessage(chatId, `${er}`);
          }
      }
      get(text)
  } else if (text == '/donate'){
      bot.sendPhoto(chatId, 'https://i.ibb.co/q1BD5vx/Screenshot-20240419-214501.png',{"caption":"donate for buy hosting pm @rickk1kch, tank you."})
  } else if(text == '/help'){
      bot.sendMessage(chatId, `paste tiktok video or photo link.`);
  } else {
    bot.sendMessage(chatId, "🤨 I don't understand, /help");
  }
});
app.listen(80, () => console.log('Server started 3000'));
