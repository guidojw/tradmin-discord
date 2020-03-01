'use strict'
const Commando = require('discord.js-commando')

module.exports = class Command extends Commando.Command {
    constructor(client, info) {
        info.memberName = info.name
        info.argsPromptLimit = 1
        info.guildOnly = true
        super(client, info)
    }

    hasPermission = message => {
        return true
    }

    run = async (message, args, fromPattern) => {
        this.guild = this.client.bot.getGuild(message.guild.id)
        return this.execute(message, args, fromPattern)
    }
}
