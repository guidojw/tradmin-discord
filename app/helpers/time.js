'use strict'
const timeRegex = /^(2[0-3]|[0-1]?[\d]):[0-5][\d]$/
const dateRegex = /(([0-2]?[0-9]|3[0-1])[-](0?[1-9]|1[0-2])[-][0-9]{4})/

function getReadableDate (opts) {
  return `${opts.day}-${opts.month}-${opts.year}`
}

function getReadableTime (opts) {
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
  if (dateRegex.test(dateString)) {
    const { day, month, year } = exports.getDateInfo(dateString)
    const leapYear = year % 4 === 0
    if (month === 0 || month === 2 || month === 4 || month === 6 || month === 7 || month === 9 || month === 11) {
      return day <= 31
    } else if (month === 3 || month === 5 || month === 8 || month === 10) {
      return day <= 30
    } else if (month === 1) {
      return leapYear ? day <= 29 : day <= 28
    }
  }
  return false
}

exports.validTime = timeString => {
  return timeRegex.test(timeString)
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
  const years = Math.floor(milliseconds / (365.25 * 24 * 60 * 60 * 1000))
  const yearsMilliseconds = milliseconds / (365.25 * 24 * 60 * 60 * 1000)
  const days = Math.floor(yearsMilliseconds / (24 * 60 * 60 * 1000))
  const daysMilliseconds = milliseconds % (24 * 60 * 60 * 1000)
  const hours = Math.floor(daysMilliseconds / (60 * 60 * 1000))
  const hoursMilliseconds = milliseconds % (60 * 60 * 1000)
  const minutes = Math.floor(hoursMilliseconds / (60 * 1000))
  const minutesMilliseconds = milliseconds % (60 * 1000)
  const seconds = Math.floor(minutesMilliseconds / (1000))
  return `${years > 0 ? years + 'y ' : ''}${days > 0 ? days + 'd ' : ''}${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds + 's '}`
}

exports.diffDays = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  d1.setHours(0, 0, 0)
  d2.setHours(0, 0, 0)
  return Math.round(Math.abs((d1 - d2) / (24 * 60 * 60 * 1000)))
}
