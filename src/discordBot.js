// Import requirements
const fs = require('fs')
const path = require('path')
const ytdl = require('ytdl-core')
const Discord = require('discord.js')

// Init data.json
let data = JSON.parse(fs.readFileSync(path.join(__dirname + '/data.json')))

// Sets up objects
let bot = new Discord.Client()

// Logs Bot in w/ token
bot.login(data.bot_token)

// Random Number Function
function randomNum (min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

// Variables
let pf = 'j!'

// Error Handeling
bot.on('error', (err) => {
  bot.sendMessage('```ERROR: Unknown: See details:\n' + err + '```')
  console.console.error(err)
})

// Voice Function
function voice (channel) {
  let voiceChannel = channel
  return voiceChannel.join()
}

// Bot initiates after it's ready
bot.on('ready', () => {
  console.log('Bot is ready!')

  // On message detected event
  bot.on('message', (message) => {
    // Sets voice channel to channel in which user initiated it
    let voiceChannel = message.member.voiceChannel

    // "Michael" string detected
    if (message.content.startsWith(pf + 'michael')) {
      message.channel.sendMessage(data.replies_michael[randomNum(0, data.replies_michael.length)])
    }

    // Diagnostics and Status
    if (message.content.startsWith(pf + 'status')) {
      message.channel.sendMessage('```> BOT STATUS < \n===============\n' + 'Bot created by CF12#1240\n' + 'Bot started: | ' + bot.readyTime + '\n' + 'Bot uptime:  | ' + bot.uptime + ' miliseconds' + '```')
    }

    // John Cena Voice Command
    if (message.content.startsWith(pf + 'jc')) {
      voice(voiceChannel)
      .then(connection => {
        console.log('Connected to channel: ' + connection.channel)
        let dispatcher = connection.playFile(__dirname + '/john_cena.mp3')
        dispatcher
        dispatcher.on('end', () => {
          voiceChannel.leave()
        })
      })
      .catch(console.log)
    }

    // Play from youtube
    if (message.content.startsWith(pf + 'play')) {
      let url = message.content.slice(pf.length + 6, message.content.len)
      voice(voiceChannel)
        .then(connection => {
          const stream = ytdl(url, {filter: 'audioonly'})
          const dispatcher = connection.playStream(stream)
          dispatcher
          dispatcher.on('end', () => {
            voiceChannel.leave()
          })
        })
        .catch(console.log)
    }

    // Volume Adjustment
    if (message.content.startsWith(pf + 'volume')) {
      let volume = message.content.slice(pf.length + 7, message.content.length)
      console.log(volume)
      voice(voiceChannel)
        .then(connection => {
          const dispatcher = connection.dispatcher
          dispatcher.setVolume(2)
          message.channel.sendMessage('**Volume set to:** ' + volume)
        })
        .catch(console.log)
    }

    // Leave Voice Command
    if (message.content.startsWith(pf + 'leave')) {
      voiceChannel.leave()
    }
  })
})
