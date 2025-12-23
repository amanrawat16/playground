import axios from "axios";

export const baseURL = import.meta.env.VITE_BASE_URL;
// const baseURL = "https://octopus-app-ly3r2.ondigitalocean.app"
const apiKey = "THE123FIELD";

export const instance = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    API_KEY: apiKey,
  },
});

export const createCompClub = async (clubData) => {
  try {
    const response = await instance.post("/comp/club/register", clubData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error.response || error);
    throw error;
  }
};

export const login = async (userData) => {
  try {
    const response = await instance.post("/comp/club/login", userData);
    return response.data;
  } catch (err) {
    console.error("Error logging in:", err.response || err);
    throw err;
  }
};

export const logoutCompClub = async (userData) => {
  try {
    const response = await instance.post("/comp/club/logout", userData);
    return response.data;
  } catch (err) {
    console.log(err)
    console.error("Error in logout:", err.response || err);
    throw err;
  }
};

export const createTeam = async (teamData) => {
  try {
    const response = await instance.post("/comp/club/createTeam", teamData);
    return response.data;
  } catch (error) {
    console.error("Error creating team:", error.response || error);
    throw error;
  }
};

export const updateTeam = async (teamId, updatedTeamData) => {
  try {
    const response = await instance.patch(
      `/comp/club/updateTeam/${teamId}`,
      updatedTeamData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating team:", error.response || error);
    throw error;
  }
};

export const deleteLeague = async (leagueId) => {
  try {
    const response = await instance.delete(`/comp/league/deleteLeague/${leagueId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting league:", error.response || error);
    throw error;
  }
};

export const deleteCompClub = async (clubId) => {
  try {
    const response = await instance.delete(`/comp/club/deleteCompClub/${clubId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting comp club:", error.response || error);
    throw error;
  }
};

export const deleteTeam = async (teamId) => {
  try {
    const response = await instance.delete(`/comp/club/deleteTeam/${teamId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting team:", error.response || error);
    throw error;
  }
};

export const deleteCompPlayer = async (playerId) => {
  try {
    const response = await instance.delete(`/comp/player/delete/${playerId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting player:", error.response || error);
    throw error;
  }
};

export const updateCompPlayer = async (playerId, playerData) => {
  try {
    const response = await instance.patch(`/comp/player/update/${playerId}`, playerData);
    return response.data;
  } catch (error) {
    console.error("Error updating player:", error.response || error);
    throw error;
  }
};

export const getTeam = async (userData) => {
  try {
    const response = await instance.get(`/comp/club/getAllTeam`);
    return response.data;
  } catch (error) {
    console.error("Error fetching teams list:", error.response || error);
    throw error;
  }
};

export const getTeamById = async (teamId) => {
  try {
    const response = await instance.get(`/comp/team/getTeam/${teamId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching team ${teamId}:`, error.response || error);
    throw error;
  }
};

export const getCompClubs = async (userData) => {
  try {
    const response = await instance.get(`/comp/club/getAllCompClubs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comp clubs :", error.response || error);
    throw error;
  }
};

export const createMatch = async (matchData) => {
  try {
    const response = await instance.post("/comp/match/createMatch", matchData);
    return response.data;
  } catch (error) {
    console.error("Error creating Match:", error.response || error);
    throw error;
  }
};

export const viewMatches = async () => {
  try {
    const response = await instance.get("/comp/match/viewMatches");
    return response.data;
  } catch (error) {
    console.error("Error view Match:", error.response || error);
    throw error;
  }
};

export const viewMatchesBasedOnLeague = async (leagueId) => {
  try {
    const response = await instance.get(
      `/comp/match/viewMatchesByLeague/${leagueId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error view Match:", error.response || error);
    throw error;
  }
};

export const viewMatchesByLeague = async (leagueId) => {
  try {
    const response = await instance.get(`/comp/match/viewMatches/${leagueId}`)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const updateMatch = async (matchId, updatedMatchData) => {
  try {
    const response = await instance.patch(
      `/comp/match/updateMatch/${matchId}`,
      updatedMatchData
    );
    return response.data;
  } catch (error) {
    console.error("Error Updating match:", error.response || error);
    throw error;
  }
};

export const createLeague = async (leagueData) => {
  try {
    const response = await instance.post("/comp/league/createLeague",
      leagueData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating league:", error.response || error);
    throw error;
  }
};

export const getAllLeagues = async () => {
  try {
    const response = await instance.get(`/comp/league/viewLeagues`);
    return response.data;
  } catch (error) {
    console.error("Error fetching leagues list:", error.response || error);
    throw error;
  }
};

export const updatePlayerDetails = async (
  playerId,
  matchId,
  updatedPlayerData
) => {
  try {
    const response = await instance.patch(
      `/comp/match/updatePlayerMatchWise/${playerId}/${matchId}`,
      updatedPlayerData
    );
    return response.data;
  } catch (error) {
    console.error("Error Updating Player Data:", error.response || error);
    throw error;
  }
};

export const getSingleCompClubs = async (clubId) => {
  try {
    const response = await instance.get(`/comp/club/getCompClub/${clubId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching single comp clubs :",
      error.response || error
    );
    throw error;
  }
};

export const updateLeague = async (leagueId, leagueData) => {
  try {
    const response = await instance.patch(`/comp/league/updateLeague/${leagueId}`, leagueData);
    return response.data;
  } catch (error) {
    console.error("Error updating league:", error.response || error);
    throw error;
  }
};

export const updateCompClub = async (clubId, clubData) => {
  try {
    // Check if clubData contains a file (for image upload)
    const headers = {};
    if (clubData instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }

    const response = await instance.patch(`/comp/club/updateCompClub/${clubId}`, clubData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error updating club:", error.response || error);
    throw error;
  }
};

export const updateUsersData = async (clubId, payload) => {
  try {
    const response = await instance.patch(
      `/comp/club/updateCompClub/${clubId}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error Updating Password Data:", error.response || error);
    throw error;
  }
};

export const getMatchesDataLeagueWise = async (leagueId) => {
  try {
    const response = await instance.get(
      `/comp/match/playerPerformanceLeagueWise/leagues/${leagueId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching matches league wise :",
      error.response || error
    );
    throw error;
  }
};

export const getAllTeamsBasedOnLeague = async (leagueId) => {
  try {
    const response = await instance.get(
      `/comp/club/getTeamsBasedOnLeague/${leagueId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching teams list:", error.response || error);
    throw error;
  }
};

export const getAllTeams = async () => {
  try {
    const response = await instance.get("/comp/team/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching all teams:", error.response || error);
    throw error;
  }
};


export const getAllCategories = async () => {
  try {
    const response = await instance.get("/comp/league/getCategories")
    return response.data;
  } catch (error) {
    console.error("Error fetching categories data:", error.response || error);
    throw error;
  }
}

export const createCategory = async (name) => {
  try {
    const response = await instance.post("/comp/league/createCategory", { name })
    return response.data;
  } catch (error) {
    console.error("Error creating the category", error.response || error);
    throw error;
  }
}

export const createLeagueFixture = async (leagueFixtureData) => {
  try {
    const response = await instance.post('/comp/leagueFixture/createLeagueFixture', { ...leagueFixtureData })
    return response.data;
  } catch (error) {
    console.error("Error creating the league fixture", error.response || error);
    throw error;
  }
}

export const viewLeagueFixture = async (leagueId, categoryId) => {
  try {
    const url = categoryId
      ? `/comp/leagueFixture/viewLeagueFixture/${leagueId}/${categoryId}`
      : `/comp/leagueFixture/viewLeagueFixture/${leagueId}`;
    const response = await instance.get(url)
    return response.data;
  } catch (error) {
    console.log("Error fetching League Fixture data", error.response || error)
    throw error
  }
}

export const updateFixture = async (leagueId, leagueFixtureData) => {
  try {
    const response = await instance.patch(`/comp/leagueFixture/updateFixture/${leagueId}`, { ...leagueFixtureData })
    return response.data
  } catch (error) {
    console.log("Error updating League Fixture data", error.response || error)
    throw error
  }
}


export const createGroup = async (groupData) => {
  try {
    const response = await instance.post("/comp/leagueGroups/createGroups", { ...groupData })
    return response.data
  } catch (error) {
    console.error("Error creating groups", error.response || error);
    throw error;
  }
}

export const AddTeamtoGroups = async (groupsData) => {
  try {
    const response = await instance.post(`/comp/leagueGroups/addGroupTeam`, { groups: groupsData })
    return response.data;
  } catch (error) {
    console.error("Error adding team to group", error.response || error);
    throw error;
  }
}

export const createLeagueFixtureMatch = async (fixtureId, leagueId, matchData) => {
  try {
    const response = await instance.post(`/comp/leagueFixture/startMatch/${fixtureId}/${leagueId}`, matchData)
    return response.data
  } catch (error) {
    console.error("Error creating match", error.response || error);
    throw error;
  }
}

export const startQuaterFinals = async (leagueId) => {

  try {
    const response = await instance.post(`/comp/leagueFixture/startQuaterFinals/${leagueId}`)
    return response.data
  } catch (error) {
    console.error("Error creating match", error.response || error);
    throw error;
  }
}

export const startQuaterFinalMatches = async (leagueId, matchData) => {
  try {
    const response = await instance.post(`/comp/leagueFixture/start/QuaterFinalMatches/${leagueId}`, matchData)
    return response.data
  } catch (error) {
    console.error("Error creating match", error.response || error);
    throw error;
  }
}

export const startSemiFinalMatches = async (leagueId, matchData) => {
  try {
    const response = await instance.post(`/comp/leagueFixture/start/SemiFinalMatches/${leagueId}`, matchData)
    return response.data
  } catch (error) {
    console.error("Error creating match", error.response || error);
    throw error;
  }
}

export const startFinals = async (leagueId, matchData) => {
  try {
    const response = await instance.post(`/comp/leagueFixture/start/finals/${leagueId}`, matchData)
    return response.data
  } catch (error) {
    console.error("Error creating match", error.response || error);
    throw error;
  }
}

export const getImage = async (imageName) => {
  try {
    const response = await instance.get(`/comp/images/get/${imageName}`)
    return response.data;
  } catch (error) {
    console.error("Error creating match", error.response || error);
    throw error;
  }
}

export const getTeams = async (leagueId) => {
  try {
    const response = await instance.get(`/comp/team/get/${leagueId}`);
    return response.data
  } catch (error) {
    console.error("Error creating match", error.response || error);
    throw error;
  }
}

export const getTeamPlayers = async (teamId) => {
  try {
    const response = await instance.get(`/comp/team/players/${teamId}`)
    return response.data
  } catch (error) {
    console.error("Error creating match", error.response || error);
    throw error;
  }
}

export const getPlayer = async (playerId) => {
  try {
    const response = await instance.get(`/comp/player/get/${playerId}`);
    return response.data;
  } catch (error) {
    console.error("Error creating match", error.response || error);
    throw error;
  }
}

export const getPlayerPerformancesOfLeague = async (leagueId) => {
  try {
    const response = await instance.get(`/comp/player/playerPerformance/${leagueId}`)
    return response.data
  } catch (error) {
    console.error("Error creating match", error.response || error);
    throw error;
  }
}

export const getMyMatches = async (clubId) => {
  try {
    const response = await instance.get(`/comp/match/view/MyMatches/${clubId}`)
    return response.data
  } catch (error) {
    console.error("Error finding my matches", error.response || error);
    throw error;
  }
}

export const PlayerDetailUpdate = async (id, data) => {
  try {
    const response = await instance.patch(`/comp/player/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating player detail", error.response || error);
    throw error;
  }
}


export const ChangeTeamImage = async (id, formData) => {
  try {
    const response = await instance.patch(`/comp/team/updateImage/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log(response)
    return response.data;
  } catch (error) {
    console.error("Error updating team image", error.response || error);
    throw error;
  }
}

export const updateTeamInfo = async (id, data) => {
  try {
    const response = await instance.patch(`/comp/team/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating team info", error.response || error);
    throw error;
  }
}

export const AddnewStaff = async (data) => {
  try {
    const response = await instance.post(`/comp/staff/create`, data);
    return response.data;
  } catch (error) {
    console.error("Error adding staff", error.response || error);
    throw error;
  }
}

export const getStaff = async () => {
  try {
    const response = await instance.get(`/comp/staff/get`);
    return response.data;
  } catch (error) {
    console.error("Error fetching staff list", error.response || error);
    throw error;
  }
}

export const deleteStaff = async (id) => {
  try {
    const response = await instance.delete(`/comp/staff/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting staff", error.response || error);
    throw error;
  }
}

// Team Management
export const createWildcardTeam = async (teamData) => {
  try {
    const response = await instance.post("/comp/team/create", teamData);
    return response.data;
  } catch (error) {
    console.error("Error creating wildcard team:", error.response || error);
    throw error;
  }
}

export const addTeamToLeague = async (data) => {
  try {
    const response = await instance.post("/comp/team/add-to-league", data);
    return response.data;
  } catch (error) {
    console.error("Error adding team to league:", error.response || error);
    throw error;
  }
}

export const removeTeamFromLeague = async (data) => {
  try {
    const response = await instance.post("/comp/team/remove-from-league", data);
    return response.data;
  } catch (error) {
    console.error("Error removing team from league:", error.response || error);
    throw error;
  }
}

export const saveRegularRoundMatches = async (leagueId, fixtureId, matches) => {
  try {
    const response = await instance.post(`/comp/leagueFixture/saveRegularRoundMatches/${leagueId}/${fixtureId}`, { matches });
    return response.data;
  } catch (error) {
    console.error("Error saving regular round matches:", error.response || error);
    throw error;
  }
}

export const createTeamUpdateRequest = async (requestData) => {
  try {
    const response = await instance.post("/comp/teamUpdateRequests/create", requestData);
    return response.data;
  } catch (error) {
    console.error("Error creating team update request:", error.response || error);
    throw error;
  }
}

export const getPendingRequests = async () => {
  try {
    const response = await instance.get("/comp/teamUpdateRequests/pending");
    return response.data;
  } catch (error) {
    console.error("Error fetching pending requests:", error.response || error);
    throw error;
  }
}

export const approveRequest = async (requestId) => {
  try {
    const response = await instance.post(`/comp/teamUpdateRequests/approve/${requestId}`);
    return response.data;
  } catch (error) {
    console.error("Error approving request:", error.response || error);
    throw error;
  }
}

export const rejectRequest = async (requestId) => {
  try {
    const response = await instance.post(`/comp/teamUpdateRequests/reject/${requestId}`);
    return response.data;
  } catch (error) {
    console.error("Error rejecting request:", error.response || error);
    throw error;
  }
}

export const createClubUpdateRequest = async (requestData) => {
  try {
    const response = await instance.post("/comp/clubUpdateRequests/create", requestData);
    return response.data;
  } catch (error) {
    console.error("Error creating club update request:", error.response || error);
    throw error;
  }
}

export const getPendingClubRequests = async () => {
  try {
    const response = await instance.get("/comp/clubUpdateRequests/pending");
    return response.data;
  } catch (error) {
    console.error("Error fetching pending club requests:", error.response || error);
    throw error;
  }
}

export const approveClubRequest = async (requestId) => {
  try {
    const response = await instance.post(`/comp/clubUpdateRequests/approve/${requestId}`);
    return response.data;
  } catch (error) {
    console.error("Error approving club request:", error.response || error);
    throw error;
  }
}

export const rejectClubRequest = async (requestId) => {
  try {
    const response = await instance.post(`/comp/clubUpdateRequests/reject/${requestId}`);
    return response.data;
  } catch (error) {
    console.error("Error rejecting club request:", error.response || error);
    throw error;
  }
}

// V2 APIs
export const getTournamentPlayerRankings = async (tournamentId) => {
  try {
    const response = await instance.get(`/v2/tournaments/${tournamentId}/player-rankings?limit=50`);
    return response.data;
  } catch (error) {
    console.error("Error fetching player rankings:", error.response || error);
    throw error;
  }
}

export const getMatchPlayerStats = async (matchId) => {
  try {
    const response = await instance.get(`/v2/matches/${matchId}/player-performance`);
    return response.data;
  } catch (error) {
    console.error("Error fetching match player stats:", error.response || error);
    throw error;
  }
}

export const getTournamentTeamPlayerStats = async (tournamentId, teamId) => {
  try {
    const response = await instance.get(`/v2/tournaments/${tournamentId}/teams/${teamId}/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tournament team player stats:", error);
    throw error;
  }
};

export const getTournamentStandings = async (tournamentId, groupId = null, stage = null) => {
  try {
    let url = `/v2/tournaments/${tournamentId}/standings?`;
    if (groupId) url += `groupId=${groupId}&`;
    if (stage) url += `stage=${stage}&`;

    // Remove trailing & or ?
    if (url.endsWith('&') || url.endsWith('?')) {
      url = url.slice(0, -1);
    }

    const response = await instance.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching tournament standings:", error.response || error);
    throw error;
  }
}

export const getAllTournamentsV2 = async () => {
  try {
    const response = await instance.get('/v2/tournaments');
    return response.data;
  } catch (error) {
    console.error("Error fetching all tournaments:", error.response || error);
    throw error;
  }
}

export const getTournamentsByLeague = async (leagueId) => {
  try {
    const response = await instance.get(`/v2/leagues/${leagueId}/tournaments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tournaments by league:", error.response || error);
    throw error;
  }
}

export const getTournamentMatches = async (tournamentId) => {
  try {
    const response = await instance.get(`/v2/tournaments/${tournamentId}/matches`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tournament matches:", error.response || error);
    throw error;
  }
}

export const getTournamentTeams = async (tournamentId) => {
  try {
    const response = await instance.get(`/v2/tournaments/${tournamentId}/teams`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tournament teams:", error.response || error);
    throw error;
  }
}


export const updateMatchV2 = async (matchId, data) => {
  try {
    const response = await instance.put(`/v2/matches/${matchId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating match V2:", error.response || error);
    throw error;
  }
}

export const savePlayerPerformanceV2 = async (matchId, data) => {
  try {
    const response = await instance.post(`/v2/matches/${matchId}/player-stats`, data);
    return response.data;
  } catch (error) {
    console.error("Error saving player performance V2:", error.response || error);
    throw error;
  }
}

export const getMatchPerformancesV2 = async (matchId) => {
  try {
    const response = await instance.get(`/v2/matches/${matchId}/player-stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching match performances V2:", error.response || error);
    throw error;
  }
}

export const deletePlayerPerformanceV2 = async (matchId, playerId) => {
  try {
    const response = await instance.delete(`/v2/matches/${matchId}/player-stats/${playerId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting player performance V2:", error.response || error);
    throw error;
  }
}

