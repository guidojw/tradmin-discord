'use strict'
const { RichEmbed } = require('discord.js')

const discordService = require('../services/discord')

const PermissionError = require('../errors/permission-error')

exports.suggest = async req => {
    if (discordService.hasRole(req.member, req.config.suggestionsBannedRole)) {
        throw new PermissionError('You are banned from using the suggest command!')
    }
    if (!discordService.hasRole(req.member, req.config.suggestionsRole)) {
        const rolesChannel = req.guild.channels.find(channel => channel.name === 'roles')
        throw new PermissionError(`Please check ${rolesChannel} first!`)
    }
    if (req.args.length > 0) {
        const suggestion = req.args.join(' ')
        const embed = new RichEmbed()
            .setDescription(suggestion)
            .setAuthor(`By: ${req.author.tag}`, req.author.displayAvatarURL)
        if (req.message.attachments.size > 0) {
            const attachment = req.message.attachments.first()
            if (attachment.height) embed.setImage(attachment.url)
        }
        const message = await req.guild.channels.find(channel => channel.id === req.config.suggestionsChannelId)
            .send(embed)
        await message.react('✅')
        await message.react('🚫')
        await message.react(req.config.emojiIds.suggestionEmojiId)
    }
}
