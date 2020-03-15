'use strict'
const fs = require('fs')
const path = require('path')
const cron = require('node-cron')

const cronConfig = require('../../config/cron')

module.exports = class Guild {
    constructor(bot, id) {
        this.bot = bot
        this.id = id
        this.guild = this.bot.client.guilds.cache.get(id)
        this.dataPath = path.join(__dirname, '../../data', `${id}.json`)
        this.data = undefined
        this.jobs = {}
    }

    loadData = async () => {
        try {
            await fs.promises.access(this.dataPath)
        } catch (err) {
            await fs.promises.writeFile(this.dataPath, JSON.stringify({

            }))
        }
        this.data = JSON.parse(await fs.promises.readFile(this.dataPath))
    }

    async setData (key, value) {
        if (!this.data) throw new Error('Guild data is not loaded yet.')
        this.data[key] = value
        await fs.promises.writeFile(this.dataPath, JSON.stringify(this.data))
    }

    getData (key) {
        if (!this.data) throw new Error('Guild data is not loaded yet.')
        return this.data[key]
    }

    init () {
        const voteData = this.getData('vote')
        if (voteData && voteData.timer && voteData.timer.end > new Date().getTime()) {
            this.scheduleJob('saveVoteJob')
            this.scheduleJob('updateTimerJob')
        }

        this.scheduleJob('premiumMembersReportJob')
    }

    scheduleJob (name) {
        if (this.jobs[name]) throw new Error('A job with that name already exists.')
        const job = cronConfig[name]
        this.jobs[name] = cron.schedule(job.expression, () => job.job(this))
    }

    stopJob (name) {
        if (!this.jobs[name]) throw new Error('No job with that name exists.')
        this.jobs[name].stop()
    }
}
