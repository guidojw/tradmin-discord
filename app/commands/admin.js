'use strict'
const botController = require('../controllers/bot')

const InputError = require('../errors/input-error')

exports.activity = async req => {
    if (req.args.length > 0) {
        const type = req.args.shift().toUpperCase()
        if (type !== 'PLAYING' && type !== 'STREAMING' && type !== 'LISTENING' && type !== 'WATCHING') {
            throw new InputError()
        }
        const options = {type: type}
        if (type === 'STREAMING') {
            options.url = req.args.pop()
            if (!options.url) throw new InputError()
        }
        await botController.setActivity(req.args.join(' '), options)
    }
}
