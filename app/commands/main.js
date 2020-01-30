'use strict'
const discord = require('discord.js')

exports.suggest = async req => {
    const suggestion = req.args.join(' ')
    const embed = new discord.RichEmbed()
        .setDescription(suggestion)
        .setAuthor(`By: ${req.author.tag}`, req.author.displayAvatarURL)
    const message = await req.message.guild.channels.find(channel => channel.name === 'suggestions').send(embed)
    await message.react('✅')
    await message.react('🚫')
}
