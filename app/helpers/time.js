'use strict'
function getReadableDate(opts) {
    return `${opts.day}-${opts.month}-${opts.year}`
}

function getReadableTime(opts) {
    return `${opts.hours}:${'0'.repeat(2 - String(opts.minutes).length)}${opts.minutes}`
}

exports.getDate = date => {
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return getReadableDate({ day, month, year })
}

exports.getTime = date => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return getReadableTime({ hours, minutes })
}

exports.validDate = dateString => {
    if (dateString.length >= 8 && dateString.length <= 10) {
        if (dateString.indexOf('-') !== dateString.lastIndexOf('-')) {
            const day = parseInt(dateString.substring(0, dateString.indexOf('-')))
            const month = parseInt(dateString.substring(dateString.indexOf('-') + 1, dateString.lastIndexOf(
                '-')))
            const year = parseInt(dateString.substring(dateString.lastIndexOf('-') + 1, dateString.length))
            if (day && month && year) {
                const leapYear = year % 4 === 0
                if (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month
                    === 12) {
                    return day <= 31
                } else if (month === 4 || month === 6 || month === 9 || month === 11) {
                    return day <= 30
                } else if (month === 2) {
                    if (leapYear) {
                        return day <= 29
                    } else {
                        return day <= 28
                    }
                }
            }
        }
    }
    return false
}

exports.validTime = timeString => {
    if (timeString.length >= 4 && timeString.length <= 5 && timeString.indexOf(':') !== -1) {
        const hours = parseInt(timeString.slice(0, timeString.indexOf(':')))
        const minutes = parseInt(timeString.slice(timeString.indexOf(':') + 1))
        return (hours && minutes || hours === 0 && minutes || hours === 0 && minutes === 0 || hours && minutes ===
            0) && (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60)
    }
    return false
}

exports.getDateInfo = dateString => {
    const day = dateString.substring(0, dateString.indexOf('-'))
    const month = dateString.substring(dateString.indexOf('-') + 1, dateString.lastIndexOf('-'))
    const year = dateString.substring(dateString.lastIndexOf('-') + 1, dateString.length)
    return { day: day, month: month, year: year }
}

exports.getTimeInfo = timeString => {
    const hours = timeString.substring(0, timeString.indexOf(':'))
    const minutes = timeString.substring(timeString.indexOf(':') + 1, timeString.length)
    return { hours: hours, minutes: minutes }
}

exports.getDurationString = milliseconds => {
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000))
    const daysMilliseconds = milliseconds % (24 * 60 * 60 * 1000)
    const hours = Math.floor(daysMilliseconds / (60 * 60 * 1000))
    const hoursMilliseconds = milliseconds % (60 * 60 * 1000)
    const minutes = Math.floor(hoursMilliseconds / (60 * 1000))
    const minutesMilliseconds = milliseconds % (60 * 1000)
    const seconds = Math.floor(minutesMilliseconds / (1000))
    return (days > 0 ? days + 'd ' : '') + (hours > 0 ? hours + 'h ' : '') + (minutes > 0 ? minutes + 'm ' : '') +
        seconds + 's'
}
