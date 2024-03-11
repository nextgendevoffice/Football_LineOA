const { getMatchesInPlay, getMatchesToday } = require('./footballApi');
const { sendNotification } = require('./lineNotify');
const logger = require('./logger');

async function checkLiveScores() {
  logger.info('Checking live scores');

  try {
    const matches = await getMatchesInPlay();
    
    for (const match of matches) {
      const { homeTeam, awayTeam, score } = match;
      
      // ดึงข้อมูลผู้ทำประตูของทั้งสองทีม
      const homeScorers = match.score.fullTime.homeTeam > 0 ? await getScorers(match.id, homeTeam.id) : [];
      const awayScorers = match.score.fullTime.awayTeam > 0 ? await getScorers(match.id, awayTeam.id) : [];
      
      let message = `ผลบอลสด: ${homeTeam.name} ${score.fullTime.homeTeam} - ${score.fullTime.awayTeam} ${awayTeam.name}\n`;
      
      // เพิ่มชื่อผู้ทำประตูของทีมเจ้าบ้าน
      if (homeScorers.length > 0) {
        message += `ผู้ทำประตู ${homeTeam.name}: ${homeScorers.join(', ')}\n`;
      }
      
      // เพิ่มชื่อผู้ทำประตูของทีมเยือน
      if (awayScorers.length > 0) {
        message += `ผู้ทำประตู ${awayTeam.name}: ${awayScorers.join(', ')}`;
      }
      
      await sendNotification(message);
    }
  } catch (error) {
    logger.error('Error checking live scores:', error);
  }
}

async function sendTodayMatches() {
  logger.info('Sending today matches');

  try {
    const matches = await getMatchesToday();
    
    if (matches.length === 0) {
      await sendNotification('วันนี้ไม่มีการแข่งขันฟุตบอล');
    } else {
      let message = 'ตารางบอลวันนี้\n\n';
      for (const match of matches) {
        const { homeTeam, awayTeam, utcDate, competition } = match;
        const localDate = new Date(utcDate).toLocaleString('th-TH', {
          timeZone: 'Asia/Bangkok',
          hour12: false,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        message += `วันที่แข่งขัน : ${localDate}\n`;
        message += `ลีก : ${competition.name}\n`;
        message += `ระหว่าง : ${homeTeam.name} VS ${awayTeam.name}\n\n`;
      }
      await sendNotification(message);
    }
  } catch (error) {
    logger.error('Error sending today matches:', error);
  }
}

function startLiveScoreNotification(intervalInMilliseconds) {
  logger.info(`Starting live score notification every ${intervalInMilliseconds} ms`);
  setInterval(checkLiveScores, intervalInMilliseconds);
}

async function getScorers(matchId, teamId) {
  try {
    const response = await axios.get(`${FOOTBALL_API_ENDPOINT}/matches/${matchId}`, {
      headers: { 'X-Auth-Token': FOOTBALL_API_KEY }
    });
    
    const scorers = response.data.match.goals
      .filter(goal => goal.team.id === teamId)
      .map(goal => goal.scorer.name);
    
    return scorers;
  } catch (error) {
    logger.error(`Error fetching scorers for match ${matchId}, team ${teamId}:`, error);
    return [];
  }
}

async function startSystem() {
  // ส่งตารางบอลคู่การแข่งขันวันนี้ทันทีหลังจากเริ่มต้นระบบ
  await sendTodayMatches();

  // เริ่มการแจ้งเตือนผลบอลสดทุกๆ 1 นาที (60,000 มิลลิวินาที)
  startLiveScoreNotification(60000);
}

startSystem();