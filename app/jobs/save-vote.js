'use strict'
module.exports = guild => {
    const voteData = guild.getData('vote')
    guild.setData('vote', voteData)
    if (voteData.timer.end <= new Date().getTime()) guild.stopJob('saveVoteJob')
}
