'use strict'
exports.isAdmin = (member, adminRoles) => {
    for (const roleId of adminRoles) {
        if (member.roles.get(roleId)) return true
    }
    return false
}

exports.prompt = (channel, author, ...options) => {
    return new Promise(async (resolve, reject) => {
        const message = await channel.send(...options)
        await message.react('✅')
        await message.react('🚫')
        try {
            const filter = (reaction, user) => (reaction.emoji.name === '✅' || reaction.emoji.name === '🚫') && user.id
                === author.id
            const collected = await message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            const reaction = collected.first()
            resolve(reaction.emoji.name === '✅')
        } catch (err) {
            reject(new Error('Prompt timed out.'))
        }
        message.delete()
    })
}
