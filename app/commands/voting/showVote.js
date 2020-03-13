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
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES', 'USE_EXTERNAL_EMOJIS']
        })
    }

    async execute (message, _args, guild) {
        const voteData = guild.getData('vote')
        if (!voteData) return message.reply('There is no vote created yet, create one using the createvote command!')
        const embeds = discordService.getVoteEmbeds(voteData)
        const emojis = guild.getData('emojis')
        await message.reply('The vote will look like this:')
        let first = true
        for (const embed of embeds) {
            const newMessage = await message.channel.send(embed)
            if (!first) {
                newMessage.react(emojis.voteEmoji)
            }
            first = false
        }
    }
}
