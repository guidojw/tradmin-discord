'use strict'
const fs = require('fs')
const path = require('path')

module.exports = class Guild {
    constructor(bot, id) {
        this.bot = bot
        this.id = id
        this.guild = this.bot.client.guilds.get(id)
        this.dataPath = path.join(__dirname, '../../data', `${id}.json`)
        this.data = undefined
    }

    loadData = async () => {
        try {
            await fs.promises.access(this.dataPath)
        } catch (err) {
            await fs.promises.writeFile(this.dataPath, JSON.stringify({

            }))
        }
        try {
            this.data = JSON.parse(await fs.promises.readFile(this.dataPath))
        } catch (err) {
            throw err
        }
    }

    fetch = async () => {
        await this.guild.channels.get(this.getData('channels').rolesChannel).fetchMessages()
    }

    setData = async (key, value) => {
        if (!this.data) throw new Error('Guild data is not loaded yet.')
        this.data[key] = value
        await fs.promises.writeFile(this.dataPath, JSON.stringify(this.data))
    }

    getData = key => {
        if (!this.data) throw new Error('Guild data is not loaded yet.')
        return this.data[key]
    }
}
