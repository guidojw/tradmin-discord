'use strict'
const Command = require('../../controllers/command')

module.exports = class StartVoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'startvote',
            description: 'Starts the vote created using the createvote command.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES', 'ADD_REACTIONS'],
            args: [{
                key: 'channel',
                type: 'channel',
                prompt: ''
            }, {
                key: 'date',
                type: 'string',
                prompt: ''
            }, {
                key: 'time',
                type: 'string',
                prompt: ''
            }]
        })
    }

    execute (message, { channel, date, time }, guild) {

    }
}
