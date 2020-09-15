'use strict'
const discordService = require('../services/discord')
const { MessageEmbed } = require('discord.js')
const { TicketController, TicketState, TicketType } = require('./ticket')

const TICKETS_INTERVAL = 60000

module.exports = class TicketsController {
    constructor (client) {
        this.client = client

        this.tickets = {} // map from ticket ID to TicketController
        this.debounces = {} // map from user ID to debounce flag

        this.init()
    }

    async init () {
        // Instantiate a TicketController for every ticket's channel
        const guild = this.client.bot.mainGuild
        const channels = guild.getData('channels')
        const category = guild.guild.channels.cache.get(channels.ticketsCategory)

        for (const channel of category.children.values()) {
            // Ignore the ratings and support channels
            if (channel.id === channels.ratingsChannel || channel.id === channels.supportChannel) {
                continue
            }

            // Get the ticket's id and type from the channel name (dataloss-id)
            const parts = channel.name.split('-')
            const type = TicketController.getTypeFromName(parts[0])
            const id = parts[1]

            // Instantiate a new TicketController
            const ticketController = new TicketController(this, this.client, type)
            ticketController.id = id
            ticketController.channel = channel
            this.tickets[id] = ticketController
            ticketController.once('close', this.clearTicket.bind(this, ticketController))
        }

        // Connect the message event for adding messages and moderators
        // to open TicketControllers
        this.client.on('message', this.message.bind(this))

        // Connect the messageReactionAdd event for making new tickets
        this.client.on('messageReactionAdd', this.messageReactionAdd.bind(this))
    }

    async messageReactionAdd (reaction, user) {
        if (user.bot) {
            return
        }
        const message = reaction.message
        if (message.partial) {
            await message.fetch()
        }
        if (!message.guild) {
            return
        }

        // If reaction is in the support channel on the support message
        const guild = await this.client.bot.getGuild(message.guild.id)
        const channels = guild.getData('channels')
        const messages = guild.getData('messages')
        if (message.channel.id !== channels.supportChannel || message.id !== messages.supportMessage) {
            return
        }

        // If the reaction is one of the TicketTypes' assigned reactions
        /* eslint-disable indent */
        const type = reaction.emoji.name === discordService.getEmojiFromNumber(1) ? TicketType.DATA_LOSS_REPORT
            : reaction.emoji.name === discordService.getEmojiFromNumber(2) ? TicketType.PERSON_REPORT
            : reaction.emoji.name === discordService.getEmojiFromNumber(3) ? TicketType.PRIZE_CLAIM
            : reaction.emoji.name === discordService.getEmojiFromNumber(4) ? TicketType.BAN_APPEAL
            : undefined
        /* eslint-enable indent */
        if (type) {

            // Immediately remove the reaction
            await reaction.users.remove(user)

            let ticketController = this.getTicketFromAuthor(user)

            // If author doesn't have a open ticket yet and can create a ticket
            if (!ticketController && !this.debounces[user.id]) {
                // Set a timeout of 60 seconds in which the bot
                // will not react to message reactions.
                this.debounces[user.id] = true
                const timeout = setTimeout(this.clearAuthor.bind(this, user), TICKETS_INTERVAL)

                // If the support system is offline, let the user know
                if (!this.client.bot.mainGuild.getData('settings').supportEnabled) {
                    const embed = new MessageEmbed()
                        .setColor(0xff0000)
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                        .setTitle('Welcome to Twin-Rail Support')
                        .setDescription('We are currently closed. Check the Twin-Rail server for more information.')
                    return user.send(embed)
                }

                // Check if the user is banned from making tickets
                const member = guild.guild.member(user)
                const roles = guild.getData('roles')
                if (member.roles.cache.has(roles.ticketsBannedRole)) {
                    const banEmbed = new MessageEmbed()
                        .setColor(0xff0000)
                        .setTitle('Couldn\'t make ticket')
                        .setDescription('You\'re banned from making new tickets.')
                    return user.send(banEmbed)
                }

                clearTimeout(timeout)

                // Instantiate and connect a new TicketController
                ticketController = new TicketController(this, this.client, type, user)
                this.tickets[ticketController.id] = ticketController
                ticketController.once('close', this.clearTicket.bind(this, ticketController))

            // If author already has created a ticket
            } else if (ticketController) {
                const banEmbed = new MessageEmbed()
                    .setColor(0xff0000)
                    .setTitle('Couldn\'t make ticket')
                    .setDescription('You already have an open ticket.')
                await user.send(banEmbed)
            }
        }
    }

    async message (message) {
        if (message.author.bot) {
            return
        }
        if (message.partial) {
            await message.fetch()
        }
        if (!message.guild) {
            return
        }
        if (message.content.startsWith(this.client.commandPrefix)) {
            return
        }

        // Check if the channel is actually a ticket channel
        const guild = this.client.bot.getGuild(message.guild.id)
        const channels = guild.getData('channels')
        if (message.channel.parentID !== channels.ticketsCategory) {
            return
        }

        // Get the channel's TicketController
        const ticketController = this.getTicketFromChannel(message.channel)
        if (ticketController) {
            // If this ticket is reconnected and thus has lost its author,
            // don't try to send
            if (ticketController.state === TicketState.RECONNECTED) {
                return
            }

            if (message.author.id === ticketController.author.id) {
                // If the ticket's author is currently entering their report,
                // add the message to the ticket's report messages
                if (ticketController.state === TicketState.SUBMITTING_REPORT) {
                    ticketController.report.push(message)
                }

            } else {
                // If the author is not yet added to the ticket's moderators,
                // add the author to the ticket's moderators
                if (!ticketController.moderators.includes(message.author)) {
                    ticketController.moderators.push(message.author)
                }
            }
        }
    }

    clearTicket (ticketController) {
        if (ticketController) {
            // If the TicketController hasn't lost its author
            if (ticketController.state !== TicketState.RECONNECTED) {
                this.clearAuthor(ticketController.author)
            }

            delete this.tickets[ticketController.id]
        }
    }

    clearAuthor (author) {
        delete this.debounces[author.id]
    }

    getTicketFromChannel (channel) {
        return Object.values(this.tickets).find(ticketController => {
            return ticketController.channel.id === channel.id
        })
    }

    getTicketFromAuthor (author) {
        return Object.values(this.tickets).find(ticketController => {
            return ticketController.state !== TicketState.RECONNECTED && ticketController.author.id === author.id
        })
    }
}
