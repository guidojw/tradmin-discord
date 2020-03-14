'use strict'
const timeHelper = require('../helpers/time')

module.exports = async (voteData, guild) => {
    const channel = guild.guild.channels.cache.get(voteData.channel)
    if (!channel) return
    const message = await channel.messages.fetch(voteData.timer.message)
    if (!message) return
    const now = new Date().getTime()
    if (voteData.timer.end > now) {
        message.edit(`🕐️ *${timeHelper.getDurationString(voteData.timer.end - now)}* left to vote!`)
    } else {
        message.edit('🕐️ **This vote is closed!**')
        guild.stopJob('timerJob')
    }
}
