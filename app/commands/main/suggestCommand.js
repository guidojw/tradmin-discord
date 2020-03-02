'use strict'
const Command = require('../../controllers/command')

module.exports = class SuggestCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'main',
            name: 'suggest',
            description: 'Suggests given suggestion.',
            examples: ['/suggest "Add cool new thing"']
        })
    }

    execute = async (message, args, fromPattern, guild) => {

    }
}
