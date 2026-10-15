import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  createCareer,
  getNextFixture,
  parseCareer,
  PREMIER_LEAGUE_2026_27_MATCHWEEK_DATES,
  serializeCareer,
  simulateNextRound
} from '../manager-core.js';
import { finaliseSeason } from '../season-finalisation-v1.js';

const [metadata, clubs, players] = await Promise.all([
  readFile(new URL('../data/current/metadata.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../data/current/clubs.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../data/current/players.json', import.meta.url), 'utf8').then(JSON.parse)
]);

const expectedNames = [
  'AFC Bournemouth', 'Arsenal', 'Aston Villa', 'Brentford', 'Brighton & Hove Albion',
  'Chelsea', 'Coventry City', 'Crystal Palace', 'Everton', 'Fulham', 'Hull City',
  'Ipswich Town', 'Leeds United', 'Liverpool', 'Manchester City', 'Manchester United',
  'Newcastle United', 'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur'
];

function playableClubs() {
  const ids = new Set(metadata.playableDemo?.clubIds || []);
  return clubs.filter(club => ids.has(club.id) && !club.isPlaceholder);
}

function longestVenueRun(fixtures, clubId) {
  const sequence = fixtures.map(round => {
    const fixture = round.find(item => item.homeClubId === clubId || item.awayClubId === clubId);
    return fixture.homeClubId === clubId ? 'H' : 'A';
  });
  let longest = 1;
  let current = 1;
  for (let index = 1; index < sequence.length; index += 1) {
    if (sequence[index] === sequence[index - 1]) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

test('current database contains exactly the 20 playable Premier League clubs', () => {
  const playable = playableClubs();
  assert.equal(playable.length, 20);
  assert.deepEqual(playable.map(club => club.name).sort(), [...expectedNames].sort());
  assert.ok(playable.every(club => club.leagueId === 'eng-premier-league'));
  assert.equal(metadata.importProgress?.['eng-premier-league']?.realClubs, 20);
  assert.equal(metadata.importProgress?.['eng-premier-league']?.status, 'complete');
});

test('every playable Premier League club has a viable imported squad', () => {
  for (const club of playableClubs()) {
    const squad = players.filter(player => player.clubId === club.id && !player.isPlaceholder);
    assert.ok(squad.length >= 18, `${club.name} has only ${squad.length} real players`);
    assert.ok(squad.some(player => player.positionGroup === 'GK'), `${club.name} has no goalkeeper`);
    assert.ok(squad.filter(player => player.positionGroup === 'DEF').length >= 4, `${club.name} has fewer than four defenders`);
    assert.ok(squad.filter(player => player.positionGroup === 'MID').length >= 3, `${club.name} has fewer than three midfielders`);
    assert.ok(squad.filter(player => player.positionGroup === 'ATT').length >= 2, `${club.name} has fewer than two attackers`);
  }
});

test('20-club career creates a complete 38-match home-and-away league season', () => {
  const playable = playableClubs();
  const career = createCareer({
    clubId: playable[0].id,
    clubs: playable,
    players,
    seed: 'epl20-regression',
    managerName: 'Regression Manager'
  });

  assert.equal(career.competitionFormat, 'double-round-robin');
  assert.equal(career.table.length, 20);
  assert.equal(career.fixtures.length, 38);
  assert.ok(career.fixtures.every(round => round.length === 10));
  assert.equal(career.fixtures.flat().length, 380);
  assert.equal(career.fixtures[0][0].date, '2026-08-21');
  assert.equal(career.fixtures.at(-1)[0].date, '2027-05-30');
  assert.deepEqual(career.fixtures.map(round => round[0].date), PREMIER_LEAGUE_2026_27_MATCHWEEK_DATES);

  const pairings = new Map();
  for (const fixture of career.fixtures.flat()) {
    const key = [fixture.homeClubId, fixture.awayClubId].sort().join(':');
    const list = pairings.get(key) || [];
    list.push(fixture);
    pairings.set(key, list);
  }
  assert.equal(pairings.size, 190);
  for (const matches of pairings.values()) {
    assert.equal(matches.length, 2);
    assert.equal(matches[0].homeClubId, matches[1].awayClubId);
    assert.equal(matches[0].awayClubId, matches[1].homeClubId);
    assert.ok(matches[1].round - matches[0].round >= 18, 'return fixture is scheduled too soon');
  }

  for (const club of playable) {
    const clubFixtures = career.fixtures.flat().filter(fixture => fixture.homeClubId === club.id || fixture.awayClubId === club.id);
    assert.equal(clubFixtures.length, 38);
    assert.equal(clubFixtures.filter(fixture => fixture.homeClubId === club.id).length, 19);
    assert.equal(clubFixtures.filter(fixture => fixture.awayClubId === club.id).length, 19);
    assert.ok(longestVenueRun(career.fixtures, club.id) <= 2, `${club.name} has an unrealistic home/away streak`);
  }

  const midweeks = career.fixtures.filter(round => new Date(`${round[0].date}T12:00:00Z`).getUTCDay() === 3);
  assert.equal(midweeks.length, 5);
  assert.equal(career.fixtures.at(-1)[0].kickoffTime, '16:00');
});


// Phase 1: full real-database season reliability. The expected league table below
// is recomputed solely from played fixture results, not from manager-core's table.
test('Phase 1: full real-database Premier League season is consistent after saves', () => {
  const playable = playableClubs();
  const db = { metadata, clubs, players };
  const options = {
    clubId: playable[0].id,
    clubs: playable,
    players,
    seed: 'epl20-full-season-stress',
    managerName: 'Season Integrity Manager'
  };
  let career = createCareer(options);
  let uninterrupted = createCareer(options);
  const checkpoints = new Set([1, 10, 25, 37]);
  const roster = new Map(players.map(player => [player.id, player]));
  const clubIds = new Set(playable.map(club => club.id));
  const fields = ['played', 'won', 'drawn', 'lost', 'goalsFor', 'goalsAgainst', 'goalDifference', 'points'];
  const ids = new Set();

  function independentlyCalculatedTable(fixtures) {
    const standings = new Map([...clubIds].map(clubId => [
      clubId, { clubId, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0,
        goalsAgainst: 0, goalDifference: 0, points: 0 }
    ]));
    for (const fixture of fixtures.flat().filter(item => item.played)) {
      const home = standings.get(fixture.homeClubId);
      const away = standings.get(fixture.awayClubId);
      assert.ok(home && away && home !== away, `Invalid fixture ${fixture.id}`);
      assert.ok(Number.isInteger(fixture.homeGoals) && fixture.homeGoals >= 0);
      assert.ok(Number.isInteger(fixture.awayGoals) && fixture.awayGoals >= 0);
      home.played++; away.played++;
      home.goalsFor += fixture.homeGoals;
      home.goalsAgainst += fixture.awayGoals;
      away.goalsFor += fixture.awayGoals;
      away.goalsAgainst += fixture.homeGoals;
      if (fixture.homeGoals > fixture.awayGoals) {
        home.won++; away.lost++; home.points += 3;
      } else if (fixture.awayGoals > fixture.homeGoals) {
        away.won++; home.lost++; away.points += 3;
      } else {
        home.drawn++; away.drawn++; home.points++; away.points++;
      }
    }
    for (const row of standings.values()) {
      row.goalDifference = row.goalsFor - row.goalsAgainst;
    }
    return standings;
  }

  assert.equal(career.fixtures.length, 38);
  assert.equal(career.fixtures.flat().length, 380);
  for (const fixture of career.fixtures.flat()) {
    assert.ok(!ids.has(fixture.id), `Duplicate fixture ID ${fixture.id}`);
    ids.add(fixture.id);
  }

  for (let matchweek = 1; matchweek <= 38; matchweek++) {
    assert.equal(career.status, 'active', `Career ended before matchweek ${matchweek}`);
    assert.ok(getNextFixture(career), `Missing next fixture for matchweek ${matchweek}`);
    career = simulateNextRound(career, db);
    uninterrupted = simulateNextRound(uninterrupted, db);

    assert.equal(career.roundIndex, matchweek);
    assert.equal(career.table.length, 20);
    assert.equal(career.fixtures.flat().filter(fixture => fixture.played).length, matchweek * 10);
    assert.equal(career.fixtures.slice(matchweek).flat().some(fixture => fixture.played), false);
    const currentRound = career.fixtures[matchweek - 1];
    assert.equal(currentRound.length, 10);
    const participants = currentRound.flatMap(fixture => [fixture.homeClubId, fixture.awayClubId]);
    assert.equal(new Set(participants).size, 20, `Duplicate/missing club in round ${matchweek}`);
    for (const fixture of currentRound) {
      const goals = fixture.events.filter(event => event.type === 'goal');
      assert.equal(goals.length, fixture.homeGoals + fixture.awayGoals,
        `Goal events mismatch in ${fixture.id}`);
      for (const goal of goals) {
        assert.ok(goal.minute >= 1 && goal.minute <= 90);
        assert.equal(roster.get(goal.playerId)?.clubId, goal.clubId,
          `Wrong goalscorer club for ${fixture.id}`);
        assert.ok([fixture.homeClubId, fixture.awayClubId].includes(goal.clubId));
      }
    }

    const expected = independentlyCalculatedTable(career.fixtures);
    for (const actual of career.table) {
      const row = expected.get(actual.clubId);
      assert.ok(row, `Unknown club in table ${actual.clubId}`);
      for (const field of fields) {
        assert.equal(actual[field], row[field],
          `Table ${field} mismatch for ${actual.clubId} at matchweek ${matchweek}`);
      }
      assert.equal(actual.played, matchweek);
      assert.equal(actual.won + actual.drawn + actual.lost, matchweek);
    }

    for (const [playerId, status] of Object.entries(career.playerStatus)) {
      assert.ok(Number.isFinite(status.condition) && status.condition >= 1 && status.condition <= 100,
        `Invalid condition for ${playerId}`);
      assert.ok(Number.isFinite(status.sharpness) && status.sharpness >= 1 && status.sharpness <= 100,
        `Invalid sharpness for ${playerId}`);
      assert.ok(Number.isInteger(status.appearances) && status.appearances >= 0 &&
        status.appearances <= matchweek, `Invalid appearances for ${playerId}`);
      assert.ok(Number.isInteger(status.goals) && status.goals >= 0,
        `Invalid goals for ${playerId}`);
    }

    if (checkpoints.has(matchweek)) {
      const restored = parseCareer(serializeCareer(career), db);
      assert.deepEqual(restored.table, career.table);
      assert.deepEqual(restored.fixtures, career.fixtures);
      assert.deepEqual(restored.playerStatus, career.playerStatus);
      assert.equal(restored.roundIndex, matchweek);
      career = restored;
    }
  }

  assert.equal(career.status, 'complete');
  assert.equal(getNextFixture(career), null);
  assert.ok(career.fixtures.flat().every(fixture => fixture.played));
  assert.deepEqual(career.fixtures, uninterrupted.fixtures,
    'Save/load changed match outcomes compared with the uninterrupted control');
  assert.deepEqual(career.table, uninterrupted.table);
  assert.deepEqual(career.playerStatus, uninterrupted.playerStatus);
  const totals = career.table.reduce((all, row) => {
    all.wins += row.won;
    all.losses += row.lost;
    all.draws += row.drawn;
    all.for += row.goalsFor;
    all.against += row.goalsAgainst;
    return all;
  }, { wins: 0, losses: 0, draws: 0, for: 0, against: 0 });
  assert.equal(totals.wins, totals.losses);
  assert.equal(totals.draws % 2, 0);
  assert.equal(totals.for, totals.against);
  assert.equal(career.seasonHistory.length, 1);
  assert.equal(career.seasonOutcome.finalTable.length, 20);
  assert.equal(career.seasonOutcome.relegatedClubIds.length, 3);
  assert.equal(career.nextSeasonContext.defendingChampionClubId,
    career.seasonOutcome.championClubId);

  const completedAt = career.seasonHistory[0].completedAt;
  const repeated = finaliseSeason(career, { completedAt: '2099-01-01T00:00:00.000Z' });
  assert.equal(repeated.status, 'already-finalised');
  assert.equal(career.seasonHistory.length, 1);
  assert.equal(career.seasonHistory[0].completedAt, completedAt);
});
