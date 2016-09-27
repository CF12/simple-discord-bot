// Import requirements
const fs = require('fs')
const path = require('path')
let Discord

// Tries for discord.js install
try {
  Discord = require('discord.js')
} catch (err) {
  console.log('ERROR: discord.js not found! Please make sure you use "npm install discord.js" before using the bot!')
}

// Init data.json
let data = JSON.parse(fs.readFileSync(path.join(__dirname + '/data.json')))

// Set's up bot object
let bot = new Discord.Client()

// Logs Bot in w/ token
bot.login('MjI5NzYzMTAzMDQ5MzgzOTM2.Csn_FA.o5RT8CUQuL0NO2VlAQoey-RLxaw')

// Random Number Function
function randomNum (min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

// Variables
let pf = 'j!'

// Error Handeling
bot.on('error', (err) => {
  bot.sendMessage('```ERROR: Unknown: See details:\n" + err + "```')
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
  })
})
