const Discord = require('discord.js');
const { Client, Intents, Collection } = require('discord.js');
const token = 'Insert_Token';

//Client instance with necessary intents
const fs = require('fs');
const path = require('path');
const voiceDataPath = path.join(__dirname, 'voiceData.json');

// Load or initialize the voice activity data
let voiceData;
try {
    voiceData = JSON.parse(fs.readFileSync(voiceDataPath));
} catch (error) {
    voiceData = {};
}
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.GuildPresences, Discord.GatewayOpcodes.Identify, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildMessageTyping, Discord.GatewayIntentBits.AutoModerationExecution, Discord.GatewayIntentBits.DirectMessageReactions, Discord.GatewayIntentBits.GuildIntegrations] });

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


// Listen for new messages
client.on('messageCreate', message => {
    if (message.author.bot || !message.guild) return;

    if (message.content.startsWith('!voicetime')) {
        const userId = message.author.id;
        const sessions = voiceData[userId] || [];
        let totalTime = 0;
        sessions.forEach(session => {
            if (session.join && session.leave) {
                totalTime += new Date(session.leave) - new Date(session.join);
            }
        });
        const totalTimeHours = (totalTime / (1000 * 60 * 60)).toFixed(2);
        message.reply(`You have spent a total of ${totalTimeHours} hours in voice channels.`);
    }
});

function saveVoiceData() {
    fs.writeFileSync(voiceDataPath, JSON.stringify(voiceData, null, 4));
}



// Log in to Discord with your app's token
client.login(token);