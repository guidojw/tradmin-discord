'use strict'
module.exports = async guild => {
    const voteData = guild.getData('vote')
    guild.setData('vote', voteData)
    if (voteData.timer.end <= new Date().getTime()) guild.stopJob('saveVoteJob')
}
