'use strict'
require('dotenv').config()

const { Client, RichEmbed } = require('discord.js')
const sleep = require('sleep')

const discordService = require('../services/discord')

const PermissionError = require('../errors/permission-error')
const InputError = require('../errors/input-error')

const commands = require('../commands')

const config = require('../../config/application')

const client = new Client()

client.on('ready', async () => {
    console.log(`Ready to serve on ${client.guilds.size} servers, for ${client.users.size} users.`)
})

client.on('error', async err => {
    console.error(err)
    await exports.restart(client)
})

client.on('message', async message => {
    if (message.author.bot) return
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
                args: args
            }
            try {
                if (title === 'admin' && !discordService.isAdmin(req.member)) throw new PermissionError()
                await controller[command](req)
            } catch (err) {
                console.error(err)
                if (err instanceof PermissionError) {
                    await req.channel.send(err.message)
                } else if (err instanceof InputError) {

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
        .setDescription(`Hey ${member.user.tag}, you're the **${member.guild.members.size}th** member on **${member
            .guild.name}** 🎉 !`)
    member.guild.channels.find(channel => channel.name === 'welcome').send(embed)
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
        await exports.login()
    } catch (err) {
        console.error(err)
        await sleep.sleep(config.restartDelay)
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
        await discordService.getChannel(req.guild, 'moderator-logs').send(embed)
    } catch (err) {
        console.error(err.message)
    }
}
