'use strict'
const { RichEmbed } = require('discord.js')

const discordService = require('../services/discord')

const PermissionError = require('../errors/permission-error')
const InputError = require('../errors/input-error')

exports.suggest = async req => {
    if (req.args.length === 0) throw new InputError()
    if (discordService.hasRole(req.member, req.config.suggestionsBannedRole)) {
        throw new PermissionError('You are banned from using the suggest command.')
    }
    if (!discordService.hasRole(req.member, req.config.suggestionsRole)) {
        throw new PermissionError(`Please check <#${req.config.rolesChannelId}> first.`)
    }
    const suggestion = req.args.join(' ')
    const embed = new RichEmbed()
        .setDescription(suggestion)
        .setAuthor(`By: ${req.author.tag}`, req.author.displayAvatarURL, req.author.url)
    if (req.message.attachments.size > 0) {
        const attachment = req.message.attachments.first()
        if (attachment.height) embed.setImage(attachment.url)
    }
    const message = await req.guild.channels.find(channel => channel.id === req.config.suggestionsChannelId)
        .send(embed)
    await message.react('✅')
    await message.react('🚫')
    await message.react(req.config.emojiIds.suggestionEmojiId)
    req.channel.send('Successfully suggested', { embed: embed })
}

exports.delete = async req => {
    if (discordService.hasRole(req.member, req.config.suggestionsBannedRole)) {
        throw new PermissionError('You are banned from using the delete command.')
    }
    if (!discordService.hasRole(req.member, req.config.suggestionsRole)) {
        throw new PermissionError(`Please check <#${req.config.rolesChannelId}> first.`)
    }
    const channel = req.guild.channels.find(channel => channel.id === req.config.suggestionsChannelId)
    const messages = await channel.fetchMessages()
    for (const suggestion of messages.values()) {
        if (suggestion.embeds.length === 1 && suggestion.embeds[0].author.name.indexOf(req.author.tag) !== -1 &&
            suggestion.id !== req.config.suggestionsMessageId) {
            const choice = await discordService.prompt(req.channel, req.author, 'Are you sure you would like' +
                ' to delete this suggestion?', { embed: suggestion.embeds[0]})
            if (choice) {
                await suggestion.delete()
                req.channel.send('Successfully deleted your last suggestion.')
            } else {
                req.channel.send('Didn\'t delete your last suggestion.')
            }
            return
        }
    }
    req.channel.send('Could not find a suggestion you made.')
}
