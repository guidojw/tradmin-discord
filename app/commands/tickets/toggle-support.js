'use strict'
const Command = require('../../controllers/command')

const { MessageEmbed } = require('discord.js')

module.exports = class ToggleSupportCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'tickets',
      name: 'togglesupport',
      aliases: ['toggle'],
      description: 'Enables/disables the support system.',
      clientPermissions: ['SEND_MESSAGES'],
      adminOnly: true
    })
  }

  execute (message) {
    const settings = this.client.bot.mainGuild.getData('settings')

    settings.supportEnabled = !settings.supportEnabled
    this.client.bot.mainGuild.setData('settings', settings)

    const embed = new MessageEmbed()
      .setColor(settings.supportEnabled ? 0x00ff00 : 0xff0000)
      .setTitle('Successfully toggled support')
      .setDescription(`Tickets System: **${settings.supportEnabled ? 'online' : 'offline'}**`)
    return message.replyEmbed(embed)
  }
}
