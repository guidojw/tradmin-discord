'use strict'
const fs = require('fs')
const path = require('path')
const cron = require('node-cron')
const timerJob = require('../jobs/timerJob')

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
        if (voteData.timer && voteData.timer.end > new Date().getTime()) {
            this.scheduleJob('timerJob', '*/3 * * * *', () => timerJob(voteData, this))
        }
    }

    scheduleJob (name, expression, func) {
        if (this.jobs[name]) throw new Error('A job with that name already exists.')
        this.jobs[name] = cron.schedule(expression, func)
    }

    stopJob (name) {
        if (!this.jobs[name]) throw new Error('No job with that name exists.')
        this.jobs[name].stop()
    }
}
