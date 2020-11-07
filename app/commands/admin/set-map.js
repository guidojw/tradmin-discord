'use strict'
const Command = require('../../controllers/command')
const { validUrl } = require('../../helpers/url')

module.exports = class SetMapCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'setmap',
      description: 'Sets the link of the map image posted by the map command.',
      clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
      args: [
        {
          key: 'url',
          prompt: 'What url would you like to set the map image to?',
          type: 'string',
          validate: validUrl
        }
      ]
    })
  }

  execute (message, { url }, guild) {
    const images = guild.getData('images')
    images.map = url
    guild.setData('images', images)
    return message.reply('Successfully set map image.')
  }
}
