const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const app = express();
require("dotenv").config();


app.get('/',async (req,res) =>{
    res.json({"respons":"OK"})
})


const token = process.env.TOKEN;
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
    
    function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

    function cekUrl(isi){
        var words = isi.split(' ');
        if (words.length == '1'){
            if (isi.match(regex)) return isi
        } else if (words.length >= '2'){
            if (isi.match(regex)) return words[0]
        }
    }
    
    async function getData(version, url){
    try {
        if (version == '/stalk'){
            var { data } = await axios.get(`${process.env.HOST}/stalk?username=${url}`);
        } else {
            var { data } = await axios.get(`${process.env.HOST}/down?version=${version}&link=${url}`);
        }
        return data
    } catch (err) {
        return err
    }
}
  //bot.sendMessage(chatId, `${text}`);
  if (text == '/start'){
        bot.sendChatAction(chatId, 'typing')
        sleep(200)
        bot.sendMessage(chatId, 'bot started 😁👋 paste tiktok video or photo link.',{"reply_to_message_id":`${msg_id}`});
  } else if (text.match(regex)){
        const urls = cekUrl(text)
        if(!cekUrl(text)) {bot.editMessageText(`url invalid`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})}
        bot.sendChatAction(chatId, 'typing')
        sleep(200)
        bot.sendMessage(chatId, `wait.. check photo or video.`,{"reply_to_message_id":`${msg_id}`})
        var words = text.split(' ');
        if (words.length >= 2) {
        var wo = words[1]
        //console.log(` url tiktok = ${text.match(regex)}`)
            if (wo == '--json'){
                (async function(){
                var data = await getData('v2',`${urls}`)
                if (data.status == "success"){
                    var jsong = JSON.stringify(data)
                    bot.editMessageText(`detect ${data.result.type} type. && type json`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
                    bot.sendChatAction(chatId, 'typing')
                    sleep(300)
                    bot.sendMessage(chatId, `${'```json'} ${jsong}${'```'}`,{"parse_mode":"markdownv2"});
                    sleep(300)
                    bot.editMessageText(`success.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
                } else {
                    bot.sendChatAction(chatId, 'typing')
		    bot.editMessageText(`error.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
                    sleep(200)
                    bot.sendMessage(chatId,`${JSON.stringify(data)}`)
                }        
            })()
            } else if (wo == '--music'){
                (async function(){
                var data = await getData('v3',`${urls}`)
                if (data.status == "success"){
                    var jsong = JSON.stringify(data)
                    bot.editMessageText(`detect ${data.result.type} type. && send music`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
                    bot.sendChatAction(chatId, 'record_voice')
                    sleep(200)
                    if (data.result.type == 'image'){
                        bot.sendMessage(chatId, `[download music](${data.result.music})`,{"parse_mode":"markdownv2"});
                    } else {
                        bot.sendAudio(chatId, `${data.result.music}`);
                    }
                    sleep(200)
                    bot.editMessageText(`success.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
                } else {
                    bot.sendChatAction(chatId, 'typing')
		    bot.editMessageText(`error.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
                    sleep(200)
                    bot.sendMessage(chatId,`${JSON.stringify(data)}`)
                }              
            })()
            } else {
                bot.deleteMessage(chatId, `${msg_id}`)
                sleep(300)
                bot.sendChatAction(chatId, 'typing')
                sleep(200)
                bot.sendMessage(chatId, `text invalid âš `);
            }

    } else {
        (async function(){
        var data = await getData('v3',`${urls}`)
        if (data.status == "success"){
            var type = data.result.type
            var author = data.result.author.nickname
            var desc = data.result.desc
            bot.editMessageText(`detect ${type} type.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
            if (type == "video"){
                bot.sendChatAction(chatId, 'upload_video')
                sleep(200)
                try{
                    var escaped = desc.replace(/#/g, "\\#")
                    bot.sendVideo(chatId, `${data.result.video2}`,{"caption":`\>${escaped}\r\n\r\n[download HD](${data.result.video_hd})`,"parse_mode":"markdownv2"});
                } catch {
                    bot.sendVideo(chatId, `${data.result.video2}`,{"caption":`${desc}\r\n\r[download HD](${data.result.video_hd})`,"parse_mode":"markdownv2"})
                }
                sleep(300)
                bot.editMessageText(`success.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
            } else {
                bot.sendChatAction(chatId, 'upload_photo')
                var img = data.result.images
		//bot.editMessageText(`detect ${img.length} image`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
		
                for (let i = 0; i < img.length; i++) {
                    var slide = i+1
                    bot.sendDocument(chatId, `${img[i]}`,{"caption":`by: ${author} || slide ${slide}`});
              
		}
                sleep(1000)
                bot.editMessageText(`success send ${img.length} image.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
            }
        } else {
            bot.sendChatAction(chatId, 'typing')
	    bot.editMessageText(`error.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
            sleep(200)
            bot.sendMessage(chatId,`${JSON.stringify(data)}`)
        }    
    })()
    }
  } else if (text.includes('/stalk')){
    var words = text.split(' ');
    var wo = words[1]
    if (wo == ''){
        bot.sendChatAction(chatId, 'typing')
        sleep(200)
        bot.sendMessage(chatId,`username require!! ex: /stalk username`)
    } else {
    (async function(){
        var data = await getData('/stalk',`${wo}`)
        if (data.status == "success"){
	    var da = `
            username: ${data.result.users.username}\rnickname: ${data.result.users.nickname}\rverified: ${data.result.users.verified}\rprivateAccount: ${data.result.users.privateAccount}\rregion: ${data.result.users.region}\rfollower: ${data.result.stats.followerCount}\rfollowing: ${data.result.stats.followingCount}\rheart: ${data.result.stats.heartCount}\rvideo: ${data.result.stats.videoCount}\rlike: ${data.result.stats.likeCount}\rfriend: ${data.result.stats.friendCount}\r
            `
            bot.sendChatAction(chatId, 'upload_photo')
            bot.sendPhoto(chatId, `${data.result.users.avatarLarger}`)
            sleep(200)
            bot.sendChatAction(chatId, 'typing')
            bot.sendMessage(chatId,`${da}`)
        } else {
            bot.sendChatAction(chatId, 'typing')
	    bot.editMessageText(`error.`, {"chat_id":`${chatId}`,"message_id":`${msgid}`})
            sleep(200)
            bot.sendMessage(chatId,`${JSON.stringify(data)}`)
        }
    })()
    }
  } else if (text == '/donate'){
    bot.sendChatAction(chatId, 'typing')
    sleep(200)
      bot.sendPhoto(chatId, 'https://raw.githubusercontent.com/ahmadqsyaa/bot-down-tiktok/main/img.png',{"caption":"donate for hosting pm @rickk1kch, tank you."})
  } else if(text == '/help'){
    bot.sendChatAction(chatId, 'typing')
    sleep(200)
      bot.sendMessage(chatId, `Hi, this is an option for help
> if you want to download videos or photos you just send the url
> if you want to download music then you need to add --music after the url
> if you need json data then you just add --json after the url
> stalk for info detail user, /stalk username
Example:
https://vt*tiktok*com/abc123 --music/--json optional`);
  } else {
    bot.sendChatAction(chatId, 'typing')
    sleep(200)
    bot.sendMessage(chatId, "ðŸ¤¨ I don't understand, /help");
  }
});
app.listen(8080, () => console.log('Server started 3000'));