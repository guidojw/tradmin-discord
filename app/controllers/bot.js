'use strict'
require('dotenv').config()

const path = require('path')
const Guild = require('./guild')
const Commando = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const SettingProvider = require('./setting-provider')
const { stripIndents } = require('common-tags')

const applicationConfig = require('../../config/application')

module.exports = class Bot {
    constructor () {
        this.client = new Commando.Client({
            commandPrefix: applicationConfig.defaultPrefix,
            owner: applicationConfig.owner,
            unknownCommandResponse: false,
            disableEveryone: true,
            partials: ['REACTION', 'MESSAGE', 'GUILD_MEMBER']
        })
        this.client.bot = this
        this.client.setProvider(new SettingProvider())

        this.client.registry
            .registerGroup('admin', 'Admin')
            .registerGroup('main', 'Main')
            .registerGroup('bot', 'Bot')
            .registerGroup('voting', 'Voting')
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

        this.client.once('ready', this.ready.bind(this))
        this.client.on('guildMemberAdd', this.guildMemberAdd.bind(this))
        this.client.on('messageReactionAdd', this.messageReactionAdd.bind(this))
        this.client.on('messageReactionRemove', this.messageReactionRemove.bind(this))
        this.client.on('commandRun', this.commandRun.bind(this))

        this.client.login(process.env.DISCORD_TOKEN)
    }

    async fetch () {
        for (const guildId of this.client.guilds.cache.keys()) {
            this.guilds[guildId] = new Guild(this, guildId)
            await this.guilds[guildId].loadData()
            this.guilds[guildId].init()
        }
    }

    setActivity (name, options) {
        this.client.user.setActivity(name || applicationConfig.defaultActivity, options)
    }

    ready () {
        this.fetch()
        console.log(`Ready to serve on ${this.client.guilds.cache.size} servers, for ${this.client.users.cache.size} ` +
            'users.')
        this.setActivity()
    }

    async guildMemberAdd (member) {
        if (member.partial) await member.fetch()
        if (member.user.bot) return
        const embed = new MessageEmbed()
            .setTitle(`Hey ${member.user.tag},`)
            .setDescription(`You're the **${member.guild.memberCount}th** member on **${member.guild.name}** 🎉 !`)
            .setThumbnail(member.user.displayAvatarURL())
        const guild = this.guilds[member.guild.id]
        guild.guild.channels.cache.get(guild.getData('channels').welcomeChannel).send(embed)
    }

    async messageReactionAdd (reaction, user) {
        if (user.partial) await user.fetch()
        if (user.bot) return
        if (reaction.partial) await reaction.fetch()
        const guild = this.guilds[reaction.message.guild.id]
        const member = guild.guild.member(user)

        const messages = guild.getData('messages')
        const emojis = guild.getData('emojis')
        const roles = guild.getData('roles')
        if (reaction.message.id === messages.suggestionsMessage && reaction.emoji.id === emojis.roleEmoji) {
            if (member) member.roles.add(roles.suggestionsRole)
            return
        }

        const voteData = guild.getData('vote')
        if (voteData.timer && voteData.timer.end > new Date().getTime()) {
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
        if (user.partial) await user.fetch()
        if (user.bot) return
        const guild = this.guilds[reaction.message.guild.id]
        if (reaction.message.id === guild.getData('messages').suggestionsMessage && reaction.emoji.id === guild
            .getData('emojis').roleEmoji) {
            const member = guild.guild.member(user)
            if (member) member.roles.remove(guild.getData('roles').suggestionsRole)
        }
    }

    async commandRun (command, promise, message) {
        if (!message.guild) return
        await promise
        const embed = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(stripIndents`${message.author} **used** \`${command.name}\` **command in** ${message
                .channel} [Jump to Message](${message.url})
                ${message.content}`)
        const guild = this.guilds[message.guild.id]
        guild.guild.channels.cache.get(guild.getData('channels').logsChannel).send(embed)
    }
}
