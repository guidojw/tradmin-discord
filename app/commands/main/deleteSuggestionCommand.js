'use strict'
const Command = require('../../controllers/command')

module.exports = class DeleteSuggestionCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'main',
            name: 'deletesuggestion',
            aliases: ['delete'],
            description: 'Deletes your last suggested suggestion.'
        })
    }

    execute = async (message, args, fromPattern, guild) => {

    }
}
