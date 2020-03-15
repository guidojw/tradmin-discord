'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class StartVoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'showvote',
            aliases: ['vshow'],
            description: 'Posts a mock of what the vote posted by the startvote command will look like.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    async execute (message, _args, guild) {
        const voteData = guild.getData('vote')
        if (!voteData) return message.reply('There is no vote created yet, create one using the createvote command!')

        const messages = await discordService.getVoteMessages(voteData, this.client)
        await message.reply('The vote will look like this:')
        await message.channel.send(messages.intro)
        await message.channel.send(messages.info)
        await message.channel.send(messages.optionHeader)
        for (const embed of Object.values(messages.options)) {
            (await message.channel.send(embed)).react('✏️')
        }
        await message.channel.send(messages.timer)
    }
}
