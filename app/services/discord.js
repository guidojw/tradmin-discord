'use strict'
exports.isAdmin = (member, adminRoles) => {
    for (const roleId of adminRoles) {
        if (member.roles.get(roleId)) return true
    }
    return false
}

exports.prompt = (channel, author, ...options) => {
    return new Promise(async resolve => {
        const message = await channel.send(...options)
        const filter = (reaction, user) => (reaction.emoji.name === '✅' || reaction.emoji.name === '🚫') && user.id
            === author.id
        const collector = message.createReactionCollector(filter, { time: 60000 })
        collector.on('collect', () => collector.stop())
        collector.on('end', collected => {
            const reaction = collected.first()
            resolve(reaction && reaction.emoji.name === '✅')
        })
        await message.react('✅')
        await message.react('🚫')
    })
}
