'use strict'
const Command = require('../../controllers/command')

module.exports = class AddOptionCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'addoption',
            aliases: ['vadd'],
            description: 'Adds an option with given name and description to vote at.',
            examples: ['addoption', 'addoption "Mr. Jones" "Hi, my name is Joe."'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [{
                key: 'name',
                type: 'string',
                prompt: 'What would you like the name of this option to be?'
            }, {
                key: 'description',
                type: 'string',
                prompt: 'What would you like the description of this option to be?'
            }]
        })
    }

    execute (message, { name, description }, guild) {
        const voteData = guild.getData('vote')
        if (!voteData) return message.reply('There is no vote created yet!')
        if (voteData.options.length >= 10) return message.reply('A vote cannot have more than 10 options!')
        const option = { name: name, description: description }
        if (message.attachments.size > 0) option.image = message.attachments.first().url
        voteData.options.push(option)
        guild.setData('vote', voteData)
        message.reply('Added option!')
    }
}
