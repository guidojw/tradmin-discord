'use strict'
const Command = require('../../controllers/command')

module.exports = class SetActivityCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'admin',
            name: 'setactivity',
            aliases: ['activity'],
            description: 'Sets the current activity of the bot.',
            examples: ['/activity playing "Roblox"', '/activity streaming "Game Development" https://twitch.tv']
        })
    }

    execute = async (message, args, fromPattern, guild) => {
        console.log('here')
    }
}
