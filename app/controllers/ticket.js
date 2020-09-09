'use strict'
const EventEmitter = require('events')
const { MessageEmbed, DiscordAPIError } = require('discord.js')
const discordService = require('../services/discord')
const { stripIndents } = require('common-tags')
const short = require('short-uuid')
const roVerAdapter = require('../adapters/roVer')
const timeHelper = require('../helpers/time')
const pluralize = require('pluralize')

const applicationConfig = require('../../config/application')

const TicketState = {
    INIT: 'init',
    CREATING_CHANNEL: 'creatingChannel',
    REQUESTING_REPORT: 'requestingReport',
    SUBMITTING_REPORT: 'submittingReport',
    CONNECTED: 'connected',
    RECONNECTED: 'reconnected',
    REQUESTING_RATING: 'requestingRating',
    CLOSING: 'closing'
}

const TicketType = {
    DATA_LOSS_REPORT: 'dataLossReport',
    PERSON_REPORT: 'personReport',
    PRIZE_CLAIM: 'prizeClaim'
}

const SUBMISSION_TIME = 30 * 60 * 1000 // time after which an unsubmitted ticket will be closed

class TicketController extends EventEmitter {
    constructor (ticketsController, client, type, author) {
        super()

        this.ticketsController = ticketsController
        this.client = client
        this.type = type

        // If this is a new ticket
        if (author) {
            this.author = author

            this.id = short.generate()
            this.state = TicketState.INIT

            this.report = [] // array of messages describing report
            this.moderators = []

            this.init()

        // If this is a reconnected ticket
        // being reinstantiated after reboot
        } else {
            this.state = TicketState.RECONNECTED
        }

    }

    async init () {
        // Create channel in guild which admins and the ticket
        // creator can see and reply to
        await this.createChannel()

        // Populate the channel with the ticket creator's data
        // and the full report and attachments
        await this.populateChannel()

        // Populate
        // If the ticket type is a data loss report,
        // ask the user for the actual report to be discussed
        if (this.type === TicketType.DATA_LOSS_REPORT || this.type === TicketType.PERSON_REPORT) {
            await this.requestReport()

        // If the ticket type is a prize claim,
        // submit ticket immediately
        } else if (this.type === TicketType.PRIZE_CLAIM) {
            await this.submit()
        }
    }

    async createChannel () {
        this.state = TicketState.CREATING_CHANNEL

        const name = `${this.type}-${this.id}`

        // Create channel
        const guild = this.client.bot.mainGuild
        this.channel = await guild.guild.channels.create(name)
        this.channel = await this.channel.setParent(guild.getData('channels').ticketsCategory)

        // Allow the ticket's creator to see the channel
        await this.channel.updateOverwrite(this.author, { VIEW_CHANNEL: true })
    }

    async populateChannel () {
        // Check if user is verified with RoVer
        // If so, the Roblox username and ID are retrieved
        const response = (await roVerAdapter('get', `/user/${this.author.id}`)).data
        const username = response.robloxUsername
        const userId = response.robloxId

        const date = new Date()
        const readableDate = timeHelper.getDate(date)
        const readableTime = timeHelper.getTime(date)

        // Post an embed in the ticket's channel with the ticket's information
        const embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('Ticket Information')
            .setDescription(stripIndents`
                Username: ${username ? '**' + username + '**' : '*User is not verified with RoVer*'}
                User ID: ${userId ? '**' + userId + '**' : '*User is not verified with RoVer*'}
                Start time: ${readableDate + ' ' + readableTime}
                `)
            .setFooter(`Ticket ID: ${this.id}`)
        await this.channel.send(`${this.author}`, { embed })
    }

    async requestReport () {
        this.state = TicketState.REQUESTING_REPORT

        // Ask for a summary of the report
        const embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('Please summarise your report')
            .setDescription(stripIndents`
                You may use several messages and attach pictures/videos.
                Use the command \`/submitreport\` once you're done or \`/closeticket\` to close your ticket.
                `)
        await this.channel.send(embed)

        // Initialise the submission timeout after which the ticket will
        // be closed if nothing was submitted
        this.timeout = setTimeout(this.close.bind(this, 'Timeout: ticket closed'), SUBMISSION_TIME)

        this.state = TicketState.SUBMITTING_REPORT
    }

