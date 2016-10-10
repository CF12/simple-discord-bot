// Import requirements
const fs = require('fs')
const path = require('path')
const ytdl = require('ytdl-core')
const ypi = require('youtube-playlist-info')
const Discord = require('discord.js')

// Convert JSONs to JS objects
let data = JSON.parse(fs.readFileSync(path.join(__dirname + '/data.json')))
let config = JSON.parse(fs.readFileSync(path.join(__dirname + '/config.json')))

// Sets up bot
let bot = new Discord.Client()

// Variables
let pf = '$'
let dispatcher
let inVoice = false
let voiceChannel = null
let playlist = []
let storeVolume = null

// Random Number Function
function randomNum (min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

// Rock Paper SCISSORS Function
function rps (user) {
  let bot = randomNum(1, 3)
  user = user.toUpperCase()

  switch (bot) {
    case 1:
      bot = 'ROCK'
      break
    case 2:
      bot = 'PAPER'
      break
    case 3:
      bot = 'SCISSORS'
      break
  }

  if (user === 'ROCK') {
    if (bot === 'ROCK') return ['WTF A TIE HOW', user, bot]
    if (bot === 'PAPER') return ['HAHA I WIN YOU LOSELOSE HAHA', user, bot]
    if (bot === 'SCISSORS') return ['WHAT HOW DID YOU WIN', user, bot]
  }

  if (user === 'PAPER') {
    if (bot === 'PAPER') return ['WTF A TIE HOW', user, bot]
    if (bot === 'SCISSORS') return ['HAHA I WIN YOU LOSE HAHA', user, bot]
    if (bot === 'ROCK') return ['WHAT HOW DID YOU WIN', user, bot]
  }

  if (user === 'SCISSORS') {
    if (bot === 'SCISSORS') return ['WTF A TIE HOW', user, bot]
    if (bot === 'ROCK') return ['HAHA I WIN YOU LOSE HAHA', user, bot]
    if (bot === 'PAPER') return ['WHAT HOW DID YOU WIN', user, bot]
  }
}

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

// Play Song Function
function playSong (voiceChannel, message, callback) {
  voiceConnect(voiceChannel)
  .then(connection => {
    let stream = ytdl(playlist[0], {filter: 'audioonly'})
    dispatcher = connection.playStream(stream)
    message.channel.sendMessage('**INFO: ** Grabbing video data...')

    ytdl.getInfo(String(playlist[0]), (err, info) => {
      if (err) console.log(err)

      message.channel.sendMessage('**NOW PLAYING: **' + info.title + ' [' + convertDuration(info.length_seconds) + ']')
      console.log('Connected to channel: ' + connection.channel)
      console.log('Playing YouTube audio: ' + info.title)
      dispatcher
      dispatcher.setVolumeDecibels(storeVolume)
      dispatcher.setVolume(0.5)

      dispatcher.on('end', () => {
        playlist.shift()
        if (playlist.length === 0) {
          console.log('Queue ended. Disconnecting...')
          message.channel.sendMessage('**INFO: **Queue ended. Disconnecting...')
          voiceDisconnect(voiceChannel)
          inVoice = false
        }
        if (callback) callback()
      })
    })
  })
  .catch(err => {
    console.log(err)
  })
}

// Voice Disconnect Function
function voiceDisconnect (channel) {
  try {
    playlist = []
    voiceChannel = channel
    inVoice = false
    console.log('Disconnected from channel')
    return voiceChannel.leave()
  } catch (err) {
    console.log(err)
  }
}

// Volume Control Handler
function volumeHandler (volume) {
  if (volume % 1 === 0 && volume >= 0 && volume <= 20) {
    let output = Math.floor((volume - 20) * 1.3)
    storeVolume = output
    return [output, '**INFO: **Volume was set to: ' + volume]
  } else {
    return [false, '**ERROR: **Invalid amount! Must be an integer between 0 and 20.']
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
  bot.user.setStatus('online', config.game_status)

  // On message detected event
  bot.on('message', (message) => {
    // Rock Paper SCISSORS
    if (message.content.startsWith(pf + 'rps')) {
      let userChoice = message.content.split(' ')
      if (userChoice[1].toUpperCase() === 'ROCK' || userChoice[1].toUpperCase() === 'PAPER' || userChoice[1].toUpperCase() === 'SCISSORS') {
        let results = rps(userChoice[1])
        message.channel.sendMessage('__**' + results[0] + '**__' + '\n\n**User\'s choice: **' + results[1] + '\n**Bot\'s choice: **' + results[2])
      } else {
        message.channel.sendMessage('**ERROR: **Invalid syntax! Be sure to use "rps (rock, paper, or scissors)"')
      }
    }

    // "Help" command (WIP)
    if (message.content.startsWith(pf + 'help')) {
      message.channel.sendMessage('**You need help' + message.author + '? Okay, I found you some help:**\n\nhttps://en.wikipedia.org/wiki/Therapy\n\nROASTED\n\n(This feature is still in WIP, okay?)')
    }

    // DM Somebody (WIP)
    // if (message.content.startsWith(pf + 'dm')) {
    //   let args = message.content.split(' ')
    //   let user = args[1].substring(2, args[1].length - 1)
    //   console.log(user)
    //   let DMChannel = user.channel
    //
    //   DMChannel.sendMessage('Test')
    // }

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
        voiceChannel = message.member.voiceChannel
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
        message.channel.sendMessage('**ERROR: **Already in a voice channel!')
      }
    }

    // Rick Roll Command
    if (message.content.startsWith(pf + 'rr')) {
      if (inVoice === false) {
        voiceChannel = message.member.voiceChannel
        voiceConnect(voiceChannel)
        .then(connection => {
          console.log('Connected to channel: ' + connection.channel)
          const dispatcher = connection.playFile(__dirname + '/rick_roll.mp3')
          dispatcher.setVolume(0.5)
          dispatcher
          dispatcher.on('end', () => {
            voiceDisconnect(voiceChannel)
          })
        })
        .catch(console.log)
      } else {
        message.channel.sendMessage('**ERROR: **Already in a voice channel!')
      }
    }

    // Play from YouTube
    if (message.content.startsWith(pf + 'play')) {
      const commandLength = (pf + 'play').length
      let url = message.content.split(' ')[1]

      if (message.content.length === commandLength) {
        message.channel.sendMessage('**INFO: **Plays a song from a youtube link. Usage: ' + pf + 'play (URL)')
      } else if (inVoice === true && playlist.length !== 0) {
        if (url.includes('youtube.com') && url.includes('v=') && url.length === 43) {
          playlist.push(url)
          message.channel.sendMessage('**INFO: **Song added to queue')
        } else if (url.includes('youtube.com') && url.includes('list=') && url.length === 72) {
          console.log('Playlist detected: Parsing...')
          message.channel.sendMessage('**INFO: **Playlist detected: Parsing...')

          ypi.playlistInfo(config.yt_api_key, String(url.substring(url.indexOf('list=') + 5, url.length)), (pl) => {
            for (var i = 0; i < pl.length; i++) {
              let videoID = pl[parseInt(i, 10)].resourceId.videoId
              playlist.push('https://www.youtube.com/watch?v=' + videoID)
            }
          })
        } else {
          console.log('URL not valid: Queue canceled')
          message.channel.sendMessage('**ERROR: **Invalid URL! Please make sure you use a VALID YouTube URL.')
        }
      } else if (inVoice === false && playlist.length === 0) {
        voiceChannel = message.member.voiceChannel

        if (url.includes('youtube.com') && url.includes('v=') && url.length === 43) {
          playlist.push(url)
          playSong(voiceChannel, message, () => {
            if (inVoice === true) {
              playSong(voiceChannel, message)
            }
          })
        } else if (url.includes('youtube.com') && url.includes('list=') && url.length === 72) {
          console.log('Playlist detected: Parsing...')
          message.channel.sendMessage('**INFO: **Playlist detected: Parsing...')

          ypi.playlistInfo(config.yt_api_key, String(url.substring(url.indexOf('list=') + 5, url.length)), (pl) => {
            for (var i = 0; i < pl.length; i++) {
              let videoID = pl[parseInt(i, 10)].resourceId.videoId
              playlist.push('https://www.youtube.com/watch?v=' + videoID)
            }

            playSong(voiceChannel, message, () => {
              if (inVoice === true) {
                playSong(voiceChannel, message)
              }
            })
          })
        } else {
          console.log('URL not valid: stream canceled')
          message.channel.sendMessage('**ERROR: **Invalid URL! Please make sure you use a VALID YouTube URL.')
        }
      } else {
        message.channel.sendMessage('**ERROR: **Already in a voice channel!')
      }
    }

    // Debug Command
    if (message.content.startsWith(pf + 'db')) {
      message.channel.sendMessage('```IN VOICE: ' + inVoice + '\nPLAYLIST ARRAY: ' + String(playlist) + '```')
      console.log(playlist)
    }

    // Leave Voice Command
    if (message.content.startsWith(pf + 'leave')) {
      if (inVoice === true) {
        voiceDisconnect(voiceChannel)
        message.channel.sendMessage('**INFO: **Disconnected from voice channel')
      } else {
        message.channel.sendMessage('**ERROR: **The bot is not in a voice channel!')
      }
    }

    // Volume Handler
    if (message.content.startsWith(pf + 'volume')) {
      let volumeMessage = message.content.split(' ')
      let volume = volumeMessage[1]
      let volumeResult = volumeHandler(volume)

      if (volumeResult[0] !== false && inVoice === true) {
        dispatcher.setVolumeDecibels(volumeResult[0])
        console.log('Volume was set to: ' + volume)
        message.channel.sendMessage(volumeResult[1])
      } else if (inVoice === false) {
        console.log('Invalid Volume Command: Bot was not in voice channel')
        message.channel.sendMessage('**ERROR: **The bot is not in a voice channel!')
      } else {
        console.log('Invalid Volume Input! Volume was not changed.')
        message.channel.sendMessage(volumeResult[1])
      }
    }

    // Destroy bot
    if (message.content.startsWith(pf + 'destroy')) {
      console.log('Shutting down bot...')
      message.channel.sendMessage('**INFO: **Shutting down...')
      setTimeout(() => {
        bot.destroy()
        process.exit(0)
      }, 1000)
    }
  })
})

// Error Handeling
bot.on('error', (err) => {
  bot.sendMessage('```ERROR: Unknown: See details:\n' + err + '```')
  console.log(err)
  throw (err)
})

// Logs Bot in w/ token
bot.login(config.bot_token)
