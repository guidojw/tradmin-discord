'use strict'
module.exports = class SettingProvider {
    init = async client => {
        this.bot = client.bot

        client.on('commandPrefixChange', (guild, prefix) => {
            this.set(guild, 'prefix', prefix)
        })
    }

    setSettings = async (guild, settings) => {
        await (await this.bot.getGuild(guild.id)).setData('settings', settings)
    }

    getSettings = async guild => {
        return (await this.bot.getGuild(guild.id)).getData('settings')
    }

    set = async (guild, key, val) => {
        const settings = await this.getSettings(guild)
        settings[key] = val
        return this.setSettings(guild, settings)
    }

    get = async (guild, key, defVal) => {
        const settings = await this.getSettings(guild)
        return settings[key] || defVal
    }

    clear = async guild => {
        return this.setSettings(guild, undefined)
    }
}
