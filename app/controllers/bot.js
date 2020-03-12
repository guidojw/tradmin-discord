'use strict'
require('dotenv').config()

const path = require('path')
const Guild = require('./guild')
const Commando = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const SettingProvider = require('./settingProvider')
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
        if (reaction.partial) await reaction.fetch()
        const guild = this.guilds[reaction.message.guild.id]
        if (reaction.message.id === guild.getData('messages').suggestionsMessage && reaction.emoji.id === guild
            .getData('emojis').roleEmoji) {
            const member = guild.guild.members.cache.find(member => member.user.id === user.id)
            if (member) member.roles.add(guild.getData('roles').suggestionsRole)
        }
    }

    messageReactionRemove (reaction, user) {
        const guild = this.guilds[reaction.message.guild.id]
        if (reaction.message.id === guild.getData('messages').suggestionsMessage && reaction.emoji.id === guild
            .getData('emojis').roleEmoji) {
            const member = guild.guild.members.cache.find(member => member.user.id === user.id)
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
