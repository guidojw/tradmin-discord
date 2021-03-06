'use strict'
const pluralize = require('pluralize')
const Command = require('../../controllers/command')
const timeHelper = require('../../helpers/time')

const { MessageEmbed } = require('discord.js')

module.exports = class BoostInfoCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'boostinfo',
      description: 'Posts the boost information of given member.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'member',
        prompt: 'Whose boost info do you want to know?',
        type: 'member',
        default: message => message.member
      }]
    })
  }

  async execute (message, { member }) {
    if (!member.premiumSince) {
      return message.reply(`${message.argString ? 'Member is not' : 'You\'re not'} a booster.`)
    }
    const now = new Date()
    const diffDays = timeHelper.diffDays(member.premiumSince, now)
    const months = Math.floor(diffDays / 30)
    const days = diffDays % 30
    const emoji = this.client.bot.mainGuild.guild.emojis.cache.find(emoji => emoji.name.toLowerCase() === 'boost')

    if (member.user.partial) {
      await member.user.partial.fetch()
    }
    const embed = new MessageEmbed()
      .setTitle(`${member.user.tag} ${emoji || ''}`)
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(`Has been boosting this server for **${pluralize('month', months, true)}** and **${pluralize('day', days, true)}**!`)
      .setFooter('* Discord Nitro months are 30 days long.')
      .setColor(0xff73fa)
    return message.replyEmbed(embed)
  }
}
