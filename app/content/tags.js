'use strict'
const { stripIndents } = require('common-tags')
const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../config/application')

module.exports = [{
  names: ['privacy', 'privacypolicy', 'pp'],
  tag: new MessageEmbed()
    .setColor(applicationConfig.primaryColor)
    .setTitle('Privacy Policy')
    .setDescription('This policy sums up all you need to know about what data we store, what we use it for and what you can do about it.')
    .addField('Stored in a Database', stripIndents`
            - Discord user IDs: for vote participants.
            - Parts of message contents: these are always provided by the user and are used for vote descriptions and vote participant descriptions.

            The database is hosted on a VPS residing in Germany.
            `)
    .addField('Stored in Cache', 'The Discord.js library automatically caches many things that come from Discord directly, they can range from avatars to message contents, to meta parameters such as role colors, names, user tags, user flags (badges). Most of this content is used to provide logs or command output, and is deleted on bot shutdown, as it is put into a volatile storage.')
    .addField('Stored in Discord', 'Output of bot commands that is sent to Discord may include things like names, IDs and icons/avatars. This data cannot be deleted by us as there is no feasible way to do so.')
    .addField('\u200b', 'Official TR Staff have access to the bot\'s logs. These logs are all sent in a private and strictly controlled Discord server. We use logs to provide a safe environment for the bot\'s users as well as for keeping our processes streamlined.')
    .addField('Requesting Data Deletion', 'To request deletion of your data, please contact the Staff at the support server. If you are banned from the server and still want to use your right to deletion, you can instead DM a Staff member through friend requests or mutual servers. Your data is ensured to be deleted within 14 days from your request.')
    .addField('Data Security', 'The TR Staff reserves the right to modify or delete any data at any given time, without notice or warning.')
}, {
  names: ['ticket'],
  tag: new MessageEmbed()
    .setColor(applicationConfig.primaryColor)
    .setTitle('How to create a new support ticket?')
    .setDescription(stripIndents`
            You can create a new ticket by clicking the regarding number in #support.
            If applicable, the bot will ask you for a clear description of your report.

            Once submitted, our Ticket Moderators will respond to your ticket as soon as possible. This may take up to 24 hours, depending on your ticket type.
            `)
}, {
  names: ['train'],
  tag: new MessageEmbed()
    .setColor(applicationConfig.primaryColor)
    .setTitle('We do not take train suggestions.')
    .setDescription(stripIndents`
            If you wish for a train to be in the game, you would need to model one yourself and submit it. #faq has some more information about submissions.

            YouTube does have multiple tutorials on the process, for example:
            - [Using CSG in Roblox Studio](https://youtu.be/a0iPvgKUzU0)
            - [3D modelling in Blender](https://youtu.be/TPrnSACiTJ4)
        `)
}]
