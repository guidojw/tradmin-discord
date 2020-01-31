'use strict'
const config = require('../../config/application')

function pluck(array) {
    return array.map(item => {
        return item['name']
    })
}

exports.hasRole = (member, name) => {
    return pluck(member.roles).includes(name)
}

exports.getChannel = (guild, name) => {
    return guild.channels.find(channel => channel.name === name)
}

exports.isAdmin = member => {
    for (const role of config.adminRoles) {
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
