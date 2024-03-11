const axios = require('axios');
const { FOOTBALL_API_ENDPOINT, FOOTBALL_API_KEY } = require('./config');
const logger = require('./logger');

async function getMatchesInPlay() {
  logger.info('Fetching matches in play');

  try {
    const response = await axios.get(`${FOOTBALL_API_ENDPOINT}/matches`, {
      params: { status: 'IN_PLAY' },
      headers: { 'X-Auth-Token': FOOTBALL_API_KEY }
    });
    logger.info(`Found ${response.data.matches.length} matches in play`);
    return response.data.matches;
  } catch (error) {
    logger.error('Error fetching matches in play:', error);
    throw error;
  }
}

async function getMatchesToday() {
  const today = new Date().toISOString().slice(0, 10);
  logger.info(`Fetching matches for today (${today})`);

  try {
    const response = await axios.get(`${FOOTBALL_API_ENDPOINT}/matches`, {
      params: { dateFrom: today, dateTo: today },
      headers: { 'X-Auth-Token': FOOTBALL_API_KEY }
    });
    logger.info(`Found ${response.data.matches.length} matches for today`);
    return response.data.matches;
  } catch (error) {
    logger.error('Error fetching matches for today:', error);
    throw error;
  }
}

module.exports = {
  getMatchesInPlay,
  getMatchesToday
};