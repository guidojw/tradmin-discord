'use strict'
const Command = require('../../controllers/command')

const { MessageEmbed } = require('discord.js')
const { getTags } = require('../../helpers/string')

module.exports = class SuggestCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'suggest',
      description: 'Suggests given suggestion.',
      details: 'Suggestion can be encapsulated in quotes (but this is not necessary).',
      examples: ['suggest Add cool new thing', 'suggest "Add cool new thing"'],
      clientPermissions: ['ADD_REACTIONS', 'SEND_MESSAGES', 'USE_EXTERNAL_EMOJIS'],
      args: [{
        key: 'suggestion',
        prompt: 'What would you like to suggest?',
        type: 'string',
        validate: val => getTags(val) ? 'Suggestion contains tags.' : true
      }],
      throttling: {
        usages: 1,
        duration: 30 * 60
      }
    })
  }

  hasPermission (message) {
    const guild = this.client.bot.getGuild(message.guild.id)
    const roles = guild.getData('roles')
    if (message.member.roles.cache.has(roles.suggestionsBannedRole)) {
      return 'You are banned from using the suggest command.'
    }
    const channels = guild.getData('channels')
    return message.member.roles.cache.has(roles.suggestionsRole) || `Please check <#${channels.rolesChannel}> first.`
  }

  async execute (message, { suggestion }, guild) {
    const authorUrl = `https://discordapp.com/users/${message.author.id}`
    const embed = new MessageEmbed()
      .setDescription(suggestion)
      .setAuthor(message.author.tag, message.author.displayAvatarURL(), authorUrl)
      .setColor(0x000af43)
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first()
      if (attachment.height) {
        embed.setImage(attachment.url)
      }
    }
    const channels = guild.getData('channels')
    const emojis = guild.getData('emojis')

    const newMessage = await guild.guild.channels.cache.get(channels.suggestionsChannel).send(embed)
    await newMessage.react('✅')
    await newMessage.react('🚫')
    await newMessage.react(emojis.suggestionEmoji)

    message.reply('Successfully suggested', { embed: embed })
  }
}
