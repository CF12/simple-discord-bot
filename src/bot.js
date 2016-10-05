// Import requirements
const fs = require('fs')
const path = require('path')
const ytdl = require('ytdl-core')
const Discord = require('discord.js')

// Convert JSONs to JS objects
let data = JSON.parse(fs.readFileSync(path.join(__dirname + '/data.json')))
let config = JSON.parse(fs.readFileSync(path.join(__dirname + '/config.json')))

// Sets up objects
let bot = new Discord.Client()

// Logs Bot in w/ token
bot.login(config.bot_token)

// Random Number Function
function randomNum (min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

// Variables
let pf = '$'

// Error Handeling
bot.on('error', (err) => {
  bot.sendMessage('```ERROR: Unknown: See details:\n' + err + '```')
  console.log(err)
  throw (err)
})

// Voice Variables
var inVoice = false
var voiceChannel = null

// Voice Connect Function
function voiceConnect (channel) {
  try {
    voiceChannel = channel
    inVoice = true
    return voiceChannel.join()
  } catch (err) {
    console.log(err)
  }
}

// Voice Disconnect Function
function voiceDisconnect (channel) {
  try {
    voiceChannel = channel
    inVoice = false
    console.log('Disconnected from channel')
    return voiceChannel.leave()
  } catch (err) {
    console.log(err)
  }
}

// Convert Duration Function
function convertDuration (time) {
  time = time * 1000
  var minutes = Math.floor(time / 60000)
  var hours = Math.floor(minutes / 60)
  var seconds = Math.floor(((time) - (minutes * 60000)) / 1000)
  minutes -= hours * 60
  if (minutes < 10 && hours > 0) minutes = ':' + minutes
  if (seconds < 10) seconds = '0' + seconds
  if (hours > 0) return hours + ':' + minutes + ':' + seconds
  else return minutes + ':' + seconds
}

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
      if (inVoice === false) {
        let voiceChannel = message.member.voiceChannel
        voiceConnect(voiceChannel)
        .then(connection => {
          console.log('Connected to channel: ' + connection.channel)
          const dispatcher = connection.playFile(__dirname + '/john_cena.mp3')
          dispatcher.setVolume(0.1)
          dispatcher
          dispatcher.on('end', () => {
            voiceDisconnect(voiceChannel)
          })
        })
        .catch(console.log)
      } else {
        message.channel.sendMessage('**ERROR: Already in a voice channel!**')
      }
    }

    // Rick Roll Command
    if (message.content.startsWith(pf + 'rr')) {
      if (inVoice === false) {
        let voiceChannel = message.member.voiceChannel
        voiceConnect(voiceChannel)
        .then(connection => {
          console.log('Connected to channel: ' + connection.channel)
          const dispatcher = connection.playFile(__dirname + '/rick_roll.mp3')
          dispatcher.setVolume(0.3)
          dispatcher
          dispatcher.on('end', () => {
            voiceDisconnect(voiceChannel)
          })
        })
        .catch(console.log)
      } else {
        message.channel.sendMessage('**ERROR: Already in a voice channel!**')
      }
    }

    // Play from youtube
    if (message.content.startsWith(pf + 'play')) {
      let url = message.content.split(' ')
      if (inVoice === false) {
        let voiceChannel = message.member.voiceChannel
        voiceConnect(voiceChannel)
          .then(connection => {
            message.channel.sendMessage('**INFO: ** Grabbing video data...')
            const stream = ytdl(url[1], {filter: 'audioonly'})
            const dispatcher = connection.playStream(stream)
            ytdl.getInfo(url[1], (err, info) => {
              message.channel.sendMessage('**NOW PLAYING: **' + info.title + ' [' + convertDuration(info.length_seconds) + ']')
              console.log('Connected to channel: ' + connection.channel)
              console.log('Playing YouTube audio: ' + url[1])
              dispatcher
              if (err) console.log(err)
            })
            dispatcher.on('end', () => {
              voiceDisconnect(voiceChannel)
            })
          })
          .catch(console.log)
      } else {
        message.channel.sendMessage('**ERROR: Already in a voice channel!**')
      }
    }

    // Volume Adjustment
    if (message.content.startsWith(pf + 'volume')) {
      let volume = message.content.split(' ')
      data.volume = volume[1]
      fs.writeFileSync(path.join(__dirname + '/data.json'), JSON.stringify(data))
    }

    // Leave Voice Command
    if (message.content.startsWith(pf + 'leave')) {
      if (inVoice === true) {
        voiceDisconnect(voiceChannel)
        message.channel.sendMessage('**INFO: Disconnected from voice channel**')
      } else {
        message.channel.sendMessage('**ERROR: The bot is not in a voice channel!**')
      }
    }
  })
})
