'use strict'
const Command = require('../../controllers/command')

module.exports = class CreateVoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'createvote',
            description: '',
            details: '',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [{
                key: 'name',
                type: 'string',
                prompt: ''
            }, {
                key: 'description',
                type: 'string',
                prompt: ''
            }]
        })
    }

    execute (message, { name, description }, guild) {

    }
}
