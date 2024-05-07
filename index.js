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
console.log(msg);
const text = msg.text;
const msg_id = msg.message_id;
const msgid = msg_id+1;
const name = msg.from.first_name;

const regex = /^https?:\/\/([a-z]+\.|)tiktok\.com\/([\w]+|\@\D+\w+)/g;
  //bot.sendMessage(chatId, `${text}`);
  if (text == '/start'){
      bot.sendMessage(chatId, 'bot started 😁👋 paste tiktok video or photo link.',{"reply_to_message_id":`${msg_id}`});
  } else if (text.match(regex)){
      bot.sendMessage(chatId, `wait.. check photo or video.`,{"reply_to_message_id":`${msg_id}`});
      
      var words = text.split(' ');
    if (words.length >= 2) {
        var wo = words[1];
        var urls = text.match(regex);
        //console.log(` url tiktok = ${text.match(regex)}`);
            if (wo == '--json'){
                //console.log(`text ke 2 adalah berformat json`);
                async function gut(one){
                var { data } = await axios.get(`https://tt-api-dl.vercel.app/down?version=v2&link=${one}`);
                var jsong = JSON.stringify(data);
                bot.editMessageText(`detect ${data.result.type} type. && type json`, {"chat_id":`${chatId}`,"message_id":`${msgid}`});
                await bot.sendMessage(chatId, `${'```json'} ${jsong}${'```'}`,{"parse_mode":"markdownv2"});
                sleep(300);
                bot.editMessageText(`success.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`});
                }
                gut(urls)
            } else if (wo == '--music'){
                //console.log(`text ke 2 adalah berformat text`)
                async function got(one){
                var { data } = await axios.get(`https://tt-api-dl.vercel.app/down?version=v3&link=${one}`);
                bot.editMessageText(`detect ${data.result.type} type. && send music`, {"chat_id":`${chatId}`,"message_id":`${msgid}`});
                await bot.sendAudio(chatId, `${data.result.music}`);
                sleep(300);
                bot.editMessageText(`success.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`});
                }
               got(urls)
            } else {
                //console.log('format invalid ❌, /help'
  //sleep(300)
  bot.deleteMessage(chatId, `${msg_id}`);
  sleep(300);
  bot.sendMessage(chatId, `text invalid ⚠️`);
  //bot.editMessageText(`format invalid ⚠️`, {"chat_id":`${chatId}`,"message_id":`${msg_id+1}`});
  //bot.sendMessage(chatId, `text invalid ⚠️`);
            }
    } else {
        //console.log(text.match(regex))
        async function get(url) {
          try {
            var { data } = await axios.get(`https://tt-api-dl.vercel.app/down?version=v3&link=${url}`);
            var type = data.result.type;
            var author = data.result.author.nickname;
            var desc = data.result.desc;
            bot.editMessageText(`detect ${type} type.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`});
            if (type == "video"){
            //bot.deleteMessage(chatId, `${msgid}`)
            try{
            var escaped = desc.replace(/#/g, "\\#");
            await bot.sendVideo(chatId, `${data.result.video2}`,
            {
            "caption":`\>${escaped}`,
            "parse_mode":"markdownv2"
            });
            } catch {
              await bot.sendVideo(chatId, `${data.result.video2}`,
            {
            "caption":`${desc}`
            });
            }
            //sleep(200)
            //bot.sendAudio(chatId, `${data.result.music}`)
            sleep(300)
            bot.editMessageText(`success.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`});
            } else {
     //bot.deleteMessage(chatId, `${msgid}`)
                var dat = data.result.images;
            for (let i = 0; i < dat.length; i++) {
                const slide = i+1;
                bot.sendDocument(chatId, `${dat[i]}`,{"caption":`@${author} slide ${slide}`});
            }
            sleep(300);
            bot.editMessageText(`success.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`});
           }
          } catch (er){
            bot.sendMessage(chatId, `${er}`);
          }
      }
     get(text)
    } 
      //get(text)
  } else if (text == '/donate'){
      bot.sendPhoto(chatId, 'https://i.ibb.co/q1BD5vx/Screenshot-20240419-214501.png',{"caption":"donate for buy hosting pm @rickk1kch, tank you."});
  } else if(text == '/help'){
      bot.sendMessage(chatId, `Hi, this is an option for help
> if you want to download videos or photos you just send the url
> if you want to download music then you need to add --music after the url
> if you need json data then you just add --json after the url
Example:
https://vt.tiktok.com/abc123 --music/--json optional`);
  } else {
    bot.sendMessage(chatId, "🤨 I don't understand, /help");
  }
});
app.listen(3000, () => console.log('Server started 3000'));
