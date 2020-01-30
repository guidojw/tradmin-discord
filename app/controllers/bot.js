'use strict'
require('dotenv').config()

const discord = require('discord.js')
const sleep = require('sleep')

const discordService = require('../services/discord')

const timeHelper = require('../helpers/time')

const PermissionError = require('../errors/permission-error')

const commands = require('../commands')

const config = require('../../config/application')

const client = new discord.Client()

client.on('ready', async () => {
    exports.startUnix = timeHelper.getUnix()
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
                    await req.channel.send('Insufficient powers!')
                } else {
                    if (err.response.status === 500) {
                        await req.channel.send('An error occurred!')
                    } else {
                        await req.channel.send(discordService.getEmbed(req.command, err.response.data.errors[0]
                            .message))
                    }
                }
            }
            // await exports.log(req)
            break
        }
    }
})

client.on('guildMemberAdd', async member => {
    const embed = new discord.RichEmbed()
        .setDescription(`Hey ${member.user.tag}, you're the **${member.guild.members.size}th** member on **${member
            .guild.name}**🎉!`)
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

// exports.log = async req => {
//     try {
//         (await discordService.getChannel(req.guild, 'tradmin_logs')).send(discordService.getEmbed(`**${req
//             .member.nickname ? req.member.nickname : req.author.username}** used command **${req.command}**!`, req
//             .message.content))
//     } catch (err) {
//         console.error(err.message)
//     }
// }
