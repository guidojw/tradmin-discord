'use strict'
const { MessageEmbed, MessageAttachment } = require('discord.js')
const timeHelper = require('../helpers/time')

const REACTION_COLLECTOR_TIMEOUT = 60000

exports.isAdmin = (member, adminRoles) => {
  for (const roleId of adminRoles) {
    if (member.roles.cache.has(roleId)) return true
  }
  return false
}

exports.getEmojiFromNumber = number => {
  switch (number) {
    case 1:
      return '1⃣'
    case 2:
      return '2⃣'
    case 3:
      return '3⃣'
    case 4:
      return '4⃣'
    case 5:
      return '5⃣'
    case 6:
      return '6⃣'
    case 7:
      return '7⃣'
    case 8:
      return '8⃣'
    case 9:
      return '9⃣'
    case 10:
      return '🔟'
  }
}

exports.prompt = async (channel, author, message, options) => {
  const filter = (reaction, user) => options.includes(reaction.emoji.name) && user.id === author.id
  const collector = message.createReactionCollector(filter, { time: REACTION_COLLECTOR_TIMEOUT })
  const promise = new Promise(resolve => {
    collector.on('end', collected => {
      const reaction = collected.first()
      resolve(reaction ? reaction.emoji.name : null)
    })
  })
  collector.on('collect', collector.stop)
  for (const option of options) {
    await message.react(option)
  }
  return promise
}

exports.getVoteMessages = async (voteData, client) => {
  const messages = { options: {} }
  messages.intro = {
    content: `**${voteData.title}**\n${voteData.description}`,
    options: voteData.image ? new MessageAttachment(voteData.image) : undefined
  }
  let first = true
  for (const [id, option] of Object.entries(voteData.options)) {
    const user = client.users.cache.get(id)
    if (user) {
      messages.options[id] = {
        content: first ? '👥 **Participants**' : undefined,
        options: new MessageEmbed()
          .setTitle(user.tag)
          .setThumbnail(user.displayAvatarURL())
          .setDescription(option.description)
          .setFooter('Votes: 0')
      }
      first = false
    }
  }
  messages.info = {
    options: new MessageEmbed()
      .setFooter('You can vote by reacting the pencil on the participant you want to vote on.\nOnly your ' +
        'first vote will count and removing your reaction will not remove your vote.\nEnds at')
      // The showvote command can call this with voteData that has no timer set yet so fake a timestamp with
      // the current time.
      .setTimestamp(voteData.timer ? voteData.timer.end : Date.now())
  }
  messages.timer = {
    content: `🕰️ *${timeHelper.getDurationString(voteData.timer ? voteData.timer.end - new Date()
      .getTime() : 0)}* left to vote!`
  }
  return messages
}
