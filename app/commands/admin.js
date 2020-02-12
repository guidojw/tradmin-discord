'use strict'
const botController = require('../controllers/bot')

const discordService = require('../services/discord')

const InputError = require('../errors/input-error')

exports.activity = async req => {
    if (req.args.length === 0) throw new InputError()
    const type = req.args.shift().toUpperCase()
    if (type !== 'PLAYING' && type !== 'STREAMING' && type !== 'LISTENING' && type !== 'WATCHING') {
        throw new InputError()
    }
    const options = {type: type}
    if (type === 'STREAMING') {
        options.url = req.args.pop()
        if (!options.url) throw new InputError()
    }
    await botController.setActivity(req.args.join(' '), options)
}

exports.clear = async req => {
    if (req.args.length === 0) throw new InputError()
    const id = discordService.getIdFromArgument(req.args.shift())
    if (!id) throw new InputError()
    const suggestionsChannelId = req.config.suggestionsChannelId
    const bugReportsChannelId = req.config.bugReportsChannelId
    if (id !== suggestionsChannelId && id !== bugReportsChannelId) throw new InputError('Can only clear <#' +
        `${suggestionsChannelId}> or <#${bugReportsChannelId}>.`)
    const choice = await discordService.prompt(req.channel, req.author, 'Are you sure you would like to ' +
        `clear <#${id}>?`)
    if (choice) {
        const channel = req.guild.channels.find(channel => channel.id === id)
        let messages
        do {
            messages = (await channel.fetchMessages({ after: id === suggestionsChannelId ? req.config
                    .firstSuggestionMessageId : req.config.firstBugReportMessageId }))
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
        req.channel.send(`Successfully cleared <#${id}>.`)
    } else {
        req.channel.send(`Didn't clear <#${id}>.`)
    }
}
