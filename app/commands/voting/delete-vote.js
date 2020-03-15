'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class StartVoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'deletevote',
            aliases: ['vdelete'],
            description: 'Deletes the currently created vote.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    async execute (message, _args, guild) {
        const voteData = guild.getData('vote')
        if (!voteData) return message.reply('There is no created vote!')
        const choice = await discordService.prompt(message.channel, message.author, await message.reply('Are you sure' +
            ' you would like to delete the created vote?'))
        if (choice) {
            guild.setData('vote', undefined)
            message.reply('Deleted vote!')
        } else {
            message.reply('Did not delete vote!')
        }
    }
}
