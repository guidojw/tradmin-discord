'use strict'
const { MessageEmbed } = require('discord.js')

exports.isAdmin = (member, adminRoles) => {
    for (const roleId of adminRoles) {
        if (member.roles.cache.has(roleId)) return true
    }
    return false
}

exports.prompt = async (channel, author, message) => {
    const filter = (reaction, user) => (reaction.emoji.name === '✅' || reaction.emoji.name === '🚫') && user.id ===
        author.id
    const collector = message.createReactionCollector(filter, { time: 60000 })
    const promise = new Promise(resolve => {
        collector.on('end', collected => {
            const reaction = collected.first()
            resolve(reaction && reaction.emoji.name === '✅')
        })
    })
    collector.on('collect', collector.stop)
    await message.react('✅')
    await message.react('🚫')
    return promise
}

exports.getVoteEmbeds = voteData => {
    const embeds = []
    const embed = new MessageEmbed()
        .setTitle(voteData.title)
        .setDescription(voteData.description)
        .setFooter('You can make your vote by clicking on the reactions underneath the options below.\nOnly your' +
            ' first vote will count and removing your reaction will not remove your vote.\nEnds at')
        .setTimestamp(voteData.end || new Date().getTime())
    embeds.push(embed)
    for (const option of voteData.options) {
        const embed = new MessageEmbed()
            .setTitle(option.name)
            .setDescription(option.description)
            .setFooter('Votes: 0')
        if (option.image) embed.setThumbnail(option.image)
        embeds.push(embed)
    }
    return embeds
}