    async submit () {
        // If the ticket author is currently entering a data loss report
        // or the ticket is a prize claim in creating channel state
        if ((this.type === TicketType.DATA_LOSS_REPORT || this.type === TicketType.PERSON_REPORT) && (this.state ===
            TicketState.REQUESTING_REPORT || this.state === TicketState.SUBMITTING_REPORT)
            || this.type === TicketType.PRIZE_CLAIM && this.state === TicketState.CREATING_CHANNEL) {

            // Clear the submission timeout initialised in requestReport
            clearTimeout(this.timeout)

            // Log the action
            await this.client.bot.log(this.author,
                `${this.author} **opened ticket** \`${this.id}\` **in** ${this.channel}`, `Ticket ID: ${this.id}`)

            // Send success embed in which the following process is clarified
            const embed = new MessageEmbed()
                .setColor(applicationConfig.primaryColor)
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                .setTitle('Successfully submitted ticket')
                .setDescription(stripIndents`
                    Please wait for a Ticket Moderator to assess your ticket.
                    This may take up to 24 hours. You can still close your ticket by using the \`/closeticket\` command.
                    `)
            await this.channel.send(embed)

            // Allow Ticket Moderators to see the channel
            const guild = this.client.bot.getGuild(this.channel.guild.id)
            const roles = guild.getData('roles')
            await this.channel.updateOverwrite(roles.ticketModeratorRole, { VIEW_CHANNEL: true })

            // Change state to connected so that the TicketsController knows
            // to link messages through to the newly created channel
            this.state = TicketState.CONNECTED
        }
    }

    async close (message, success, color) {
        // Delete the ticket's channel in the guild if existent
        if (this.channel) {
            await this.channel.delete()
        }

        // If this ticket isn't reconnected and thus hasn't lost its author
        if (this.state !== TicketState.RECONNECTED) {
            this.state = TicketState.CLOSING

            // Send closing message
            const embed = new MessageEmbed()
                .setColor(color ? color : success ? 0x00ff00 : 0xff0000)
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                .setTitle(message)
            await this.sendAuthor(embed)

            // Request for the ticket creator's rating if
            // the ticket was closed successfully
            if (success) {
                const rating = await this.requestRating()

                // If a rating was submitted, log it
                if (rating) {
                    await this.logRating(rating)

                // If no rating is submitted after the reaction collector closes
                } else {
                    // Tell the user their rating hasn't been submitted
                    const successEmbed = new MessageEmbed()
                        .setColor(applicationConfig.primaryColor)
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                        .setTitle('No rating submitted')
                    await this.sendAuthor(successEmbed)
                }
            }
        }

        this.emit('close')
    }

    async sendAuthor (content) {
        try {
            return await this.author.send(content)
        } catch (err) {
            if (err instanceof DiscordAPIError) {
                // Most likely because the author has DMs closed,
                // do nothing
            } else {
                throw err
            }
        }
    }

    async requestRating () {
        this.state = TicketState.REQUESTING_RATING

        // Send the question embed
        const embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('How would you rate the support you got?')
        const message = await this.sendAuthor(embed)

        // Prompt how the user rates their support
        const options = []
        for (let i = 5; i >= 1; i--) {
            options.push(discordService.getEmojiFromNumber(i))
        }

        let rating = await discordService.prompt(this.author, this.author, message, options)
        rating = rating && rating.substring(0, 1)
        return rating
    }

    async logRating (rating) {
        // Form a string of the moderator's names
        let result = ''
        for (let i = 0; i < this.moderators.length; i++) {
            const moderator = this.moderators[i]
            result += `**${moderator.tag}**`
            if (i < this.moderators.length - 2) {
                result += ', '
            } else if (i === this.moderators.length - 2) {
                result += ' & '
            }
        }
        result = result || 'none'

        // Get the ratings channel
        const channels = this.client.bot.mainGuild.getData('channels')
        const channel = this.client.bot.mainGuild.guild.channels.cache.get(channels.ratingsChannel)

        // Send the ticket rating
        const ratingEmbed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.author.tag, this.author.displayAvatarURL())
            .setTitle('Ticket Rating')
            .setDescription(stripIndents`
                ${pluralize('Moderator', this.moderators.length)}: ${result}
                Rating: **${rating}**
                `)
            .setFooter(`Ticket ID: ${this.id}`)
        await channel.send(ratingEmbed)

        // Tell the user their rating has been submitted
        const successEmbed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('Rating submitted')
            .setDescription('Thank you!')
        return this.sendAuthor(successEmbed)
    }

    static getTypeFromName (name) {
        for (const [type, typeName] of Object.entries(TicketType)) {
            if (typeName.toLowerCase() === name.toLowerCase()) {
                return type
            }
        }
    }
}

module.exports = {
    TicketController,
    TicketState,
    TicketType
}
