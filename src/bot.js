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
let dispatcher = null
let inVoice = false
let voiceChannel = null
let playlist = []
let storeVolume = -10
let shuffle = false
let msg = null

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
    return [output, '**INFO: **Volume was set to: ' + volume]
  } else {
    return [false, '**ERROR: **Invalid amount! Must be an integer between 0 and 20.']
  }
}

// Add song function
function addSong (url, callback) {
  ytdl.getInfo(String(url), (err, info) => {
    if (err) console.log(err)

    playlist.push([url, info.title, convertDuration(info.length_seconds)])
    if (callback) callback()
    return
  })
}

// Play Song Function
function playSong () {
  voiceConnect(voiceChannel)
  .then(connection => {
    let song
    let songIndex
    if (shuffle) {
      songIndex = randomNum(0, playlist.length)
      song = playlist[songIndex]
    } else {
      song = playlist[0]
    }

    let stream = ytdl(song[0], {quality: 'lowest', filter: 'audioonly'})
    dispatcher = connection.playStream(stream)

    msg.channel.sendMessage('**NOW PLAYING: **' + song[1] + ' [' + song[2] + ']')
    console.log('Connected to channel: ' + connection.channel)
    console.log('Playing YouTube audio: ' + song[0])
    dispatcher.setVolume(0.5)
    dispatcher.setVolumeDecibels(storeVolume)

    endDispatcherHandler(songIndex)
  })
  .catch(err => {
    console.log(err)
  })
}

// End of Dispatcher handler
function endDispatcherHandler (songIndex) {
  dispatcher.on('end', () => {
    playlist.splice(songIndex, 1)
    if (playlist.length === 0) {
      console.log('Queue ended. Disconnecting...')
      msg.channel.sendMessage('**INFO: **Queue ended. Disconnecting...')
      voiceDisconnect(voiceChannel)
      inVoice = false
      return
    } else {
      playSong()
      return
    }
  })
}

// Convert Duration Function
function convertDuration (time) {
  let hours = parseInt(time / 3600, 10) % 24
  let minutes = parseInt(time / 60, 10) % 60
  let seconds = time % 60
  if (hours >= 1) return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds)
  if (minutes >= 1) return (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds)
  else return '00:' + (seconds < 10 ? '0' + seconds : seconds)
}

// Bot initiates after it's ready
bot.on('ready', () => {
  console.log('Bot is ready!')
  bot.user.setStatus('online', config.game_status)
})

