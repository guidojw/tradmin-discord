'use strict'
require('dotenv').config()

const path = require('path')
const Guild = require('./guild')
const Commando = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const SettingProvider = require('./setting-provider')
const { stripIndents } = require('common-tags')
const discordService = require('../services/discord')
const TicketsController = require('./tickets')

const applicationConfig = require('../../config/application')

module.exports = class Bot {
    constructor () {
        this.client = new Commando.Client({
            commandPrefix: applicationConfig.defaultPrefix,
            owner: applicationConfig.owner,
            unknownCommandResponse: false,
            disableEveryone: true,
            partials: ['MESSAGE', 'REACTION']
        })
        this.client.bot = this
        this.currentActivity = 0

        this.client.registry
            .registerGroup('admin', 'Admin')
            .registerGroup('main', 'Main')
            .registerGroup('bot', 'Bot')
            .registerGroup('voting', 'Voting')
            .registerGroup('tickets', 'Tickets')
            .registerDefaultGroups()
            .registerDefaultTypes()
            .registerDefaultCommands({
                commandState: true,
                unknownCommand: false,
                ping: true,
                help: true,
                eval: true,
                prefix: true
            })
            .registerCommandsIn(path.join(__dirname, '../commands'))

        this.guilds = {}

        this.client.on('guildMemberAdd', this.guildMemberAdd.bind(this))
        this.client.on('messageReactionAdd', this.messageReactionAdd.bind(this))
        this.client.on('messageReactionRemove', this.messageReactionRemove.bind(this))
        this.client.on('commandRun', this.commandRun.bind(this))
        this.client.on('message', this.message.bind(this))
        this.client.once('ready', this.ready.bind(this))

        this.client.login(process.env.DISCORD_TOKEN)
    }

    setActivity (name, options) {
        if (!name) {
            const activity = this.getNextActivity()
            name = activity.name
            options = activity.options
        }
        this.client.user.setActivity(name, options)
    }

    async ready () {
        // Instantiate a Guild instance for every guild
        for (const guildId of this.client.guilds.cache.keys()) {
            this.guilds[guildId] = new Guild(this, guildId)
            await this.guilds[guildId].loadData()
        }

        // Set the bot's main Guild
        const mainGuildId = process.env.NODE_ENV === 'production'
            ? applicationConfig.productionMainGuildId
            : applicationConfig.developmentMainGuildId
        this.mainGuild = this.getGuild(mainGuildId)

        // Set the client's SettingProvider
        await this.client.setProvider(new SettingProvider())

        // Instantiate the TicketsController for this bot
        this.ticketsController = new TicketsController(this.client)

        // Block commands from running if the TicketsController starts a new prompt
        this.client.dispatcher.addInhibitor(this.ticketsController.inhibitor.bind(this.ticketsController))

        // Set the bot's activity and start the loop that updates the activity
        this.setActivity()
        setInterval(() => this.setActivity(), 60 * 1000)

        console.log(`Ready to serve on ${this.client.guilds.cache.size} servers, for ${this.client.users.cache.size} ` +
            'users.')
    }

    async guildMemberAdd (member) {
        if (member.user.bot) return
        const embed = new MessageEmbed()
            .setTitle(`Hey ${member.user.tag},`)
            .setDescription(`You're the **${member.guild.memberCount}th** member on **${member.guild.name}** 🎉 !`)
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(applicationConfig.primaryColor)
        const guild = this.getGuild(member.guild.id)
        guild.guild.channels.cache.get(guild.getData('channels').welcomeChannel).send(embed)
    }

    async messageReactionAdd (reaction, user) {
        if (user.bot) return
        if (reaction.message.partial) await reaction.message.fetch()
        if (!reaction.message.guild) return
        const guild = this.getGuild(reaction.message.guild.id)
        const member = guild.guild.member(user)

        const roleMessages = guild.getData('roleMessages')
        const roleMessage = roleMessages[reaction.message.id]
        if (roleMessage) {
            if (reaction.partial) await reaction.fetch()
            const emoji = reaction.emoji.id || reaction.emoji.name
            for (const binding of roleMessage) {
                if (binding.emoji === emoji) return member.roles.add(binding.role)
            }
        }

        const voteData = guild.getData('vote')
        if (voteData && voteData.timer && voteData.timer.end > Date.now()) {
            let choice
            for (const option of Object.values(voteData.options)) {
                if (option.votes.includes(member.id)) return
                if (reaction.message.id === option.message) choice = option
            }
            if (choice) {
                choice.votes.push(member.id)
                reaction.message.edit(reaction.message.embeds[0].setFooter(`Votes: ${choice.votes.length}`))
            }
        }
    }

    async messageReactionRemove (reaction, user) {
        if (user.bot) return
        if (reaction.message.partial) await reaction.message.fetch()
        if (!reaction.message.guild) return
        const guild = this.getGuild(reaction.message.guild.id)
        const member = guild.guild.member(user)

        const roleMessages = guild.getData('roleMessages')
        const roleMessage = roleMessages[reaction.message.id]
        if (roleMessage) {
            const emoji = reaction.emoji.id || reaction.emoji.name
            for (const binding of roleMessage) {
                if (binding.emoji === emoji) return member.roles.remove(binding.role)
            }
        }
    }

    async commandRun (command, promise, message) {
        if (!message.guild) return
        await promise

        await this.log(message.author, stripIndents`
            ${message.author} **used** \`${command.name}\` **command in** ${message.channel} [Jump to Message](${message.url})
            ${message.content}
            `)
    }

    async message (message) {
        if (!message.guild || message.author.bot) return
        const guild = this.getGuild(message.guild.id)
        const channels = guild.getData('channels')

        if (!discordService.isAdmin(message.member, guild.getData('adminRoles'))) {
            const noTextChannels = guild.getData('noTextChannels')
            if (noTextChannels.includes(message.channel.id)) {
                if (message.attachments.size === 0 && message.embeds.length === 0) {
                    await message.delete()
                    const channel = guild.guild.channels.cache.get(channels.logsChannel)
                    const embed = new MessageEmbed()
                        .setAuthor(message.author.tag, message.author.displayAvatarURL())
                        .setDescription(stripIndents`**Message sent by** ${message.author} **deleted in** ${message
                            .channel}
                            ${message.content}`)
                    channel.send(embed)
                }
            }
        }

        if (message.channel.id === channels.photoContestChannel) {
            if (message.attachments.size > 0 || message.embeds.length > 0) message.react('👍')
        }
    }

    getGuild (id) {
        return this.guilds[id]
    }

    getNextActivity () {
        this.currentActivity++
        if (this.currentActivity === 3) this.currentActivity = 0
        switch (this.currentActivity) {
            case 0:
                return { name: `${this.client.commandPrefix}help`, options: { type: 'LISTENING' }}
            case 1:
                return { name: 'Terminal Railways', options: { type: 'PLAYING' }}
            case 2: {
                let totalMemberCount = 0
                for (const guild of Object.values(this.guilds)) {
                    totalMemberCount += guild.guild.memberCount
                }
                return { name: `${totalMemberCount} users`, options: { type: 'WATCHING' }}
            }
        }
    }

    log (author, content, footer) {
        const embed = new MessageEmbed()
            .setAuthor(author.tag, author.displayAvatarURL())
            .setDescription(content)
            .setColor(applicationConfig.primaryColor)

        if (footer) {
            embed.setFooter(footer)
        }

        const guild = this.mainGuild
        return guild.guild.channels.cache.get(guild.getData('channels').logsChannel).send(embed)
    }
}
