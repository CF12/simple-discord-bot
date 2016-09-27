// Import requirements
const fs = require('fs')
const path = require('path')
// const Opus = require('node-opus')
const Discord = require('discord.js')

// Init data.json
let data = JSON.parse(fs.readFileSync(path.join(__dirname + '/data.json')))

// Sets up objects
let bot = new Discord.Client()
let voiceChannel = new Discord.VoiceChannel()
// let encoder = new Opus.OpusEncoder()

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

// Bot initiates after it's ready
bot.on('ready', () => {
  console.log('Bot is ready!')

  // On message detected event
  bot.on('message', (message) => {
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
      voiceChannel.join().then(connection => {
        connection.playFile('/john_cena.mp3')
      })
    }
  })

  // Voice disconnecter
  streamDispatcher.on('end', () => {
    voiceChannel.leave()
  })
})
