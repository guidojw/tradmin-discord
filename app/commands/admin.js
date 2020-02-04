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
    const channel = req.guild.channels.find(channel => channel.id === id)
    let messages
    do {
        messages = (await channel.fetchMessages()).filter(message => message.id !== req.config
            .firstSuggestionMessageId && message.id !== req.config.firstBugReportMessageId)
        if (messages.size > 0) await channel.bulkDelete(messages.size)
    } while (messages.size > 0)
    req.channel.send(`Successfully cleared <#${id}>.`)
}
