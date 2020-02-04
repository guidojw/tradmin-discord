'use strict'
const InputError = require('../errors/input-error')

exports.hasRole = (member, name) => {
    return member.roles.some(role => role.name === name)
}

exports.isAdmin = (member, adminRoles) => {
    for (const role of adminRoles) {
        if (exports.hasRole(member, role)) return true
    }
    return false
}

exports.addRole = async (member, name) => {
    const role = member.guild.roles.find(role => role.name === name)
    if (role) await member.addRole(role)
}

exports.removeRole = async (member, name) => {
    const role = member.roles.find(role => role.name === name)
    if (role) await member.removeRole(role)
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
            reject(new InputError('Prompt timed out.'))
        }
        message.delete()
    })
}

exports.getIdFromArgument = argument => {
    return argument.slice(2, -1)
}
