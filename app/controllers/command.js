'use strict'
const Commando = require('discord.js-commando')
const discordService = require('../services/discord')

module.exports = class Command extends Commando.Command {
    constructor(client, info) {
        info.memberName = info.name
        info.argsPromptLimit = info.argsPromptLimit || 1
        info.guildOnly = info.guildOnly !== undefined ? info.guildOnly : true
        super(client, info)
        this.adminOnly = info.adminOnly !== undefined ? info.adminOnly : info.group === 'admin' || info.group === 'voting'
    }

    hasPermission (message, ownerOverride) {
        if (!this.ownerOnly && this.adminOnly) {
            const guild = this.client.bot.getGuild(message.guild.id)
            return discordService.isAdmin(message.member, guild.getData('adminRoles'))
        }
        return super.hasPermission(message, ownerOverride)
    }

    async run (message, args) {
        const guild = message.guild ? this.client.bot.getGuild(message.guild.id) : undefined
        return this.execute(message, args, guild)
    }
}
