'use strict'
const Command = require('../../controllers/command')

module.exports = class StartVoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'startvote',
            description: '',
            details: '',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message, _args, guild) {

    }
}
