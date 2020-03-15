'use strict'
const Command = require('../../controllers/command')
const { MessageAttachment } = require('discord.js')

module.exports = class MapCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'main',
            name: 'map',
            description: 'Posts the map of Terminal Railways.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES', 'ATTACH_FILES']
        })
    }

    execute (message) {
        message.reply(new MessageAttachment('https://media.discordapp.net/attachments/508612034284355594/6' +
            '79474511506178106/1.png?width=902&height=902'))
    }
}

