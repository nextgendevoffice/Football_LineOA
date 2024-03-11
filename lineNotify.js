const axios = require('axios');
const { LINE_ACCESS_TOKEN } = require('./config');
const logger = require('./logger');

async function sendNotification(message) {
  logger.info(`Sending notification: ${message}`);

  try {
    await axios.post('https://api.line.me/v2/bot/message/broadcast', {
      messages: [{ type: 'text', text: message }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
      }
    });
    logger.info('Notification sent successfully');
  } catch (error) {
    logger.error('Error sending notification:', error);
    throw error;
  }
}

module.exports = {
  sendNotification
};