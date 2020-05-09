'use strict'
const Command = require('../../controllers/command')
const { MessageEmbed } = require('discord.js')
const { getDurationString } = require('../../helpers/time')

module.exports = class UptimeCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'bot',
            name: 'uptime',
            description: 'Posts the bot\'s uptime.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {
        const embed = new MessageEmbed()
            .addField('TRadmin has been online for', getDurationString(this.client.uptime))
        message.replyEmbed(embed)
    }
}
