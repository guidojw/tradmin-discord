'use strict'
const Command = require('../../controllers/command')
const timeHelper = require('../../helpers/time')

module.exports = class StartVoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'startvote',
            aliases: ['vstart'],
            description: 'Starts the vote created using the createvote command.',
            examples: ['startvote', 'startvote #announcements 12-3-2020 20:00'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES', 'ADD_REACTIONS'],
            args: [{
                key: 'channel',
                type: 'channel',
                prompt: 'In what channel would you like the vote to be posted?'
            }, {
                key: 'date',
                type: 'string',
                prompt: 'At what date do you want the date to end?',
                validate: timeHelper.validDate
            }, {
                key: 'time',
                type: 'string',
                prompt: 'At what time on given date would you like the vote to end?',
                validate: timeHelper.validTime
            }]
        })
    }

    execute (message, { channel, date, time }, guild) {
        const voteData = guild.getData('vote')
        if (!voteData) return message.reply('There is no vote created yet, create one using the createvote command!')
        const dateInfo = timeHelper.getDateInfo(date)
        const timeInfo = timeHelper.getTimeInfo(time)
        const dateUnix = new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day, timeInfo.hours, timeInfo
            .minutes).getTime()
        const nowUnix = new Date().getTime()
        const afterNow = dateUnix - nowUnix > 0
        if (!afterNow) return message.reply('Please give a date and time that is after now!')

    }
}
