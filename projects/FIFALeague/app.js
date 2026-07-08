// App State & Data Definitions

const OPENFOOTBALL_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

// Official 48 Teams, Groups & Flags
const TEAMS_DATA = {
  'Mexico': { group: 'A', flag: '🇲🇽' },
  'South Africa': { group: 'A', flag: '🇿🇦' },
  'South Korea': { group: 'A', flag: '🇰🇷' },
  'Czechia': { group: 'A', flag: '🇨🇿' },
  
  'Canada': { group: 'B', flag: '🇨🇦' },
  'Bosnia and Herzegovina': { group: 'B', flag: '🇧🇦' },
  'Qatar': { group: 'B', flag: '🇶🇦' },
  'Switzerland': { group: 'B', flag: '🇨🇭' },
  
  'Brazil': { group: 'C', flag: '🇧🇷' },
  'Haiti': { group: 'C', flag: '🇭🇹' },
  'Morocco': { group: 'C', flag: '🇲🇦' },
  'Scotland': { group: 'C', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  
  'United States': { group: 'D', flag: '🇺🇸' },
  'Paraguay': { group: 'D', flag: '🇵🇾' },
  'Australia': { group: 'D', flag: '🇦🇺' },
  'Türkiye': { group: 'D', flag: '🇹🇷' },
  
  'Germany': { group: 'E', flag: '🇩🇪' },
  'Curaçao': { group: 'E', flag: '🇨🇼' },
  "Côte d'Ivoire": { group: 'E', flag: '🇨🇮' },
  'Ecuador': { group: 'E', flag: '🇪🇨' },
  
  'Netherlands': { group: 'F', flag: '🇳🇱' },
  'Japan': { group: 'F', flag: '🇯🇵' },
  'Sweden': { group: 'F', flag: '🇸🇪' },
  'Tunisia': { group: 'F', flag: '🇹🇳' },
  
  'Belgium': { group: 'G', flag: '🇧🇪' },
  'Egypt': { group: 'G', flag: '🇪🇬' },
  'Iran': { group: 'G', flag: '🇮🇷' },
  'New Zealand': { group: 'G', flag: '🇳🇿' },
  
  'Spain': { group: 'H', flag: '🇪🇸' },
  'Cabo Verde': { group: 'H', flag: '🇨🇻' },
  'Saudi Arabia': { group: 'H', flag: '🇸🇦' },
  'Uruguay': { group: 'H', flag: '🇺🇾' },
  
  'France': { group: 'I', flag: '🇫🇷' },
  'Senegal': { group: 'I', flag: '🇸🇳' },
  'Iraq': { group: 'I', flag: '🇮🇶' },
  'Norway': { group: 'I', flag: '🇳🇴' },
  
  'Argentina': { group: 'J', flag: '🇦🇷' },
  'Algeria': { group: 'J', flag: '🇩🇿' },
  'Austria': { group: 'J', flag: '🇦🇹' },
  'Jordan': { group: 'J', flag: '🇯🇴' },
  
  'Portugal': { group: 'K', flag: '🇵🇹' },
  'DR Congo': { group: 'K', flag: '🇨🇩' },
  'Uzbekistan': { group: 'K', flag: '🇺🇿' },
  'Colombia': { group: 'K', flag: '🇨🇴' },
  
  'England': { group: 'L', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'Croatia': { group: 'L', flag: '🇭🇷' },
  'Ghana': { group: 'L', flag: '🇬🇭' },
  'Panama': { group: 'L', flag: '🇵🇦' }
};

// Mappings for FlagCDN 2-letter ISO codes
const TEAM_FLAG_CODES = {
  'Mexico': 'mx',
  'South Africa': 'za',
  'South Korea': 'kr',
  'Czechia': 'cz',
  'Canada': 'ca',
  'Bosnia and Herzegovina': 'ba',
  'Qatar': 'qa',
  'Switzerland': 'ch',
  'Brazil': 'br',
  'Haiti': 'ht',
  'Morocco': 'ma',
  'Scotland': 'gb-sct',
  'United States': 'us',
  'Paraguay': 'py',
  'Australia': 'au',
  'Türkiye': 'tr',
  'Germany': 'de',
  'Curaçao': 'cw',
  "Côte d'Ivoire": 'ci',
  'Ecuador': 'ec',
  'Netherlands': 'nl',
  'Japan': 'jp',
  'Sweden': 'se',
  'Tunisia': 'tn',
  'Belgium': 'be',
  'Egypt': 'eg',
  'Iran': 'ir',
  'New Zealand': 'nz',
  'Spain': 'es',
  'Cabo Verde': 'cv',
  'Saudi Arabia': 'sa',
  'Uruguay': 'uy',
  'France': 'fr',
  'Senegal': 'sn',
  'Iraq': 'iq',
  'Norway': 'no',
  'Argentina': 'ar',
  'Algeria': 'dz',
  'Austria': 'at',
  'Jordan': 'jo',
  'Portugal': 'pt',
  'DR Congo': 'cd',
  'Uzbekistan': 'uz',
  'Colombia': 'co',
  'England': 'gb-eng',
  'Croatia': 'hr',
  'Ghana': 'gh',
  'Panama': 'pa'
};


// Global Arrays for Matches & Computed Standings
let matches = [];
let standings = [];
let sortMode = 'rank'; // 'rank' or 'pure'
let currentFilter = 'all'; // 'all', 'qualified', 'third-place', 'eliminated', or Group letter 'A'-'L'
let searchQuery = '';
let topGoalscorers = [];
let groupsData = {};
let favoriteTeams = new Set();
let wildcardAssignments = {};

function loadFavorites() {
  try {
    const saved = localStorage.getItem('fifa_2026_favorites');
    if (saved) {
      favoriteTeams = new Set(JSON.parse(saved));
    }
  } catch (e) {
    console.error('Error loading favorites:', e);
  }
}

function saveFavorites() {
  try {
    localStorage.setItem('fifa_2026_favorites', JSON.stringify([...favoriteTeams]));
  } catch (e) {
    console.error('Error saving favorites:', e);
  }
}

// Normalizes name from APIs to match TEAMS_DATA keys
function normalizeTeamName(name) {
  if (!name) return '';
  const n = name.trim().toLowerCase();
  if (n === 'czech republic' || n === 'czechia') return 'Czechia';
  if (n.includes('congo dr') || n.includes('dr congo') || n.includes('democratic republic') || n.includes('congo') && n.includes('dem')) return 'DR Congo';
  if (n === 'ivory coast' || n.includes("côte d'ivoire") || n.includes("cote d'ivoire")) return "Côte d'Ivoire";
  if (n === 'usa' || n === 'united states' || n === 'united states of america') return 'United States';
  if (n === 'turkey' || n === 'türkiye') return 'Türkiye';
  if (n.includes('bosnia') && n.includes('herz')) return 'Bosnia and Herzegovina';
  if (n === 'cape verde' || n === 'cabo verde') return 'Cabo Verde';
  
  // Try exact key case-insensitive match
  for (let key in TEAMS_DATA) {
    if (key.toLowerCase() === n) return key;
  }
  
  // Format fallback: capitalize first letter of each word
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getMatchLocalDate(dateStr, timeStr) {
  if (!dateStr) return null;
  
  let hh = '00';
  let mm = '00';
  let offset = '+00:00';
  
  if (timeStr) {
    let cleanTimeStr = timeStr.trim();
    const timeMatch = cleanTimeStr.match(/^(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hh = timeMatch[1].padStart(2, '0');
      mm = timeMatch[2];
    }
    
    if (cleanTimeStr.includes('UTC')) {
      const offsetMatch = cleanTimeStr.match(/UTC([+-]\d+)/);
      if (offsetMatch) {
        const offsetVal = parseInt(offsetMatch[1]);
        const sign = offsetVal >= 0 ? '+' : '-';
        const absVal = Math.abs(offsetVal).toString().padStart(2, '0');
        offset = `${sign}${absVal}:00`;
      }
    }
  }
  
  const isoStr = `${dateStr}T${hh}:${mm}:00${offset}`;
  const d = new Date(isoStr);
  return isNaN(d.getTime()) ? null : d;
}

function isDirectQualificationGuaranteed(teamName, groupTeams, groupMatches) {
  const unplayed = groupMatches.filter(m => !m.score || !m.score.ft);
  if (unplayed.length === 0) {
    const team = groupTeams.find(t => t.name === teamName);
    return team && team.groupPos <= 2;
  }
  const teamsClone = groupTeams.map(t => ({ name: t.name, simPts: t.pts }));
  return simulateDirectQual(teamName, teamsClone, unplayed, 0);
}

function simulateDirectQual(teamName, teams, unplayed, matchIdx) {
  if (matchIdx === unplayed.length) {
    const targetTeam = teams.find(t => t.name === teamName);
    const targetPts = targetTeam.simPts;
    let countAhead = 0;
    teams.forEach(t => {
      if (t.name !== teamName && t.simPts >= targetPts) {
        countAhead++;
      }
    });
    return (countAhead + 1) <= 2;
  }
  const match = unplayed[matchIdx];
  const t1 = teams.find(t => t.name === match.team1);
  const t2 = teams.find(t => t.name === match.team2);
  
  if (!t1 || !t2) {
    return simulateDirectQual(teamName, teams, unplayed, matchIdx + 1);
  }
  
  const t1Pts = t1.simPts;
  const t2Pts = t2.simPts;

  // Win
  t1.simPts += 3;
  if (!simulateDirectQual(teamName, teams, unplayed, matchIdx + 1)) {
    t1.simPts = t1Pts;
    return false;
  }
  t1.simPts = t1Pts;

  // Draw
  t1.simPts += 1;
  t2.simPts += 1;
  if (!simulateDirectQual(teamName, teams, unplayed, matchIdx + 1)) {
    t1.simPts = t1Pts;
    t2.simPts = t2Pts;
    return false;
  }
  t1.simPts = t1Pts;
  t2.simPts = t2Pts;

  // Loss
  t2.simPts += 3;
  const res = simulateDirectQual(teamName, teams, unplayed, matchIdx + 1);
  t2.simPts = t2Pts;
  return res;
}

function isEliminationGuaranteed(teamName, groupTeams, groupMatches) {
  const unplayed = groupMatches.filter(m => !m.score || !m.score.ft);
  if (unplayed.length === 0) {
    const team = groupTeams.find(t => t.name === teamName);
    return team && team.groupPos === 4;
  }
  const teamsClone = groupTeams.map(t => ({ name: t.name, simPts: t.pts }));
  return simulateElimination(teamName, teamsClone, unplayed, 0);
}

function simulateElimination(teamName, teams, unplayed, matchIdx) {
  if (matchIdx === unplayed.length) {
    const targetTeam = teams.find(t => t.name === teamName);
    const targetPts = targetTeam.simPts;
    let countStrictlyAhead = 0;
    teams.forEach(t => {
      if (t.name !== teamName && t.simPts > targetPts) {
        countStrictlyAhead++;
      }
    });
    return (countStrictlyAhead + 1) === 4;
  }
  const match = unplayed[matchIdx];
  const t1 = teams.find(t => t.name === match.team1);
  const t2 = teams.find(t => t.name === match.team2);
  
  if (!t1 || !t2) {
    return simulateElimination(teamName, teams, unplayed, matchIdx + 1);
  }
  
  const t1Pts = t1.simPts;
  const t2Pts = t2.simPts;

  // Win
  t1.simPts += 3;
  if (!simulateElimination(teamName, teams, unplayed, matchIdx + 1)) {
    t1.simPts = t1Pts;
    return false;
  }
  t1.simPts = t1Pts;

  // Draw
  t1.simPts += 1;
  t2.simPts += 1;
  if (!simulateElimination(teamName, teams, unplayed, matchIdx + 1)) {
    t1.simPts = t1Pts;
    t2.simPts = t2Pts;
    return false;
  }
  t1.simPts = t1Pts;
  t2.simPts = t2Pts;

  // Loss
  t2.simPts += 3;
  const res = simulateElimination(teamName, teams, unplayed, matchIdx + 1);
  t2.simPts = t2Pts;
  return res;
}

function isWildcardQualificationGuaranteed(teamName, allGroups, allMatches) {
  let grpLetter = null;
  for (let g in allGroups) {
    if (allGroups[g].some(t => t.name === teamName)) {
      grpLetter = g;
      break;
    }
  }
  if (!grpLetter) return false;
  
  const groupTeams = allGroups[grpLetter];
  const groupMatches = allMatches.filter(m => {
    const names = groupTeams.map(t => t.name);
    return names.includes(m.team1) && names.includes(m.team2);
  });
  
  const unplayed = groupMatches.filter(m => !m.score || !m.score.ft);
  let worstPos = 1;
  let worstPts = 9;
  
  function backtrackGroup(matchIdx, simTeams) {
    if (matchIdx === unplayed.length) {
      const targetTeam = simTeams.find(t => t.name === teamName);
      const targetPts = targetTeam.simPts;
      let countAhead = 0;
      simTeams.forEach(t => {
        if (t.name !== teamName && t.simPts >= targetPts) {
          countAhead++;
        }
      });
      const pos = countAhead + 1;
      if (pos > worstPos) worstPos = pos;
      if (targetPts < worstPts) worstPts = targetPts;
      return;
    }
    const match = unplayed[matchIdx];
    const t1 = simTeams.find(t => t.name === match.team1);
    const t2 = simTeams.find(t => t.name === match.team2);
    if (!t1 || !t2) return backtrackGroup(matchIdx + 1, simTeams);
    
    const t1Pts = t1.simPts;
    const t2Pts = t2.simPts;
    
    // Win t1
    t1.simPts += 3;
    backtrackGroup(matchIdx + 1, simTeams);
    t1.simPts = t1Pts;
    
    // Draw
    t1.simPts += 1;
    t2.simPts += 1;
    backtrackGroup(matchIdx + 1, simTeams);
    t1.simPts = t1Pts;
    t2.simPts = t2Pts;
    
    // Win t2
    t2.simPts += 3;
    backtrackGroup(matchIdx + 1, simTeams);
    t2.simPts = t2Pts;
  }
  
  const initialTeams = groupTeams.map(t => ({ name: t.name, simPts: t.pts }));
  backtrackGroup(0, initialTeams);
  
  if (worstPos === 4) {
    return false;
  }
  
  if (worstPos <= 2) {
    return true;
  }
  
  const otherMaxThirdPts = [];
  
  for (let otherGrpLetter in allGroups) {
    if (otherGrpLetter === grpLetter) continue;
    
    const otherTeams = allGroups[otherGrpLetter];
    const otherMatches = allMatches.filter(m => {
      const names = otherTeams.map(t => t.name);
      return names.includes(m.team1) && names.includes(m.team2);
    });
    const otherUnplayed = otherMatches.filter(m => !m.score || !m.score.ft);
    
    let maxThirdPts = 0;
    
    function backtrackOther(matchIdx, simTeams) {
      if (matchIdx === otherUnplayed.length) {
        const standings = simTeams.map(t => ({ ...t })).sort((a, b) => b.simPts - a.simPts);
        const thirdTeam = standings[2];
        if (thirdTeam && thirdTeam.simPts > maxThirdPts) {
          maxThirdPts = thirdTeam.simPts;
        }
        return;
      }
      const match = otherUnplayed[matchIdx];
      const t1 = simTeams.find(t => t.name === match.team1);
      const t2 = simTeams.find(t => t.name === match.team2);
      if (!t1 || !t2) return backtrackOther(matchIdx + 1, simTeams);
      
      const t1Pts = t1.simPts;
      const t2Pts = t2.simPts;
      
      t1.simPts += 3;
      backtrackOther(matchIdx + 1, simTeams);
      t1.simPts = t1Pts;
      
      t1.simPts += 1;
      t2.simPts += 1;
      backtrackOther(matchIdx + 1, simTeams);
      t1.simPts = t1Pts;
      t2.simPts = t2Pts;
      
      t2.simPts += 3;
      backtrackOther(matchIdx + 1, simTeams);
      t2.simPts = t2Pts;
    }
    
    const otherInitialTeams = otherTeams.map(t => ({ name: t.name, simPts: t.pts }));
    backtrackOther(0, otherInitialTeams);
    otherMaxThirdPts.push(maxThirdPts);
  }
  
  otherMaxThirdPts.sort((a, b) => b - a);
  
  return worstPts > otherMaxThirdPts[7];
}

function calculateWildcardAssignments(thirdPlaceTeams) {
  const qualifiedThirdTeams = thirdPlaceTeams.slice(0, 8);
  const slots = [
    { id: '3A/B/C/D/F', groups: ['A', 'B', 'C', 'D', 'F'], opponentGroup: 'E' },
    { id: '3C/D/F/G/H', groups: ['C', 'D', 'F', 'G', 'H'], opponentGroup: 'I' },
    { id: '3C/E/F/H/I', groups: ['C', 'E', 'F', 'H', 'I'], opponentGroup: 'A' },
    { id: '3E/H/I/J/K', groups: ['E', 'H', 'I', 'J', 'K'], opponentGroup: 'L' },
    { id: '3B/E/F/I/J', groups: ['B', 'E', 'F', 'I', 'J'], opponentGroup: 'D' },
    { id: '3A/E/H/I/J', groups: ['A', 'E', 'H', 'I', 'J'], opponentGroup: 'G' },
    { id: '3E/F/G/I/J', groups: ['E', 'F', 'G', 'I', 'J'], opponentGroup: 'B' },
    { id: '3D/E/I/J/L', groups: ['D', 'E', 'I', 'J', 'L'], opponentGroup: 'K' }
  ];
  
  const assignment = {};
  const used = new Set();
  
  function backtrack(slotIdx) {
    if (slotIdx === slots.length) return true;
    const slot = slots[slotIdx];
    for (let i = 0; i < qualifiedThirdTeams.length; i++) {
      if (used.has(i)) continue;
      const team = qualifiedThirdTeams[i];
      if (slot.groups.includes(team.group) && team.group !== slot.opponentGroup) {
        assignment[slot.id] = team.name;
        used.add(i);
        if (backtrack(slotIdx + 1)) return true;
        used.delete(i);
        delete assignment[slot.id];
      }
    }
    return false;
  }
  
  if (backtrack(0)) {
    wildcardAssignments = assignment;
    return;
  }
  
  const fallbackAssignment = {};
  const fallbackUsed = new Set();
  slots.forEach(slot => {
    const matchTeam = qualifiedThirdTeams.find((team, idx) => {
      return !fallbackUsed.has(idx) && slot.groups.includes(team.group);
    });
    if (matchTeam) {
      fallbackAssignment[slot.id] = matchTeam.name;
      fallbackUsed.add(qualifiedThirdTeams.indexOf(matchTeam));
    } else {
      const anyTeam = qualifiedThirdTeams.find((team, idx) => !fallbackUsed.has(idx));
      if (anyTeam) {
        fallbackAssignment[slot.id] = anyTeam.name;
        fallbackUsed.add(qualifiedThirdTeams.indexOf(anyTeam));
      }
    }
  });
  wildcardAssignments = fallbackAssignment;
}

function getMatchWinnerAndLoser(match) {
  if (!match || !match.score) return null;
  const score = match.score;
  const t1 = resolveTeamName(match.team1);
  const t2 = resolveTeamName(match.team2);
  
  if (!t1 || !t2) return null;
  
  // 1. Penalties (shootout)
  if (score.p) {
    const [p1, p2] = score.p;
    if (p1 > p2) return { winner: t1, loser: t2 };
    if (p2 > p1) return { winner: t2, loser: t1 };
  }
  
  // 2. Extra Time
  if (score.et) {
    const [et1, et2] = score.et;
    if (et1 > et2) return { winner: t1, loser: t2 };
    if (et2 > et1) return { winner: t2, loser: t1 };
  }
  
  // 3. Full Time
  if (score.ft) {
    const [ft1, ft2] = score.ft;
    if (ft1 > ft2) return { winner: t1, loser: t2 };
    if (ft2 > ft1) return { winner: t2, loser: t1 };
  }
  
  return null;
}

function resolveTeamName(name) {
  if (!name) return '';
  if (name.startsWith('3')) {
    if (wildcardAssignments[name]) {
      return resolveTeamName(wildcardAssignments[name]);
    }
    return name;
  }
  const match = name.match(/^([12])([A-L])$/);
  if (match) {
    const pos = parseInt(match[1]);
    const grpLetter = match[2];
    const groupTeams = groupsData[grpLetter];
    if (groupTeams && groupTeams[pos - 1]) {
      return groupTeams[pos - 1].name;
    }
  }
  
  // Resolve winner / loser placeholders (e.g. W74, L101)
  const wlMatch = name.match(/^([WL])(\d+)$/);
  if (wlMatch) {
    const type = wlMatch[1]; // 'W' or 'L'
    const matchNum = parseInt(wlMatch[2]);
    const targetMatch = matches.find(m => m.matchNum === matchNum);
    
    if (targetMatch) {
      const outcome = getMatchWinnerAndLoser(targetMatch);
      if (outcome) {
        return type === 'W' ? outcome.winner : outcome.loser;
      }
    }
    return type === 'W' ? `Winner Match ${matchNum}` : `Loser Match ${matchNum}`;
  }
  
  return name;
}


function toggleFavorite(teamName) {
  if (favoriteTeams.has(teamName)) {
    favoriteTeams.delete(teamName);
  } else {
    favoriteTeams.add(teamName);
  }
  saveFavorites();
  renderStandings();
  renderMatches();
  renderKnockoutBracket();
}

function populateMatchdayDropdown() {
  const select = document.getElementById('selectMatchday');
  if (!select) return;
  
  // Extract all unique rounds in chronological order
  const uniqueRounds = [];
  matches.forEach(m => {
    if (m.round && !uniqueRounds.includes(m.round)) {
      uniqueRounds.push(m.round);
    }
  });
  
  // Find the current matchday/round (latest played match)
  let currentRound = uniqueRounds[0] || 'Matchday 1';
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    if (m.score && m.score.ft) {
      currentRound = m.round;
      break;
    }
  }
  
  const isInitialized = select.dataset.initialized === 'true';
  const currentValue = select.value;
  
  let html = `<option value="all">All Matchdays</option>`;
  uniqueRounds.forEach(round => {
    html += `<option value="${round}">${round}</option>`;
  });
  
  select.innerHTML = html;
  select.dataset.initialized = 'true';
  
  if (isInitialized && Array.from(select.options).some(opt => opt.value === currentValue)) {
    select.value = currentValue;
  } else {
    select.value = currentRound;
  }
}

// ----------------------------------------------------
// Data Fetching
// ----------------------------------------------------

async function fetchTournamentData(force = false) {
  const CACHE_KEY = 'fifa_2026_matches_data';
  const CACHE_TIME_KEY = 'fifa_2026_matches_cache_time';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in ms
  
  const now = Date.now();
  const cachedData = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
  
  if (!force && cachedData && cachedTime && (now - parseInt(cachedTime)) < CACHE_DURATION) {
    try {
      const data = JSON.parse(cachedData);
      updateApiStatus('success', 'Connected to Live Feed (Cached)');
      processOpenFootballData(data.matches);
      return;
    } catch (e) {
      console.warn('Error parsing cached data, fetching fresh data...', e);
    }
  }
  
  updateApiStatus('warning', 'Connecting to Live Feed...');
  
  try {
    const url = force ? `${OPENFOOTBALL_URL}?t=${now}` : OPENFOOTBALL_URL;
    const fetchOptions = force ? { cache: 'no-cache' } : {};
    
    const response = await fetch(url, fetchOptions);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    const data = await response.json();
    
    // Save to cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIME_KEY, now.toString());
    
    updateApiStatus('success', 'Connected to Live Feed');
    processOpenFootballData(data.matches);
  } catch (err) {
    console.error('All data sources failed:', err);
    
    // Fallback to expired cache if offline
    if (cachedData) {
      try {
        const data = JSON.parse(cachedData);
        updateApiStatus('warning', 'Offline - Using Stale Cached Data');
        processOpenFootballData(data.matches);
        return;
      } catch (e) {}
    }
    
    updateApiStatus('error', 'Data Source Offline');
    showErrorState();
  }
}

function updateApiStatus(type, text) {
  const statusEl = document.getElementById('apiStatus');
  const dot = statusEl.querySelector('.status-dot');
  const label = statusEl.querySelector('.status-text');
  
  dot.className = `status-dot ${type}`;
  label.textContent = text;
}

// ----------------------------------------------------
// Data Processing: OpenFootball (Matches -> Standings computed)
// ----------------------------------------------------
function processOpenFootballData(openMatches) {
  matches = openMatches.map((m, idx) => {
    const t1 = normalizeTeamName(m.team1);
    const t2 = normalizeTeamName(m.team2);
    return {
      matchNum: idx + 1,
      round: m.round,
      date: m.date,
      time: m.time,
      team1: t1,
      team2: t2,
      origTeam1: t1,
      origTeam2: t2,
      score: m.score ? { ft: m.score.ft, et: m.score.et, p: m.score.p } : null,
      group: m.group,
      ground: m.ground,
      goals1: m.goals1 || [],
      goals2: m.goals2 || []
    };
  });
  
  // Sort matches chronologically before timezone conversion or rendering
  matches.sort((a, b) => {
    const dateA = getMatchLocalDate(a.date, a.time) || new Date(a.date + 'T00:00:00');
    const dateB = getMatchLocalDate(b.date, b.time) || new Date(b.date + 'T00:00:00');
    return dateA - dateB;
  });
  
  // Assign chronological index to each match
  matches.forEach((m, idx) => {
    m.index = idx;
  });
  
  // Correct knockout stage placeholders to establish correct bracket pairings
  if (matches.length >= 104) {
    const getMatch = (num) => matches.find(m => m.matchNum === num);
    
    // Round of 16
    const m89 = getMatch(89); if (m89) { m89.team1 = 'W74'; m89.team2 = 'W77'; } // Match 89: W74 vs W77
    const m90 = getMatch(90); if (m90) { m90.team1 = 'W73'; m90.team2 = 'W75'; } // Match 90: W73 vs W75
    const m91 = getMatch(91); if (m91) { m91.team1 = 'W76'; m91.team2 = 'W78'; } // Match 91: W76 vs W78
    const m92 = getMatch(92); if (m92) { m92.team1 = 'W79'; m92.team2 = 'W80'; } // Match 92: W79 vs W80
    const m93 = getMatch(93); if (m93) { m93.team1 = 'W83'; m93.team2 = 'W84'; } // Match 93: W83 vs W84
    const m94 = getMatch(94); if (m94) { m94.team1 = 'W81'; m94.team2 = 'W82'; } // Match 94: W81 vs W82
    const m95 = getMatch(95); if (m95) { m95.team1 = 'W86'; m95.team2 = 'W88'; } // Match 95: W86 vs W88
    const m96 = getMatch(96); if (m96) { m96.team1 = 'W85'; m96.team2 = 'W87'; } // Match 96: W85 vs W87
    
    // Quarter-finals
    const m97 = getMatch(97); if (m97) { m97.team1 = 'W89'; m97.team2 = 'W90'; } // Match 97: W89 vs W90
    const m98 = getMatch(98); if (m98) { m98.team1 = 'W93'; m98.team2 = 'W94'; } // Match 98: W93 vs W94
    const m99 = getMatch(99); if (m99) { m99.team1 = 'W91'; m99.team2 = 'W92'; } // Match 99: W91 vs W92
    const m100 = getMatch(100); if (m100) { m100.team1 = 'W95'; m100.team2 = 'W96'; } // Match 100: W95 vs W96
    
    // Semi-finals
    const m101 = getMatch(101); if (m101) { m101.team1 = 'W97'; m101.team2 = 'W98'; } // Match 101: W97 vs W98
    const m102 = getMatch(102); if (m102) { m102.team1 = 'W99'; m102.team2 = 'W100'; } // Match 102: W99 vs W100
    
    // Finals
    const m103 = getMatch(103); if (m103) { m103.team1 = 'L101'; m103.team2 = 'L102'; } // Match 103: L101 vs L102 (Third place)
    const m104 = getMatch(104); if (m104) { m104.team1 = 'W101'; m104.team2 = 'W102'; } // Match 104: W101 vs W102 (Final)
  }
  
  calculateStandingsFromMatches();
}

function calculateStandingsFromMatches() {
  const teamStats = {};
  for (let team in TEAMS_DATA) {
    teamStats[team] = createEmptyStatObject(team);
  }
  
  const playerGoalsMap = {};
  
  // Accumulate standings based on match scores
  matches.forEach(match => {
    const t1 = match.origTeam1 || match.team1;
    const t2 = match.origTeam2 || match.team2;
    
    if (!teamStats[t1] || !teamStats[t2]) return; // Skip if unrecognized teams
    if (!match.score || !match.score.ft) return; // Skip unplayed matches
    
    const [score1, score2] = match.score.ft;
    const isGroupMatch = match.round && match.round.toLowerCase().startsWith('matchday');
    
    if (isGroupMatch) {
      teamStats[t1].mp += 1;
      teamStats[t2].mp += 1;
      teamStats[t1].gf += score1;
      teamStats[t2].gf += score2;
      teamStats[t1].ga += score2;
      teamStats[t2].ga += score1;
      
      if (score1 > score2) {
        teamStats[t1].w += 1;
        teamStats[t2].l += 1;
        teamStats[t1].pts += 3;
      } else if (score1 < score2) {
        teamStats[t2].w += 1;
        teamStats[t1].l += 1;
        teamStats[t2].pts += 3;
      } else {
        teamStats[t1].d += 1;
        teamStats[t2].d += 1;
        teamStats[t1].pts += 1;
        teamStats[t2].pts += 1;
      }
      
      teamStats[t1].gd = teamStats[t1].gf - teamStats[t1].ga;
      teamStats[t2].gd = teamStats[t2].gf - teamStats[t2].ga;
    }
    
    // Accumulate player goals (real data from JSON goals list)
    if (match.goals1) {
      match.goals1.forEach(g => {
        if (g.owngoal) return; // Skip own goals for top scorers
        const scorerName = g.name;
        if (!playerGoalsMap[scorerName]) {
          playerGoalsMap[scorerName] = { name: scorerName, team: t1, goals: 0 };
        }
        playerGoalsMap[scorerName].goals += 1;
      });
    }
    if (match.goals2) {
      match.goals2.forEach(g => {
        if (g.owngoal) return; // Skip own goals for top scorers
        const scorerName = g.name;
        if (!playerGoalsMap[scorerName]) {
          playerGoalsMap[scorerName] = { name: scorerName, team: t2, goals: 0 };
        }
        playerGoalsMap[scorerName].goals += 1;
      });
    }
  });
  
  // Sort and assign to global topGoalscorers
  topGoalscorers = Object.values(playerGoalsMap).sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
  
  computeStandingsFromStats(teamStats);
  populateMatchdayDropdown();
  renderMatches();
  renderStats();
}

function createEmptyStatObject(name) {
  const flagUrl = TEAM_FLAG_CODES[name] ? `https://flagcdn.com/w40/${TEAM_FLAG_CODES[name]}.png` : 'https://flagcdn.com/w40/un.png';
  return {
    name: name,
    group: TEAMS_DATA[name].group,
    flag: flagUrl,
    mp: 0,
    w: 0,
    d: 0,
    l: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    pts: 0,
    groupPos: 0,
    status: 'in-progress' // 'qualified-direct', 'qualified-wildcard', 'eliminated', 'in-progress'
  };
}

// ----------------------------------------------------
// Standings Solver & Rule Engine
// ----------------------------------------------------
function computeStandingsFromStats(teamStats) {
  const allTeams = Object.values(teamStats);
  
  // 1. Group Standings Calculation
  const groups = {};
  allTeams.forEach(team => {
    if (!groups[team.group]) groups[team.group] = [];
    groups[team.group].push(team);
  });
  
  // Sort teams within each group (A-L)
  for (let grpLetter in groups) {
    groups[grpLetter].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      if (b.w !== a.w) return b.w - a.w;
      return a.name.localeCompare(b.name); // Alphabetic fallback
    });
    
    // Assign position 1st, 2nd, 3rd, 4th
    groups[grpLetter].forEach((team, idx) => {
      team.groupPos = idx + 1;
    });
  }
  
  // Store groups globally for placeholder resolution
  groupsData = groups;
  
  // 2. Identify Direct Qualifiers and Candidates
  const firstPlaceTeams = [];
  const secondPlaceTeams = [];
  const thirdPlaceTeams = [];
  const fourthPlaceTeams = [];
  
  // Check if ALL groups in the tournament are completed
  const allGroupsFinished = allTeams.every(team => team.mp === 3);

  allTeams.forEach(team => {
    // Check if THIS team's group is finished (all 4 teams played 3 matches)
    const grpLetter = team.group;
    const groupFinished = groups[grpLetter].every(t => t.mp === 3);
    
    // Default status is in-progress
    team.status = 'in-progress';
    
    if (groupFinished) {
      if (team.groupPos === 1 || team.groupPos === 2) {
        team.status = 'qualified-direct';
      } else if (team.groupPos === 4) {
        team.status = 'eliminated';
      }
    } else {
      // Group in progress: check mathematical guarantees
      const groupMatches = matches.filter(m => {
        const grpTeams = groups[grpLetter].map(t => t.name);
        return grpTeams.includes(m.team1) && grpTeams.includes(m.team2);
      });
      if (isDirectQualificationGuaranteed(team.name, groups[grpLetter], groupMatches)) {
        team.status = 'qualified-direct';
      } else if (isEliminationGuaranteed(team.name, groups[grpLetter], groupMatches)) {
        team.status = 'eliminated';
      } else if (isWildcardQualificationGuaranteed(team.name, groups, matches)) {
        team.status = 'qualified-wildcard';
      }
    }
    
    // Sort into lists for final ranking output
    if (team.groupPos === 1) firstPlaceTeams.push(team);
    else if (team.groupPos === 2) secondPlaceTeams.push(team);
    else if (team.groupPos === 3) thirdPlaceTeams.push(team);
    else if (team.groupPos === 4) fourthPlaceTeams.push(team);
  });
  
  // 3. Rank Third-Place Teams against each other
  thirdPlaceTeams.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    if (b.w !== a.w) return b.w - a.w;
    return a.group.localeCompare(b.group); // Group letter fallback
  });
  
  // Calculate wildcard assignments based on current standings
  calculateWildcardAssignments(thirdPlaceTeams);
  
  // Only allocate wildcard qualifiers if all groups have completed playing!
  thirdPlaceTeams.forEach((team, idx) => {
    const grpLetter = team.group;
    const groupFinished = groups[grpLetter].every(t => t.mp === 3);
    
    if (groupFinished) {
      if (allGroupsFinished) {
        if (idx < 8) {
          team.status = 'qualified-wildcard';
        } else {
          team.status = 'eliminated';
        }
      }
    }
  });
  
  // 3.5. Update statuses for teams knocked out in knockout stages
  matches.forEach(match => {
    const isKnockout = match.round && !match.round.toLowerCase().includes('matchday');
    if (!isKnockout) return;
    
    const outcome = getMatchWinnerAndLoser(match);
    if (outcome && outcome.loser) {
      const loserTeam = teamStats[outcome.loser];
      if (loserTeam) {
        loserTeam.status = 'eliminated';
      }
    }
  });
  
  // 4. Assemble Unified Standings array based on selected view
  // Sort First, Second, Third, and Fourth place groups internally to create the leaderboard
  firstPlaceTeams.sort(sortCompareGlobal);
  secondPlaceTeams.sort(sortCompareGlobal);
  thirdPlaceTeams.sort(sortCompareGlobal);
  fourthPlaceTeams.sort(sortCompareGlobal);
  
  standings = {
    // Tournament Rank displays structured tiers
    rank: [...firstPlaceTeams, ...secondPlaceTeams, ...thirdPlaceTeams, ...fourthPlaceTeams],
    // Pure Global displays strict points ranking
    pure: [...allTeams].sort(sortCompareGlobal)
  };
  
  renderStandings();
  renderNormalView();
  renderKnockoutBracket();
  renderTournamentStats(thirdPlaceTeams, allTeams);
}

