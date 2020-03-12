'use strict'
const Command = require('../../controllers/command')

module.exports = class StartVoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'startvote',
            description: 'Finishes the vote that was started with the startvote command. Will post the results in the' +
            ' same channel as where the vote itself was posted.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message, _args, guild) {

    }
}
