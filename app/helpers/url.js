'use strict'
const { getUrls } = require('./string')

exports.validUrl = val => {
  const matches = getUrls(val)
  return matches && matches[0].length === val.length
}