// Strict global sort helper
function sortCompareGlobal(a, b) {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  if (b.w !== a.w) return b.w - a.w;
  return a.name.localeCompare(b.name);
}

// ----------------------------------------------------
// UI Render Engine
// ----------------------------------------------------

function renderStandings() {
  const tbody = document.getElementById('standingsBody');
  tbody.innerHTML = '';
  
  const currentList = standings[sortMode] || [];
  
  // Apply Search Query & Filter badges
  const filteredList = currentList.filter(team => {
    // Check Search
    if (searchQuery && !team.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Check Filter Category
    if (currentFilter === 'all') return true;
    if (currentFilter === 'qualified') return team.status === 'qualified-direct' || team.status === 'qualified-wildcard';
    if (currentFilter === 'third-place') return team.groupPos === 3;
    if (currentFilter === 'eliminated') return team.status === 'eliminated';
    
    // Check Group letter A-L
    return team.group === currentFilter;
  });
  
  if (filteredList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align: center; padding: 30px; color: var(--text-muted);">No teams match the search/filter criteria.</td></tr>`;
    return;
  }
  
  filteredList.forEach((team, idx) => {
    // Create class name for highlighting
    let rowClass = '';
    let statusText = 'In Progress';
    let statusBadgeClass = 'in-progress';
    
    if (team.status === 'qualified-direct') {
      rowClass = 'row-q-direct';
      statusText = 'Qualified (Top 2)';
      statusBadgeClass = 'q-direct';
    } else if (team.status === 'qualified-wildcard') {
      rowClass = 'row-q-wildcard';
      statusText = 'Qualified (WC)';
      statusBadgeClass = 'q-wildcard';
    } else if (team.status === 'eliminated') {
      rowClass = 'row-eliminated';
      statusText = 'Eliminated';
      statusBadgeClass = 'eliminated';
    } else {
      // Status is in-progress
      if (team.groupPos === 1) {
        statusText = '1st in Group';
        statusBadgeClass = 'q-direct';
      } else if (team.groupPos === 2) {
        statusText = '2nd in Group';
        statusBadgeClass = 'q-direct';
      } else if (team.groupPos === 3) {
        statusText = '3rd (Pending)';
        statusBadgeClass = 'q-wildcard';
      } else {
        statusText = '4th in Group';
        statusBadgeClass = 'eliminated';
      }
    }
    
    // Resolve overall rank index in the displayed list
    const rankIndex = sortMode === 'pure' ? (standings.pure.indexOf(team) + 1) : (idx + 1);
    
    const tr = document.createElement('tr');
    tr.className = rowClass;
    tr.innerHTML = `
      <td class="col-rank">${rankIndex}</td>
      <td class="col-team">
        <div class="team-badge-cell">
          <button class="btn-fav-star ${favoriteTeams.has(team.name) ? 'active' : ''}" data-team="${team.name}" title="Favorite this team">
            ${favoriteTeams.has(team.name) ? '★' : '☆'}
          </button>
          <img class="team-flag" src="${team.flag}" alt="${team.name} flag" width="24" height="16">
          <span class="team-name">${team.name.replace('Bosnia and Herzegovina', 'Bosnia &<br>Herzegovina')}</span>
        </div>
      </td>
      <td class="col-group">${team.group}</td>
      <td class="col-num">${team.mp}</td>
      <td class="col-num">${team.w}</td>
      <td class="col-num">${team.d}</td>
      <td class="col-num">${team.l}</td>
      <td class="col-num">${team.gf}</td>
      <td class="col-num">${team.ga}</td>
      <td class="col-num">${team.gd > 0 ? '+' + team.gd : team.gd}</td>
      <td class="col-pts">${team.pts}</td>
      <td class="col-status"><span class="status-badge ${statusBadgeClass}">${statusText}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function createMatchCard(m, isPinned) {
  const displayTeam1 = resolveTeamName(m.team1);
  const displayTeam2 = resolveTeamName(m.team2);
  
  const flag1Url = TEAM_FLAG_CODES[displayTeam1] ? `https://flagcdn.com/w40/${TEAM_FLAG_CODES[displayTeam1]}.png` : 'https://flagcdn.com/w40/un.png';
  const flag2Url = TEAM_FLAG_CODES[displayTeam2] ? `https://flagcdn.com/w40/${TEAM_FLAG_CODES[displayTeam2]}.png` : 'https://flagcdn.com/w40/un.png';
  
  const isFav1 = favoriteTeams.has(displayTeam1);
  const isFav2 = favoriteTeams.has(displayTeam2);
  const isMatchFav = isFav1 || isFav2;
  
  const card = document.createElement('div');
  if (isPinned) {
    card.className = `match-card fav-highlight pinned-fav-card`;
    card.setAttribute('data-target-id', `match-card-regular-${m.index}`);
    card.setAttribute('title', 'Click to scroll to chronological match');
  } else {
    card.className = `match-card ${isMatchFav ? 'fav-highlight' : ''}`;
    card.id = `match-card-regular-${m.index}`;
  }
  
  let scoreSection = `<span class="match-vs">vs</span>`;
  let winner1 = '';
  let winner2 = '';
  
  if (m.score && m.score.ft) {
    const [s1, s2] = m.score.ft;
    if (s1 > s2) winner1 = 'winner';
    if (s2 > s1) winner2 = 'winner';
    
    scoreSection = `
      <span class="match-score-num ${winner1}">${s1}</span>
      <span class="match-vs">-</span>
      <span class="match-score-num ${winner2}">${s2}</span>
    `;
  }
  
  const localTimeStr = m.time ? (getMatchLocalDate(m.date, m.time) ? getMatchLocalDate(m.date, m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Local' : m.time) : '';
  
  const star1 = isFav1 ? '<span class="fav-star-inline">★</span>' : '';
  const star2 = isFav2 ? '<span class="fav-star-inline">★</span>' : '';
  
  const isKnockout = m.round && !m.round.toLowerCase().includes('matchday');
  const groupTag = isKnockout ? m.round : (m.group || 'Group Stage');

  card.innerHTML = `
    <div class="match-meta">
      <span class="match-group-tag">${groupTag}</span>
      <span class="match-time">${localTimeStr}</span>
    </div>
    <div class="match-score-row">
      <div class="match-team team-left">
        <span class="team-name">${displayTeam1}${star1}</span>
        <img class="team-flag match-team-flag" src="${flag1Url}" alt="${displayTeam1} flag" width="20" height="13">
      </div>
      <div class="match-score-area">
        ${scoreSection}
      </div>
      <div class="match-team team-right">
        <img class="team-flag match-team-flag" src="${flag2Url}" alt="${displayTeam2} flag" width="20" height="13">
        <span class="team-name">${star2}${displayTeam2}</span>
      </div>
    </div>
    <div class="match-venue">${m.ground || 'Host Venue'}</div>
  `;
  return card;
}

function renderMatches() {
  const matchesList = document.getElementById('matchesList');
  const selectedMatchday = document.getElementById('selectMatchday').value;
  
  matchesList.innerHTML = '';
  
  // Filter matches based on selected matchday
  const filteredMatches = matches.filter(m => {
    if (selectedMatchday === 'all') return true;
    return m.round === selectedMatchday;
  });
  
  if (filteredMatches.length === 0) {
    matchesList.innerHTML = `<div class="matches-loading" style="color: var(--text-muted);">No matches scheduled or played for this selection.</div>`;
    return;
  }
  
  // 1. Pinned Favorites section
  if (favoriteTeams.size > 0) {
    const favMatches = filteredMatches.filter(m => {
      const displayT1 = resolveTeamName(m.team1);
      const displayT2 = resolveTeamName(m.team2);
      return favoriteTeams.has(displayT1) || favoriteTeams.has(displayT2);
    });
    
    if (favMatches.length > 0) {
      const headerDiv = document.createElement('div');
      headerDiv.className = 'matchday-group-header fav-matches-header';
      headerDiv.innerHTML = `⭐ Favorite Team Matches`;
      matchesList.appendChild(headerDiv);
      
      favMatches.forEach(m => {
        const card = createMatchCard(m, true);
        matchesList.appendChild(card);
      });
      
      const divider = document.createElement('div');
      divider.className = 'match-list-divider';
      matchesList.appendChild(divider);
    }
  }
  
  // 2. Regular list
  let currentGroupHeader = '';
  
  filteredMatches.forEach(m => {
    const localDate = getMatchLocalDate(m.date, m.time) || new Date(m.date + 'T00:00:00');
    const formattedDate = localDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const headerText = `${m.round} - ${formattedDate}`;
    
    if (headerText !== currentGroupHeader) {
      currentGroupHeader = headerText;
      const headerDiv = document.createElement('div');
      headerDiv.className = 'matchday-group-header';
      headerDiv.textContent = headerText;
      matchesList.appendChild(headerDiv);
    }
    
    const card = createMatchCard(m, false);
    matchesList.appendChild(card);
  });
}

function renderStats() {
  let played = 0;
  let goals = 0;
  let remainingCount = 48;
  
  matches.forEach(m => {
    if (m.score && m.score.ft) {
      played++;
      goals += m.score.ft[0] + m.score.ft[1];
    }
  });
  
  if (standings.pure) {
    let eliminatedCount = 0;
    standings.pure.forEach(team => {
      if (team.status === 'eliminated') {
        eliminatedCount++;
      }
    });
    remainingCount = 48 - eliminatedCount;
  }
  
  document.getElementById('statMatches').textContent = played;
  document.getElementById('statGoals').textContent = goals;
  document.getElementById('statAvgGoals').textContent = played > 0 ? (goals / played).toFixed(2) : '0.00';
  document.getElementById('statQualified').textContent = `${remainingCount} / 48`;
}

function showErrorState() {
  const tbody = document.getElementById('standingsBody');
  tbody.innerHTML = `<tr><td colspan="12" class="table-loading" style="color: var(--eliminated);">Offline: Could not fetch standings. Please check connection.</td></tr>`;
  
  const matchesList = document.getElementById('matchesList');
  matchesList.innerHTML = `<div class="matches-loading" style="color: var(--eliminated);">Offline: Could not load fixtures.</div>`;
}

function createBracketMatchCard(m) {
  const displayTeam1 = resolveTeamName(m.team1);
  const displayTeam2 = resolveTeamName(m.team2);
  
  const flag1Url = TEAM_FLAG_CODES[displayTeam1] ? `https://flagcdn.com/w40/${TEAM_FLAG_CODES[displayTeam1]}.png` : 'https://flagcdn.com/w40/un.png';
  const flag2Url = TEAM_FLAG_CODES[displayTeam2] ? `https://flagcdn.com/w40/${TEAM_FLAG_CODES[displayTeam2]}.png` : 'https://flagcdn.com/w40/un.png';
  
  const isFav1 = favoriteTeams.has(displayTeam1);
  const isFav2 = favoriteTeams.has(displayTeam2);
  const isMatchFav = isFav1 || isFav2;
  
  const star1 = isFav1 ? '<span class="fav-star-inline">★</span>' : '';
  const star2 = isFav2 ? '<span class="fav-star-inline">★</span>' : '';
  
  let score1 = '';
  let score2 = '';
  let winnerClass1 = '';
  let winnerClass2 = '';
  
  if (m.score) {
    if (m.score.p) {
      score1 = `${m.score.ft[0]} (${m.score.p[0]})`;
      score2 = `${m.score.ft[1]} (${m.score.p[1]})`;
    } else if (m.score.et) {
      score1 = `${m.score.et[0]} (aet)`;
      score2 = `${m.score.et[1]} (aet)`;
    } else if (m.score.ft) {
      score1 = m.score.ft[0];
      score2 = m.score.ft[1];
    }
    
    const outcome = getMatchWinnerAndLoser(m);
    if (outcome) {
      if (outcome.winner === displayTeam1) winnerClass1 = 'winner';
      if (outcome.winner === displayTeam2) winnerClass2 = 'winner';
    }
  }
  
  const matchNum = m.matchNum;
  const localTimeStr = m.time ? (getMatchLocalDate(m.date, m.time) ? getMatchLocalDate(m.date, m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Local' : m.time) : '';
  const formattedDate = m.date ? new Date(m.date + 'T00:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
  
  const card = document.createElement('div');
  card.className = `bracket-match-card ${isMatchFav ? 'fav-highlight' : ''}`;
  
  card.innerHTML = `
    <div class="bracket-match-meta">
      <span>Match ${matchNum}</span>
      <span>${formattedDate} ${localTimeStr}</span>
    </div>
    <div class="bracket-team-row ${winnerClass1}">
      <div class="bracket-team-info">
        <img class="bracket-team-flag" src="${flag1Url}" alt="${displayTeam1} flag" width="18" height="12">
        <span class="bracket-team-name">${displayTeam1}${star1}</span>
      </div>
      <span class="bracket-team-score">${score1}</span>
    </div>
    <div class="bracket-team-row ${winnerClass2}">
      <div class="bracket-team-info">
        <img class="bracket-team-flag" src="${flag2Url}" alt="${displayTeam2} flag" width="18" height="12">
        <span class="bracket-team-name">${displayTeam2}${star2}</span>
      </div>
      <span class="bracket-team-score">${score2}</span>
    </div>
    <div class="bracket-match-venue" title="${m.ground || ''}">${m.ground || 'Host Venue'}</div>
  `;
  return card;
}

function renderKnockoutBracket() {
  const container = document.getElementById('knockoutsViewLayout');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Define explicit 1-indexed match number order for each column to match bracket flow
  const r32Order = [73, 76, 74, 77, 83, 84, 81, 82, 75, 78, 79, 80, 86, 88, 85, 87];
  const r16Order = [89, 90, 93, 94, 91, 92, 95, 96];
  const qfOrder = [97, 98, 99, 100];
  const sfOrder = [101, 102];
  const finalsOrder = [104, 103]; // Final (104) first, then Third-place (103)
  
  const roundGroups = [
    { title: 'Round of 32', order: r32Order },
    { title: 'Round of 16', order: r16Order },
    { title: 'Quarter-finals', order: qfOrder },
    { title: 'Semi-finals', order: sfOrder },
    { title: 'Finals', order: finalsOrder }
  ];
  
  roundGroups.forEach(grp => {
    const roundCol = document.createElement('div');
    roundCol.className = 'bracket-round';
    
    const roundTitle = document.createElement('div');
    roundTitle.className = 'bracket-round-title';
    roundTitle.textContent = grp.title;
    roundCol.appendChild(roundTitle);
    
    const matchList = document.createElement('div');
    matchList.className = 'bracket-match-list';
    
    grp.order.forEach(matchNum => {
      // Find the match in the global matches array by matchNum
      const m = matches.find(match => match.matchNum === matchNum);
      if (m) {
        const matchCard = createBracketMatchCard(m);
        matchList.appendChild(matchCard);
      }
    });
    
    roundCol.appendChild(matchList);
    container.appendChild(roundCol);
  });
}

function renderNormalView() {
  const container = document.getElementById('groupsGridContainer');
  container.innerHTML = '';
  
  const groups = {};
  standings.rank.forEach(team => {
    if (!groups[team.group]) groups[team.group] = [];
    groups[team.group].push(team);
  });
  
  const alphabet = 'ABCDEFGHIJKL'.split('');
  alphabet.forEach(letter => {
    const groupTeams = groups[letter] || [];
    groupTeams.sort((a, b) => a.groupPos - b.groupPos);
    
    const card = document.createElement('div');
    card.className = 'group-card';
    
    let tableRows = '';
    groupTeams.forEach(team => {
      let rowClass = '';
      if (team.status === 'qualified-direct') rowClass = 'mini-q-direct';
      else if (team.status === 'qualified-wildcard') rowClass = 'mini-q-wildcard';
      else if (team.status === 'eliminated') rowClass = 'mini-eliminated';
      
      tableRows += `
        <tr class="${rowClass}">
          <td class="mini-col-rank">${team.groupPos}</td>
          <td class="mini-col-team">
            <img class="team-flag" src="${team.flag}" alt="${team.name} flag" width="18" height="12">
            <span class="team-name">${team.name.replace('Bosnia and Herzegovina', 'Bosnia &<br>Herzegovina')}</span>
          </td>
          <td class="mini-col-num">${team.mp}</td>
          <td class="mini-col-num">${team.gd > 0 ? '+' + team.gd : team.gd}</td>
          <td class="mini-col-pts">${team.pts}</td>
        </tr>
      `;
    });
    
    card.innerHTML = `
      <div class="group-card-header">Group ${letter}</div>
      <table class="mini-standings-table">
        <thead>
          <tr>
            <th class="mini-col-rank">#</th>
            <th class="mini-col-team">Team</th>
            <th class="mini-col-num">MP</th>
            <th class="mini-col-num">GD</th>
            <th class="mini-col-pts">PTS</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
    container.appendChild(card);
  });
}

function renderTournamentStats(thirdPlaceTeams, allTeams) {
  const sidebar = document.getElementById('tournamentStatsSidebar');
  if (!sidebar) return;
  
  // 1. Render Wildcard Tracker (3rd Place Standings)
  let wildcardRows = '';
  thirdPlaceTeams.forEach((team, idx) => {
    let rowClass = '';
    
    if (team.status === 'qualified-wildcard') {
      rowClass = 'row-q-wildcard';
    } else if (team.status === 'eliminated') {
      rowClass = 'row-eliminated';
    } else {
      if (idx < 8) {
        rowClass = 'row-q-wildcard';
      }
    }
    
    wildcardRows += `
      <tr class="${rowClass}">
        <td>${idx + 1}</td>
        <td>
          <div class="team-badge-cell">
            <img class="team-flag" src="${team.flag}" alt="${team.name} flag" width="18" height="12">
            <span>${team.name}</span>
          </div>
        </td>
        <td style="text-align: center;">${team.group}</td>
        <td style="text-align: center;">${team.gd > 0 ? '+' + team.gd : team.gd}</td>
        <td style="text-align: center; font-weight: 700;">${team.pts}</td>
      </tr>
    `;
  });
  
  const wildcardSection = `
    <div class="stats-section-card">
      <div class="stats-section-title">Wildcard Tracker (3rd Place)</div>
      <table class="sidebar-table">
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th>Team</th>
            <th style="text-align: center; width: 40px;">Grp</th>
            <th style="text-align: center; width: 40px;">GD</th>
            <th style="text-align: center; width: 40px;">PTS</th>
          </tr>
        </thead>
        <tbody>
          ${wildcardRows}
        </tbody>
      </table>
    </div>
  `;
  
  // 2. Render Tournament Leaders (Top/Worst Attack and Top/Worst Defense)
  const topAttacks = [...allTeams]
    .sort((a, b) => b.gf - a.gf || a.name.localeCompare(b.name))
    .slice(0, 3);
    
  const worstAttacks = [...allTeams]
    .filter(t => t.mp > 0)
    .sort((a, b) => a.gf - b.gf || b.mp - a.mp || a.name.localeCompare(b.name))
    .slice(0, 3);
    
  const bestDefenses = [...allTeams]
    .filter(t => t.mp > 0)
    .sort((a, b) => a.ga - b.ga || b.mp - a.mp || a.name.localeCompare(b.name))
    .slice(0, 3);
    
  const worstDefenses = [...allTeams]
    .filter(t => t.mp > 0)
    .sort((a, b) => b.ga - a.ga || a.mp - b.mp || a.name.localeCompare(b.name))
    .slice(0, 3);
    
  let attackHTML = '';
  topAttacks.forEach((team, idx) => {
    const icon = idx === 0 ? '🏆' : idx === 1 ? '🥈' : '🥉';
    attackHTML += `
      <div class="leader-team-item">
        <div class="leader-team-info">
          <span>${icon}</span>
          <img class="team-flag" src="${team.flag}" alt="${team.name} flag" width="18" height="12">
          <span>${team.name}</span>
        </div>
        <span class="leader-value">${team.gf} GF</span>
      </div>
    `;
  });
  if (topAttacks.length === 0) {
    attackHTML = `<div style="font-size: 0.8rem; color: var(--text-muted);">No goals scored yet.</div>`;
  }
  
  let worstAttackHTML = '';
  worstAttacks.forEach((team, idx) => {
    const icon = idx === 0 ? '⚠️' : idx === 1 ? '🔸' : '🔹';
    worstAttackHTML += `
      <div class="leader-team-item">
        <div class="leader-team-info">
          <span>${icon}</span>
          <img class="team-flag" src="${team.flag}" alt="${team.name} flag" width="18" height="12">
          <span>${team.name}</span>
        </div>
        <span class="leader-value" style="color: var(--eliminated);">${team.gf} GF (${team.mp} MP)</span>
      </div>
    `;
  });
  if (worstAttacks.length === 0) {
    worstAttackHTML = `<div style="font-size: 0.8rem; color: var(--text-muted);">No matches played yet.</div>`;
  }
  
  let defenseHTML = '';
  bestDefenses.forEach((team, idx) => {
    const icon = idx === 0 ? '🏆' : idx === 1 ? '🥈' : '🥉';
    defenseHTML += `
      <div class="leader-team-item">
        <div class="leader-team-info">
          <span>${icon}</span>
          <img class="team-flag" src="${team.flag}" alt="${team.name} flag" width="18" height="12">
          <span>${team.name}</span>
        </div>
        <span class="leader-value">${team.ga} GA (${team.mp} MP)</span>
      </div>
    `;
  });
  if (bestDefenses.length === 0) {
    defenseHTML = `<div style="font-size: 0.8rem; color: var(--text-muted);">No matches played yet.</div>`;
  }
  
  let worstDefenseHTML = '';
  worstDefenses.forEach((team, idx) => {
    const icon = idx === 0 ? '⚠️' : idx === 1 ? '🔸' : '🔹';
    worstDefenseHTML += `
      <div class="leader-team-item">
        <div class="leader-team-info">
          <span>${icon}</span>
          <img class="team-flag" src="${team.flag}" alt="${team.name} flag" width="18" height="12">
          <span>${team.name}</span>
        </div>
        <span class="leader-value" style="color: var(--eliminated);">${team.ga} GA (${team.mp} MP)</span>
      </div>
    `;
  });
  if (worstDefenses.length === 0) {
    worstDefenseHTML = `<div style="font-size: 0.8rem; color: var(--text-muted);">No matches played yet.</div>`;
  }
  
  const leadersSection = `
    <div class="stats-section-card">
      <div class="stats-section-title">Tournament Leaders</div>
      <div class="leaders-container">
        <div class="leader-row">
          <span class="leader-label">🔥 Top Attacks (Goals For)</span>
          <div class="leader-teams">
            ${attackHTML}
          </div>
        </div>
        <div class="leader-row">
          <span class="leader-label">💨 Worst Attacks (Goals For)</span>
          <div class="leader-teams">
            ${worstAttackHTML}
          </div>
        </div>
        <div class="leader-row">
          <span class="leader-label">🛡️ Best Defenses (Goals Against)</span>
          <div class="leader-teams">
            ${defenseHTML}
          </div>
        </div>
        <div class="leader-row">
          <span class="leader-label">🚨 Worst Defenses (Goals Against)</span>
          <div class="leader-teams">
            ${worstDefenseHTML}
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 3. Render Top Goalscorers
  let scorerRows = '';
  topGoalscorers.slice(0, 5).forEach((player, idx) => {
    const flagUrl = TEAM_FLAG_CODES[player.team] ? `https://flagcdn.com/w40/${TEAM_FLAG_CODES[player.team]}.png` : 'https://flagcdn.com/w40/un.png';
    scorerRows += `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <div style="font-weight: 600;">${player.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; margin-top: 2px;">
            <img class="team-flag" src="${flagUrl}" alt="${player.team} flag" width="14" height="9" style="border-radius: 1px;">
            <span>${player.team}</span>
          </div>
        </td>
        <td style="text-align: center; font-size: 1.05rem; font-weight: 700; color: var(--accent-gold);">${player.goals}</td>
      </tr>
    `;
  });
  
  if (topGoalscorers.length === 0) {
    scorerRows = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 12px;">No goals scored yet.</td></tr>`;
  }
  
  const goalscorersSection = `
    <div class="stats-section-card">
      <div class="stats-section-title">Top Goalscorers</div>
      <table class="sidebar-table">
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th>Player</th>
            <th style="text-align: center; width: 60px;">Goals</th>
          </tr>
        </thead>
        <tbody>
          ${scorerRows}
        </tbody>
      </table>
    </div>
  `;
  
  // 4. Render Highest Scoring Groups
  const groupStats = {};
  const alphabet = 'ABCDEFGHIJKL'.split('');
  alphabet.forEach(letter => {
    groupStats[letter] = { goals: 0, mp: 0 };
  });
  
  matches.forEach(m => {
    if (m.score && m.score.ft) {
      const teamData = TEAMS_DATA[m.team1];
      const letter = teamData ? teamData.group : null;
      if (letter && groupStats[letter]) {
        groupStats[letter].goals += m.score.ft[0] + m.score.ft[1];
        groupStats[letter].mp += 1;
      }
    }
  });
  
  const sortedGroups = alphabet.map(letter => ({
    group: letter,
    goals: groupStats[letter].goals,
    mp: groupStats[letter].mp,
    avg: groupStats[letter].mp > 0 ? (groupStats[letter].goals / groupStats[letter].mp).toFixed(2) : '0.00'
  })).sort((a, b) => b.goals - a.goals || b.avg - a.avg || a.group.localeCompare(b.group));
  
  let groupRows = '';
  sortedGroups.slice(0, 5).forEach((g, idx) => {
    groupRows += `
      <tr>
        <td>${idx + 1}</td>
        <td style="font-weight: 600;">Group ${g.group}</td>
        <td style="text-align: center;">${g.goals}</td>
        <td style="text-align: center; color: var(--text-secondary);">${g.avg}</td>
      </tr>
    `;
  });
  
  const groupsSection = `
    <div class="stats-section-card">
      <div class="stats-section-title">Highest Scoring Groups</div>
      <table class="sidebar-table">
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th>Group</th>
            <th style="text-align: center; width: 60px;">Goals</th>
            <th style="text-align: center; width: 80px;">Avg/Match</th>
          </tr>
        </thead>
        <tbody>
          ${groupRows}
        </tbody>
      </table>
    </div>
  `;
  
  sidebar.innerHTML = wildcardSection;
  
  const leadersContainer = document.getElementById('statsLeadersContainer');
  const goalscorersContainer = document.getElementById('statsGoalscorersContainer');
  const groupsContainer = document.getElementById('statsGroupsContainer');
  
  if (leadersContainer) leadersContainer.innerHTML = leadersSection;
  if (goalscorersContainer) goalscorersContainer.innerHTML = goalscorersSection;
  if (groupsContainer) groupsContainer.innerHTML = groupsSection;
}

// ----------------------------------------------------
// UI Control Listeners
// ----------------------------------------------------

function setupUIEventListeners() {
  // Tab Switching
  const btnTabUnified = document.getElementById('btnTabUnified');
  const btnTabNormal = document.getElementById('btnTabNormal');
  const btnTabKnockouts = document.getElementById('btnTabKnockouts');
  const btnTabStats = document.getElementById('btnTabStats');
  const unifiedTableWrapper = document.getElementById('unifiedTableWrapper');
  const normalViewLayout = document.getElementById('normalViewLayout');
  const knockoutsViewLayout = document.getElementById('knockoutsViewLayout');
  const statsViewLayout = document.getElementById('statsViewLayout');
  const sortToggleContainer = document.getElementById('sortToggleContainer');
  const filtersBar = document.getElementById('filtersBar');
  
  btnTabUnified.addEventListener('click', () => {
    btnTabUnified.classList.add('active');
    btnTabNormal.classList.remove('active');
    btnTabKnockouts.classList.remove('active');
    btnTabStats.classList.remove('active');
    
    unifiedTableWrapper.style.display = 'block';
    filtersBar.style.display = 'block';
    sortToggleContainer.style.display = 'flex';
    normalViewLayout.style.display = 'none';
    knockoutsViewLayout.style.display = 'none';
    statsViewLayout.style.display = 'none';
    
    const mobileLegend = document.querySelector('.mobile-only-legend');
    if (mobileLegend) {
      mobileLegend.classList.remove('hide');
    }
  });
  
  btnTabNormal.addEventListener('click', () => {
    btnTabNormal.classList.add('active');
    btnTabUnified.classList.remove('active');
    btnTabKnockouts.classList.remove('active');
    btnTabStats.classList.remove('active');
    
    unifiedTableWrapper.style.display = 'none';
    filtersBar.style.display = 'none';
    sortToggleContainer.style.display = 'none';
    normalViewLayout.style.display = 'flex';
    knockoutsViewLayout.style.display = 'none';
    statsViewLayout.style.display = 'none';
    
    const mobileLegend = document.querySelector('.mobile-only-legend');
    if (mobileLegend) {
      mobileLegend.classList.add('hide');
    }
  });

  btnTabKnockouts.addEventListener('click', () => {
    btnTabKnockouts.classList.add('active');
    btnTabUnified.classList.remove('active');
    btnTabNormal.classList.remove('active');
    btnTabStats.classList.remove('active');
    
    unifiedTableWrapper.style.display = 'none';
    filtersBar.style.display = 'none';
    sortToggleContainer.style.display = 'none';
    normalViewLayout.style.display = 'none';
    knockoutsViewLayout.style.display = 'flex';
    statsViewLayout.style.display = 'none';
    
    const mobileLegend = document.querySelector('.mobile-only-legend');
    if (mobileLegend) {
      mobileLegend.classList.add('hide');
    }
  });

  btnTabStats.addEventListener('click', () => {
    btnTabStats.classList.add('active');
    btnTabUnified.classList.remove('active');
    btnTabNormal.classList.remove('active');
    btnTabKnockouts.classList.remove('active');
    
    unifiedTableWrapper.style.display = 'none';
    filtersBar.style.display = 'none';
    sortToggleContainer.style.display = 'none';
    normalViewLayout.style.display = 'none';
    knockoutsViewLayout.style.display = 'none';
    statsViewLayout.style.display = 'grid';
    
    const mobileLegend = document.querySelector('.mobile-only-legend');
    if (mobileLegend) {
      mobileLegend.classList.add('hide');
    }
  });

  // Sort view toggles
  const btnRank = document.getElementById('btnSortRank');
  const btnPure = document.getElementById('btnSortPure');
  
  btnRank.addEventListener('click', () => {
    sortMode = 'rank';
    btnRank.classList.add('active');
    btnPure.classList.remove('active');
    renderStandings();
  });
  
  btnPure.addEventListener('click', () => {
    sortMode = 'pure';
    btnPure.classList.add('active');
    btnRank.classList.remove('active');
    renderStandings();
  });
  
  // Search bar
  const searchInput = document.getElementById('teamSearch');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderStandings();
  });
  
  // Filter badges
  const filterBadges = document.querySelectorAll('.badge-filter');
  filterBadges.forEach(badge => {
    badge.addEventListener('click', () => {
      filterBadges.forEach(b => b.classList.remove('active'));
      badge.classList.add('active');
      currentFilter = badge.getAttribute('data-filter');
      renderStandings();
    });
  });

  
  // Matchday filter selector
  const selectMatchday = document.getElementById('selectMatchday');
  selectMatchday.addEventListener('change', () => {
    renderMatches();
  });
  
  // Standing table click listener for favorites (event delegation)
  const standingsBody = document.getElementById('standingsBody');
  if (standingsBody) {
    standingsBody.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-fav-star');
      if (btn) {
        const teamName = btn.dataset.team;
        toggleFavorite(teamName);
      }
    });
  }
  
  // Pinned favorites click-to-scroll listener (event delegation on matchesList)
  const matchesList = document.getElementById('matchesList');
  if (matchesList) {
    matchesList.addEventListener('click', (e) => {
      const pinnedCard = e.target.closest('.pinned-fav-card');
      if (pinnedCard) {
        const targetId = pinnedCard.dataset.targetId;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.add('scroll-target-pulse');
          setTimeout(() => {
            targetEl.classList.remove('scroll-target-pulse');
          }, 1500);
        }
      }
    });
  }
  
  // Cache Refresh Button listener
  const btnRefreshCache = document.getElementById('btnRefreshCache');
  if (btnRefreshCache) {
    btnRefreshCache.addEventListener('click', async () => {
      // Clear cache
      localStorage.removeItem('fifa_2026_matches_data');
      localStorage.removeItem('fifa_2026_matches_cache_time');
      
      // Animate rotation
      btnRefreshCache.style.transition = 'transform 0.5s ease-in-out';
      btnRefreshCache.style.transform = 'rotate(360deg)';
      
      // Fetch fresh data
      await fetchTournamentData();
      
      // Reset rotation style after animation
      setTimeout(() => {
        btnRefreshCache.style.transform = '';
        btnRefreshCache.style.transition = 'transform 0.2s ease-in-out';
      }, 500);
    });
  }

  // Drag scroll for Knockout Bracket
  const knockoutsLayout = document.getElementById('knockoutsViewLayout');
  if (knockoutsLayout) {
    let isDown = false;
    let startX;
    let scrollLeft;
    
    knockoutsLayout.addEventListener('mousedown', (e) => {
      isDown = true;
      knockoutsLayout.classList.add('active-dragging');
      startX = e.pageX - knockoutsLayout.offsetLeft;
      scrollLeft = knockoutsLayout.scrollLeft;
    });
    
    knockoutsLayout.addEventListener('mouseleave', () => {
      isDown = false;
      knockoutsLayout.classList.remove('active-dragging');
    });
    
    knockoutsLayout.addEventListener('mouseup', () => {
      isDown = false;
      knockoutsLayout.classList.remove('active-dragging');
    });
    
    knockoutsLayout.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - knockoutsLayout.offsetLeft;
      const walk = (x - startX) * 1.5; // scroll speed multiplier
      knockoutsLayout.scrollLeft = scrollLeft - walk;
    });
  }
}

// ----------------------------------------------------
// Initialize
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadFavorites();
  setupUIEventListeners();
  fetchTournamentData();
});
