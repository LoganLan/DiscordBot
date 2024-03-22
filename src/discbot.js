const Discord = require('discord.js');
const { Client, Intents, Collection } = require('discord.js');
const token = 'Token_Here';

//Client instance with necessary intents
const fs = require('fs');
const path = require('path');
const voiceDataPath = path.join(__dirname, 'voiceData.json');
console.log(voiceDataPath)

// Load or initialize the voice activity data
let voiceData;
try {
    voiceData = JSON.parse(fs.readFileSync(voiceDataPath));
} catch (error) {
    voiceData = {};
}
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.GuildPresences, Discord.GatewayOpcodes.Identify, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildMessageTyping, Discord.GatewayIntentBits.AutoModerationExecution, Discord.GatewayIntentBits.DirectMessageReactions, Discord.GatewayIntentBits.GuildIntegrations, Discord.GatewayIntentBits.GuildVoiceStates] });

// When the bot is ready, log a message to the console
client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('voiceStateUpdate', (oldState, newState) => {
    // Check if the user has joined a voice channel 
    if (!oldState.channelId && newState.channelId) {
        const joinTime = new Date();
        if (!voiceData[newState.id]) {
            voiceData[newState.id] = [];
        }
        voiceData[newState.id].push({ join: joinTime, leave: null });
        saveVoiceData();
    }

    // Check if the user has left a voice channel 
    if (oldState.channelId && !newState.channelId) {
        const leaveTime = new Date();
        const sessions = voiceData[oldState.id];
        if (sessions && sessions.length > 0) {
            const lastSession = sessions[sessions.length - 1];
            lastSession.leave = leaveTime;
            saveVoiceData();
        }
    }
});

// Welcome new guild members
client.on('guildMemberAdd', member => {
    const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'welcome'); // Adjust 'welcome' to your channel's name
    if (!welcomeChannel) return;
    welcomeChannel.send(`Welcome to the server, ${member}!`);
});


// Checking time spent in call
let timeEntered = 0
let timeLeft = 0
let inCall = false
client.on('voiceStateUpdate', async (oldState, newState) => {
    let newUserChannel = newState.channel
    let oldUserChannel = oldState.channel
    if (oldUserChannel === null && newUserChannel !== null) {
        // User Join a voice channel
        inCall = true
        const currentDate = new Date()
        timeEntered = currentDate.getTime()
      } else if (oldUserChannel !== null && newUserChannel === null) {
        // User Leave a voice channel
        inCall = false
        const currentDate = new Date()
        timeLeft = currentDate.getTime()
      } else if (
        oldUserChannel !== null &&
        newUserChannel !== null &&
        oldUserChannel.id != newUserChannel.id
      ) {
     }
  });

// Listen for new messages
client.on('messageCreate', message => {
    if (message.author.bot || !message.guild) return

    if (message.content.startsWith('!voicetime')) {
        const userId = message.author.id
        const sessions = voiceData[userId] || []
        let totalTime = 0
        sessions.forEach(session => {
            if (session.join && session.leave) {
                totalTime += new Date(session.leave) - new Date(session.join)
            }
        });
        const totalTimeHours = Math.floor((totalTime / (1000 * 60 * 60)).toFixed(2))
        const totalTimeMinutes = Math.floor((totalTime / (1000 * 60)).toFixed(2))
        message.reply(`You have spent a total of ${totalTimeHours} hours and ${totalTimeMinutes} minutes in voice channels.`)
    }

    // Check how much time you've been in the current call.
    if (message.content.startsWith('!incall')) {
        const currentDate = new Date()
        let currentTime = currentDate.getTime()
        let minutesSpent = Math.floor((currentTime - timeEntered) / (1000 * 60))
        let secondsSpent = Math.floor((currentTime - timeEntered) / (1000))
        if (!inCall) {
            message.reply("You are not currently in a call.")
            return
        }
        message.reply(`You have spent a total of ${minutesSpent} minutes in call.`)
        return
    }
});

function saveVoiceData() {
    fs.writeFileSync(voiceDataPath, JSON.stringify(voiceData, null, 4));
}




client.login(token);
