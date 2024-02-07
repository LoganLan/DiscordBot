const Discord = require('discord.js');
const client = new Discord.Client();

const token = 'MTIwNDkxODgyMjcwNDc3NTE2OA.GOoso9.r5bJpgQqv3MgHbGTCxzGoFkxcOuf89AdZGoqZI'; 
// Object to store user times
let userTimes = {};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
    let userId = newPresence.user.id;
    let userName = newPresence.user.username;
    let status = newPresence.status;

    // Check if the user has become active (online/idle) from being offline/dnd
    if ((oldPresence && (oldPresence.status === 'offline' || oldPresence.status === 'dnd')) &&
        (status === 'online' || status === 'idle')) {
        // Mark the start time
        if (!userTimes[userId]) {
            userTimes[userId] = { start: Date.now() };
            console.log(`${userName} has become active.`);
        }
    } else if ((oldPresence && (oldPresence.status === 'online' || oldPresence.status === 'idle')) &&
               (status === 'offline' || status === 'dnd')) {
        // Mark the end time and calculate duration
        if (userTimes[userId] && userTimes[userId].start) {
            let duration = Date.now() - userTimes[userId].start;
            console.log(`${userName} was active for ${duration / 1000} seconds.`);
            // Reset or delete the user's start time
            delete userTimes[userId];
        }
    }
});

client.login(token);