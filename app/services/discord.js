'use strict'
const { MessageEmbed, MessageAttachment } = require('discord.js')
const timeHelper = require('../helpers/time')

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
    const messages = { options: {} }
    messages.intro = {
        content: `**${voteData.title}**\n${voteData.description}`,
        options: voteData.image ? new MessageAttachment(voteData.image) : undefined
    }
    let first = true
    for (const [id, option] of Object.entries(voteData.options)) {
        const user = client.users.cache.get(id)
        if (user) {
            messages.options[id] = {
                content: first ? '👥 **Participants**' : undefined,
                options: new MessageEmbed()
                    .setTitle(user.tag)
                    .setThumbnail(user.displayAvatarURL())
                    .setDescription(option.description)
                    .setFooter('Votes: 0')
            }
            first = false
        }
    }
    messages.info = {
        options: new MessageEmbed()
            .setFooter('You can vote by reacting the pencil on the participant you want to vote on.\nOnly your ' +
                'first vote will count and removing your reaction will not remove your vote.\nEnds at')
            // The showvote command can call this with voteData that has no timer set yet so substitute with current
            // time as timestamp.
            .setTimestamp(voteData.end || new Date().getTime())
    }
    messages.timer = {
        content: `🕰️ *${timeHelper.getDurationString(voteData.timer ? voteData.timer.end - new Date()
            .getTime() : 0)}* left to vote!`
    }
    return messages
}