// On message detected event
bot.on('message', (message) => {
  // Clones local message into global msg
  msg = message

  // Ayy lmao
  if (message.content.toUpperCase() === 'AYY') {
    message.channel.sendMessage('**lmao**')
  }

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

  // "Michael" string detected
  if (message.content.startsWith(pf + 'michael')) {
    message.channel.sendMessage(data.replies_michael[randomNum(0, data.replies_michael.length)])
  }

  // Diagnostics and Status
  if (message.content.startsWith(pf + 'status')) {
    message.channel.sendMessage('```> BOT STATUS < \n===============\n' + 'Bot created by CF12#1240\n' + 'Bot started: | ' + bot.readyTime + '\n' + 'Bot uptime:  | ' + bot.uptime + ' miliseconds' + '```')
  }

  // John Cena Voice Command
  if (message.content === pf + 'jc') {
    if (inVoice === false) {
      voiceChannel = message.member.voiceChannel
      voiceConnect(voiceChannel)
      .then(connection => {
        playlist.push(['John Cena', 'JC', '[4:20]'])
        console.log('Connected to channel: ' + connection.channel)
        dispatcher = connection.playFile(__dirname + '/john_cena.mp3')
        dispatcher.setVolume(0.1)
        endDispatcherHandler(0)
        dispatcher.on('end', () => {
          dispatcher.end()
        })
      })
      .catch(console.log)
    } else {
      message.channel.sendMessage('**ERROR: **Already in a voice channel!')
    }
  }

  // Rick Roll Command
  if (message.content === pf + 'rr') {
    if (inVoice === false) {
      voiceChannel = message.member.voiceChannel
      voiceConnect(voiceChannel)
      .then(connection => {
        playlist.push(['Rick Roll', 'RR', '[4:20]'])
        console.log('Connected to channel: ' + connection.channel)
        dispatcher = connection.playFile(__dirname + '/rick_roll.mp3')
        dispatcher.setVolume(0.5)
        endDispatcherHandler(0)
        dispatcher.on('end', () => {
          dispatcher.end()
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
    } else if (true) {
      voiceChannel = message.member.voiceChannel

      if (url.includes('youtube.com') && url.includes('v=') && url.length === 43) {
        message.channel.sendMessage('**INFO :** Added to queue')
        addSong(url, () => {
          if (inVoice === false) playSong()
        })
      } else if (url.includes('youtube.com') && url.includes('list=') && url.length === 72) {
        console.log('Playlist detected: Parsing...')
        message.channel.sendMessage('**INFO: **Playlist detected: Parsing...')

        ypi.playlistInfo(config.yt_api_key, String(url.substring(url.indexOf('list=') + 5, url.length)), (pl) => {
          for (var i = 0; i < pl.length; i++) {
            let videoID = pl[parseInt(i, 10)].resourceId.videoId
            addSong('https://www.youtube.com/watch?v=' + videoID, () => {
              if (inVoice === false) playSong()
            })
          }
        })
      } else {
        console.log('URL not valid: stream canceled')
        message.channel.sendMessage('**ERROR: **Invalid URL! Please make sure you use a VALID YouTube URL.')
      }
    } else {
      message.channel.sendMessage('**ERROR: **Already in a voice channel!')
    }
  }

  // List Song Queue
  if (message.content.startsWith(pf + 'queue')) {
    if (playlist.length !== 0) {
      let queue = playlist[0][1] + ' '.repeat(60 - playlist[0][1].length) + '|' + ' ' + playlist[0][2] + '\n'
      for (let i = 1; i < playlist.length; i++) {
        if (queue.length > 1800) {
          queue = queue + '...and ' + (playlist.length - i) + ' more'
          break
        }
        queue = queue + playlist[i][1] + ' '.repeat(60 - playlist[i][1].length) + '|' + ' ' + playlist[i][2] + '\n'
      }

      message.channel.sendMessage('**INFO: **Song Queue:\n```' + queue + '```')
    } else {
      message.channel.sendMessage('**INFO: **Song Queue:\n```' + 'THERE ARE NO SONGS YOU AUTIST' + '```')
    }
  }

  // Song Skipping
  if (message.content.startsWith(pf + 'skip')) {
    if (inVoice === true) {
      console.log('Skipping Song...')
      message.channel.sendMessage('**INFO: **Skipping song...')
      dispatcher.end()
    } else {
      message.channel.sendMessage('**ERROR: **The bot is not in a voice channel!')
    }
  }

  // Song Shuffling
  if (message.content.startsWith(pf + 'shuffle')) {
    let arg = message.content.split(' ')[1]
    if (arg === undefined) {
      if (shuffle === false) {
        shuffle = true

        message.channel.sendMessage('**INFO: **Song shuffling is now ON')
        console.log('Song shuffling: ON')
      } else {
        shuffle = false

        message.channel.sendMessage('**INFO: **Song shuffling is now OFF')
        console.log('Song shuffling: OFF')
      }
    } else if (arg === 'on' || arg === 'true') {
      shuffle = true

      message.channel.sendMessage('**INFO: **Song shuffling is now ON')
      console.log('Song shuffling: ON')
    } else if (arg === 'off' || arg === 'false') {
      shuffle = false

      message.channel.sendMessage('**INFO: **Song shuffling is now OFF')
      console.log('Song shuffling: OFF')
    } else {
      message.channel.sendMessage('**ERROR: **Invalid usage! Use ' + pf + 'shuffle [on, off].')
    }
  }

  // Debug Command
  if (message.content.startsWith(pf + 'db')) {
    console.log(inVoice)
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
      storeVolume = volumeResult[0]
      dispatcher.setVolumeDecibels(storeVolume)
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

// Error Handeling
bot.on('error', (err) => {
  bot.sendMessage('```ERROR: Unknown: See details:\n' + err + '```')
  console.log(err)
  throw (err)
})

// Logs Bot in w/ token
bot.login(config.bot_token)
