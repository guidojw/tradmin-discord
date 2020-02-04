'use strict'
require('dotenv').config()

const { Client, RichEmbed } = require('discord.js')
const sleep = require('sleep')

const discordService = require('../services/discord')

const PermissionError = require('../errors/permission-error')
const InputError = require('../errors/input-error')

const commands = require('../commands')

const applicationConfig = require('../../config/application')
const guildConfigs = require('../../config/guilds')

const client = new Client()

client.on('ready', async () => {
    for (const [guildId, config] of Object.entries(guildConfigs)) {
        const guild = client.guilds.find(guild => guild.id === guildId)
        if (guild) {
            const channel = guild.channels.find(channel => channel.id === config.rolesChannelId)
            await channel.fetchMessages()
        }
    }
    console.log(`Ready to serve on ${client.guilds.size} servers, for ${client.users.size} users.`)
})

client.on('error', async err => {
    console.error(err)
    await exports.restart(client)
})

client.on('message', async message => {
    if (message.author.bot) return
    const config = guildConfigs[message.guild.id]
    if (!config) return
    if (!message.content.startsWith(config.prefix)) return
    let args = message.content.split(' ')
    const command = args[0].slice(1)
    args.shift()
    for (const [title, controller] of Object.entries(commands)) {
        if (controller[command]) {
            const req = {
                guild: message.guild,
                channel: message.channel,
                member: message.member,
                author: message.author,
                message: message,
                command: command,
                args: args,
                config: config
            }
            try {
                if (title === 'admin' && !discordService.isAdmin(req.member, config.adminRoles)) {
                    throw new PermissionError()
                }
                await controller[command](req)
            } catch (err) {
                console.error(err)
                if (err instanceof PermissionError) {
                    await req.channel.send(err.message)
                } else if (err instanceof InputError) {
                    await req.channel.send(err.message)
                } else {
                    await req.channel.send('An error occurred!')
                }
            }
            await exports.log(req)
            break
        }
    }
})

client.on('guildMemberAdd', async member => {
    const embed = new RichEmbed()
        .setTitle(`Hey ${member.user.tag},`)
        .setDescription(`You're the **${member.guild.memberCount}th** member on **${member.guild.name}** 🎉 !`)
        .setThumbnail(member.user.displayAvatarURL)
    const config = guildConfigs[member.guild.id]
    member.guild.channels.find(channel => channel.id === config.welcomeChannelId).send(embed)
})

client.on('messageReactionAdd', async (reaction, user) => {
    const config = guildConfigs[reaction.message.guild.id]
    if (reaction.message.id === config.suggestionsMessageId && reaction.emoji.id === config.emojiIds.roleEmojiId) {
        const member = reaction.message.guild.members.find(member => member.user.id === user.id)
        if (member) await discordService.addRole(member, config.suggestionsRole)
    }
})

client.on('messageReactionRemove', async (reaction, user) => {
    const config = guildConfigs[reaction.message.guild.id]
    if (reaction.message.id === config.suggestionsMessageId && reaction.emoji.id === config.emojiIds.roleEmojiId) {
        const member = reaction.message.guild.members.find(member => member.user.id === user.id)
        if (member) await discordService.removeRole(member, config.suggestionsRole)
    }
})

exports.login = async () => {
    try {
        await client.login(process.env.DISCORD_TOKEN)
        console.log('Client logged in!')
    } catch (err) {
        console.error(err)
        await exports.restart(client)
    }
}

exports.restart = async client => {
    try {
        await client.destroy()
        await sleep.sleep(applicationConfig.restartDelay)
        await exports.login()
    } catch (err) {
        console.error(err)
        await exports.restart(client)
    }
}

exports.setActivity = async (name, options)  => {
    await client.user.setActivity(name, options)
}

exports.log = async req => {
    try {
        const embed = new RichEmbed()
            .setAuthor(req.author.tag, req.author.displayAvatarURL)
            .setDescription(`${req.author} **used** \`${req.command}\` **command in** ${req.message.channel} [Jump ` +
                `to Message](${req.message.url})\n${req.message}`)
        await req.guild.channels.find(channel => channel.id === req.config.moderatorLogsChannelId).send(embed)
    } catch (err) {
        console.error(err.message)
    }
}
