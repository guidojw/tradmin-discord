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

    execute (message, _args, guild) {
        const images = guild.getData('images')
        if (!images.map) return message.reply('Couldn\'t find image.')
        message.reply(new MessageAttachment(images.map))
    }
}

