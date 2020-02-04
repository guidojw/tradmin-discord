'use strict'
exports.hasRole = (member, name) => {
    return member.roles.some(role => role.name === name)
}

exports.isAdmin = (member, adminRoles) => {
    for (const role of adminRoles) {
        if (exports.hasRole(member, role)) return true
    }
    return false
}

exports.addRole = async (member, name) => {
    const role = member.guild.roles.find(role => role.name === name)
    if (role) await member.addRole(role)
}

exports.removeRole = async (member, name) => {
    const role = member.roles.find(role => role.name === name)
    if (role) await member.removeRole(role)
}
