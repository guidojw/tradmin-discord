'use strict'
const { RichEmbed } = require('discord.js')

const discordService = require('../services/discord')

const PermissionError = require('../errors/permission-error')

const config = require('../../config/application')

exports.suggest = async req => {
    if (discordService.hasRole(req.member, config.suggestionsBannedRole)) {
        throw new PermissionError('You are banned from using the suggest command!')
    }
    const rolesChannel = req.guild.channels.find(channel => channel.name === 'roles')
    const roleMessage = (await rolesChannel.fetchMessages()).find(message => message.id === config
        .suggestionsMessageId)
    const roleEmoji = req.guild.emojis.find(emoji => emoji.name === 'DogeThink')
    if (!(await discordService.hasReacted(roleMessage, roleEmoji, req.author))) {
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
        const message = await req.guild.channels.find(channel => channel.name === 'suggestions').send(embed)
        await message.react('✅')
        await message.react('🚫')
        const rooWutEmoji = req.guild.emojis.find(emoji => emoji.name === 'rooWut')
        if (rooWutEmoji) await message.react(rooWutEmoji.id)
    }
}
