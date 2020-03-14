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

exports.getVoteMessages = async (voteData, client) => {
    const messages = { options: [] }
    messages.intro = `**${voteData.title}**\n\n${voteData.description}`
    messages.optionHeader = '**Participants:**'
    for (const [id, option] of Object.entries(voteData.options)) {
        const user = client.users.cache.get(id)
        if (user) {
            const embed = new MessageEmbed()
                .setTitle(user.tag)
                .setThumbnail(user.displayAvatarURL())
                .setDescription(option.description)
                .setFooter('Votes: 0')
            messages.options.push(embed)
        }
    }
    const embed = new MessageEmbed()
        .setFooter('You can make your vote by clicking on the reactions underneath the options below.\nOnly your' +
            ' first vote will count and removing your reaction will not remove your vote.\nEnds at')
        .setTimestamp(voteData.end || new Date().getTime())
    messages.info = embed
    return messages
}
