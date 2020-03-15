'use strict'
module.exports = async guild => {
    const members = await guild.guild.members.fetch()
    console.log(members)
}
