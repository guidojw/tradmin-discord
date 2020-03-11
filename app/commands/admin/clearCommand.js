'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class ClearCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'admin',
            name: 'clearchannel',
            aliases: ['clear'],
            description: 'Clears given channel.',
            details: 'Only channels #bug-reports and #suggestions can be cleared. This will delete all messages but ' +
            'the important information ones.',
            examples: ['clear #suggestions'],
            clientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'channel',
                    prompt: 'What channel would you like to clear?',
                    type: 'channel'
                }
            ]
        })
    }

    async execute (message, { channel }, guild) {
        const channels = guild.getData('channels')
        const suggestionsChannelId = channels.suggestionsChannel
        const bugReportsChannelId = channels.bugReportsChannel
        if (channel.id !== suggestionsChannelId && channel.id !== bugReportsChannelId) {
            return message.reply(`I can only clear <#${suggestionsChannelId}> or <#${bugReportsChannelId}>.`)
        }
        const choice = await discordService.prompt(message.channel, message.author, await message.reply('Are you sure' +
            `you sure you would like to clear ${channel}?`))
        if (choice) {
            const guildMessages = guild.getData('messages')
            let messages
            do {
                messages = await channel.messages.fetch({ after: channel.id === suggestionsChannelId ? guildMessages
                        .firstSuggestionMessage : guildMessages.firstBugReportMessage })
                if (messages.size > 0) {
                    try {
                        await channel.bulkDelete(messages.size)
                    } catch (err) {
                        for (const message of messages.values()) {
                            await message.delete()
                        }
                    }
                }
            } while (messages.size > 0)
            message.reply(`Successfully cleared ${channel}.`)
        } else {
            message.reply(`Didn't clear ${channel}.`)
        }
    }
}
