'use strict'
const { RichEmbed } = require('discord.js')

const discordService = require('../services/discord')

const PermissionError = require('../errors/permission-error')

const config = require('../../config/application')

exports.suggest = async req => {
    if (discordService.hasRole(req.member, config.suggestionsBannedRole)) throw new PermissionError()
    if (req.args.length > 0) {
        const suggestion = req.args.join(' ')
        const embed = new RichEmbed()
            .setDescription(suggestion)
            .setAuthor(`By: ${req.author.tag}`, req.author.displayAvatarURL)
        if (req.message.attachments.size > 0) {
            const attachment = req.message.attachments.first()
            if (attachment.height) embed.setImage(attachment.url)
        }
        const message = await req.message.guild.channels.find(channel => channel.name === 'suggestions').send({
            embed: embed
        })
        await message.react('✅')
        await message.react('🚫')
    }
}
