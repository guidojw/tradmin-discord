'use strict'
const saveVoteJob = require('../app/jobs/save-vote')
const updateTimerJob = require('../app/jobs/update-timer')
const nitroBoosterReportJob = require('../app/jobs/nitro-booster-report')

module.exports = {
  'saveVoteJob': {
    'expression': '*/2 * * * *',
    'job': saveVoteJob
  },
  'updateTimerJob': {
    'expression': '*/2 * * * *',
    'job': updateTimerJob
  },
  'nitroBoosterReportJob': {
    'expression': '*/1 * * * *',
    'job': nitroBoosterReportJob
  }
}
