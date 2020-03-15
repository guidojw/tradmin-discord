'use strict'
const Command = require('../../controllers/command')

module.exports = class StartVoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'finishvote',
            aliases: ['vfinish'],
            description: 'Finishes the vote that was started with the startvote command. Will post the results in the' +
            ' same channel as where the vote itself was posted.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message, _args, guild) {
        const voteData = guild.getData('vote')
        if (!voteData) return message.reply('There is no vote created yet, create one using the createvote command.')


    }
}
