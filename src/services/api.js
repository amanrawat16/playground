import axios from "axios";

// const baseURL = import.meta.env.VITE_BASE_URL;
const baseURL = "http://localhost:8200";
// https://octopus-app-ly3r2.ondigitalocean.app
const apiKey = import.meta.env.VITE_API_KEY;

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

export const getTeam = async (userData) => {
  try {
    const response = await instance.get(`/comp/club/getAllTeam`);
    return response.data;
  } catch (error) {
    console.error("Error fetching teams list:", error.response || error);
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

export const viewMatchesByLeagueName = async (leagueId) => {
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
  teamId,
  playerId,
  updatedPlayerData
) => {
  try {
    const response = await instance.patch(
      `/comp/match/updatePlayerMatchWise/${teamId}/${playerId}`,
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

export const viewLeagueFixture = async (leagueId) => {
  try {
    const response = await instance.get(`/comp/leagueFixture/viewLeagueFixture/${leagueId}`)
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
    const response = await instance.post(`/comp/leagueFixture/start/QuaterFinalMathces/${leagueId}`, matchData)
    return response.data
  } catch (error) {
    console.error("Error creating match", error.response || error);
    throw error;
  }
}