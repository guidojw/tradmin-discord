'use strict'
module.exports = async (voteData, guild) => {
    const now = new Date().getTime()
    guild.setData('vote', voteData)
    if (voteData.timer.end <= now) guild.stopJob('saveVoteJob')
}
