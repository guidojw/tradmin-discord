'use strict'
const discord = require('discord.js')

const config = require('../../config/application')

function pluck(array) {
    return array.map(item => {
        return item['name']
    })
}

exports.hasRole = (member, role) => {
    return pluck(member.roles).includes(role)
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
