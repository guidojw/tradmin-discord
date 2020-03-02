'use strict'
require('dotenv').config()

const path = require('path')
const Guild = require('./guild')
const Commando = require('discord.js-commando')
const { RichEmbed } = require('discord.js')
const SettingProvider = require('./settingProvider')

const applicationConfig = require('../../config/application')

module.exports = class Bot {
    constructor() {
        this.client = new Commando.Client({
            commandPrefix: applicationConfig.defaultPrefix,
            owner: applicationConfig.owner,
            unknownCommandResponse: false,
            disableEveryone: true
        })
        this.client.bot = this
        this.client.setProvider(new SettingProvider())

        this.client.registry
            .registerGroup('admin', 'Admin')
            .registerGroup('main', 'Main')
            .registerDefaultGroups()
            .registerDefaultTypes()
            .registerDefaultCommands({
                commandState: false,
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
        for (const guild of this.client.guilds.values()) {
            const newGuild = new Guild(this, guild.id)
            await newGuild.loadData()
            await newGuild.fetch()
            this.guilds[guild.id] = newGuild
        }
    }

    getGuild (guildId) {
        return this.guilds[guildId]
    }

    setActivity (activity, options) {
        this.client.user.setActivity(activity || applicationConfig.defaultActivity, options)
    }

    ready () {
        this.fetch()
        console.log(`Ready to serve on ${this.client.guilds.size} servers, for ${this.client.users.size} users.`)
        this.setActivity()
    }

    async guildMemberAdd (member) {
        if (member.user.bot) return
        const embed = new RichEmbed()
            .setTitle(`Hey ${member.user.tag},`)
            .setDescription(`You're the **${member.guild.memberCount}th** member on **${member.guild.name}** 🎉 !`)
            .setThumbnail(member.user.displayAvatarURL)
        const guild = this.getGuild(member.guild.id)
        guild.guild.channels.find(channel => channel.id === guild.getData('channels').welcomeChannel).send(
            embed)
    }

    messageReactionAdd (reaction, user) {
        const guild = this.getGuild(reaction.message.guild.id)
        if (reaction.message.id === guild.getData('messages').suggestionsMessage && reaction.emoji.id === guild
            .getData('emojis').roleEmoji) {
            const member = guild.guild.members.find(member => member.user.id === user.id)
            if (member) member.addRole(guild.getData('roles').suggestionsRole)
        }
    }

    messageReactionRemove (reaction, user) {
        console.log('here1')
        const guild = this.getGuild(reaction.message.guild.id)
        if (reaction.message.id === guild.getData('messages').suggestionsMessage && reaction.emoji.id === guild
            .getData('emojis').roleEmoji) {
            console.log('here2')
            const member = guild.guild.members.find(member => member.user.id === user.id)
            console.log('remove')
            if (member) member.removeRole(guild.getData('roles').suggestionsRole)
        }
    }

    commandRun = async (command, promise, message) => {
        if (!message.guild) return
        await promise
        const embed = new RichEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL)
            .setDescription(`${message.author} **used** \`${command.name}\` **command in** ${message.channel} [Jump ` +
                `to Message](${message.message.url})\n${message.message}`)
        const guild = this.getGuild(message.guild.id)
        guild.guild.channels.find(channel => channel.id === guild.getData('channels').logsChannel).send(embed)
    }
}
