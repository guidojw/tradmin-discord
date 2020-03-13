'use strict'
const Command = require('../../controllers/command')

module.exports = class CreateVoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'createvote',
            aliases: ['vcreate'],
            description: 'Creates a vote with given name and description.',
            examples: ['createvote', 'createvote "Moderator Elections" "We are organising a vote. Please vote on' +
            ' your favorite participant!"'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [{
                key: 'title',
                type: 'string',
                prompt: 'What would you like the title of the vote to be?'
            }, {
                key: 'description',
                type: 'string',
                prompt: 'What would you like the description of the vote to be?'
            }]
        })
    }

    execute (message, { title, description }, guild) {
        if (guild.getData('vote')) return message.reply('There is already a vote created!')
        const voteData = { title: title, description: description, options: [] }
        guild.setData('vote', voteData)
        message.reply('Created vote!')
    }
}
