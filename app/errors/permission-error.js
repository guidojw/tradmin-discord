'use strict'
class PermissionError extends Error {
    constructor(message) {
        if (!message) message = 'You are not an admin!'
        super(message)
    }
}

module.exports = PermissionError
