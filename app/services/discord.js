'use strict'
const discord = require('discord.js')

function pluck(array) {
    return array.map(item => {
        return item['name']
    })
}

exports.getEmbed = (title, text) => {
    return exports.compileRichEmbed([{title: title, message: text}])
}

exports.compileRichEmbed = (fields, opts) => {
    fields = fields || []
    opts = opts || {}
    let embed = opts.original
    if (!embed) {
        embed = new discord.RichEmbed()
            .setAuthor('TRadmin', 'https://cdn.discordapp.com/attachments/672167634380390401/672173993658286090/Twin_Rail_New_Logo_V4.png')
            .setColor([255, 255, 255])
    }
    if (opts.timestamp) {
        embed.setTimestamp(opts.timestamp)
    } else {
        embed.setTimestamp()
    }
    if (opts.title) embed.setTitle(opts.title)
    for (let i = 0; i < Math.min(fields.length, 25); i++) {
        let title = fields[i].title
        let message = fields[i].message
        if (title && title.length > 256) {
            title = title.substring(0, 253) + '...'
            console.log(`Shortened title ${title}, 256 characters is max.`)
        }
        if (message && message.length > 2048) {
            message = message.substring(0, 2045) + '...'
            console.log(`Shortened message ${message}, 2048 characters is max.`)
        }
        embed.addField(fields[i].title || '?', fields[i].message || '-')
    }
    if (fields.length > 25) {
        console.log(`Ignored ${fields.length - 25} fields, 25 is max.`)
    }
    return embed
}

exports.hasRole = (member, role) => {
    return pluck(member.roles).includes(role)
}

exports.getChannel = (guild, name) => {
    return guild.channels.find(channel => channel.name === name)
}

exports.isAdmin = member => {
    return exports.hasRole(member, '')
}
