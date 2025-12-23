import React, { useEffect, useState } from "react";
import { getTournamentStandings, getTournamentTeams } from "../../services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Users, Target, TrendingUp, AlertCircle } from "lucide-react";
import ReactLoader from "../../common/ReactLoader";

const baseURL = import.meta.env.VITE_BASE_URL || "";

import { useNavigate } from "react-router-dom";

const LeagueTeamWiseTournamentSummary = ({ selectedLeagueId }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [teamsList, setTeamsList] = useState([]);
  const [selectedStage, setSelectedStage] = useState("all");

  // Stages options
  const stages = [
    { id: "all", label: "All Stages" },
    { id: "Regular Round", label: "Regular Round" },
    { id: "Quarter Final", label: "Quarter Finals" },
    { id: "Semi Final", label: "Semi Finals" },
    { id: "Final", label: "Final" }
  ];

  // Function to handle row click
  const handleRowClick = (teamId) => {
    if (selectedLeagueId && teamId) {
      navigate(`/dashboard/teamSummary/${selectedLeagueId}/${teamId}`);
    }
  };


  // Used to fetch the teams list based on league id
  const fetchTeamsListBasedOnLeague = async (tournamentId, stage) => {
    if (!tournamentId) {
      setTeamsList([]);
      return;
    }

    try {
      setIsLoading(true);
      // Use V2 API - selectedLeagueId is actually Tournament ID. 
      // Pass 'null' for groupId and 'stage' if not 'all'.
      const apiStage = stage === "all" ? null : stage;

      // Parallel fetch: Get Standings AND All Teams
      const [standingsResponse, allTeamsResponse] = await Promise.all([
        getTournamentStandings(tournamentId, null, apiStage),
        getTournamentTeams(tournamentId)
      ]);

      console.log("Standings API Response:", standingsResponse);
      console.log("All Teams Response:", allTeamsResponse);

      let standingsData = [];
      if (standingsResponse && standingsResponse.status === 'SUCCESS') {
        if (standingsResponse.standings) {
          if (Array.isArray(standingsResponse.standings)) {
            standingsData = standingsResponse.standings;
          } else if (standingsResponse.standings.standings && Array.isArray(standingsResponse.standings.standings)) {
            standingsData = standingsResponse.standings.standings;
          }
        }
      }

      // Process All Teams (Base List)
      let allTeams = [];
      if (allTeamsResponse && allTeamsResponse.status === 'SUCCESS' && Array.isArray(allTeamsResponse.teams)) {
        allTeams = allTeamsResponse.teams;
      }

      console.log("All Teams Raw:", allTeams);
      console.log("Standings Data:", standingsData);

      if (allTeams.length === 0 && standingsData.length === 0) {
        setTeamsList([]);
        return;
      }

      // Map to create a unified list
      // We prioritize standings data if available, otherwise fallback to basic team info
      const mappedTeams = allTeams.map(v2Team => {
        const teamId = v2Team.team?._id;
        // Find corresponding standing entry
        const standing = standingsData.find(s => {
          const sTeamId = s.tournamentTeam?.team?._id || s.team?._id; // Handle populated/unpopulated
          return sTeamId === teamId;
        });

        const teamInfo = v2Team.team || {};

        return {
          _id: v2Team._id, // This is the V2TournamentTeam ID
          teamId: teamInfo._id, // Actual Team ID
          teamName: teamInfo.teamName || "Unknown Team",
          teamImage: teamInfo.teamImage,

          // Stats from standings or 0
          pointsScored: standing?.points || v2Team.stats?.points || 0,
          totalMatchesPlayed: standing?.played || v2Team.stats?.played || 0,
          wonMatches: standing?.won || v2Team.stats?.won || 0,
          lostMatches: standing?.lost || v2Team.stats?.lost || 0,
          tieMatches: standing?.drawn || v2Team.stats?.drawn || 0,
          goalsScoredByTeam: standing?.goalsFor || v2Team.stats?.goalsFor || 0,
          goalsScoredAgainstTeams: standing?.goalsAgainst || v2Team.stats?.goalsAgainst || 0
        };
      });

      // If there are standings entries NOT in allTeams (shouldn't happen, but safety check), add them?
      // No, V2TournamentTeam list should be the source of truth for participation.

      // Sort teams by points, then goal difference
      const sortedTeams = mappedTeams.sort((a, b) => {
        if (b.pointsScored !== a.pointsScored) {
          return b.pointsScored - a.pointsScored;
        }
        const diffA = a.goalsScoredByTeam - a.goalsScoredAgainstTeams;
        const diffB = b.goalsScoredByTeam - b.goalsScoredAgainstTeams;
        return diffB - diffA;
      });

      setTeamsList(sortedTeams);

    } catch (error) {
      console.error("Error fetching teams list: ", error);
      setTeamsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsListBasedOnLeague(selectedLeagueId, selectedStage);
  }, [selectedLeagueId, selectedStage]);

  // Helper function to get team image URL
  const getTeamImageUrl = (teamImage) => {
    if (!teamImage) return null;
    const imageName = teamImage.split('\\').pop().split('/').pop();
    return `${baseURL}/api/uploads/${imageName}`;
  };

  // Helper function to get rank emoji/badge
  const getRankBadge = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  // Calculate goal difference
  const calculateGoalDifference = (team) => {
    const scored = team.goalsScoredByTeam || 0;
    const against = team.goalsScoredAgainstTeams || 0;
    return scored - against;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ReactLoader />
      </div>
    );
  }

  // Empty state - no league selected
  if (!selectedLeagueId) {
    return (
      <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 p-12 text-center">
        <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg">Please select a league to view team standings</p>
      </div>
    );
  }

  // Empty state - no teams
  if (!isLoading && teamsList.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6 border border-slate-700">
            <AlertCircle className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Teams Found</h3>
          <p className="text-slate-400">
            No teams are registered in this league yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-900/20 rounded-lg border border-orange-900/50">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Team Standings</h2>
              <p className="text-sm text-slate-400 mt-1">
                {selectedStage === "all" ? "All Stages Consolidated" : stages.find(s => s.id === selectedStage)?.label + " Standings"}
              </p>
            </div>
          </div>

          {/* Stage Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full sm:w-48 bg-slate-800 border-slate-600 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5"
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-orange-600 to-orange-500 hover:bg-orange-600 border-none">
              <TableHead className="text-white font-bold w-16 text-center">Rank</TableHead>
              <TableHead className="text-white font-bold">Team</TableHead>
              <TableHead className="text-white font-bold text-center">Pts</TableHead>
              <TableHead className="text-white font-bold text-center">P</TableHead>
              <TableHead className="text-white font-bold text-center">W</TableHead>
              <TableHead className="text-white font-bold text-center">L</TableHead>
              <TableHead className="text-white font-bold text-center">T</TableHead>
              <TableHead className="text-white font-bold text-center">GF</TableHead>
              <TableHead className="text-white font-bold text-center">GA</TableHead>
              <TableHead className="text-white font-bold text-center">GD</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamsList.map((team, index) => {
              const goalDiff = calculateGoalDifference(team);
              return (
                <TableRow
                  key={team._id}
                  onClick={() => handleRowClick(team._id)}
                  className="hover:bg-slate-800/50 transition-colors border-slate-700 cursor-pointer"
                >
                  <TableCell className="text-center font-semibold">
                    <div className="flex items-center justify-center">
                      {index < 3 ? (
                        <span className="text-2xl">{getRankBadge(index)}</span>
                      ) : (
                        <span className="text-slate-400">{getRankBadge(index)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {team.teamImage ? (
                        <img
                          src={getTeamImageUrl(team.teamImage)}
                          alt={team.teamName || "Team"}
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-600"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.teamName || "Team")}&background=ea580c&color=fff&size=128`;
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                          <Users className="w-5 h-5 text-orange-500" />
                        </div>
                      )}
                      <span className="font-semibold text-slate-200">{team.teamName || "Unknown Team"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-900/30 text-orange-400 font-bold text-sm border border-orange-700/50">
                      {team.pointsScored ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-slate-300 font-medium">
                    {team.totalMatchesPlayed ?? 0}
                  </TableCell>
                  <TableCell className="text-center text-green-500 font-semibold">
                    {team.wonMatches ?? 0}
                  </TableCell>
                  <TableCell className="text-center text-red-500 font-semibold">
                    {team.lostMatches ?? 0}
                  </TableCell>
                  <TableCell className="text-center text-blue-500 font-semibold">
                    {team.tieMatches ?? 0}
                  </TableCell>
                  <TableCell className="text-center text-slate-300 font-medium">
                    {team.goalsScoredByTeam ?? 0}
                  </TableCell>
                  <TableCell className="text-center text-slate-300 font-medium">
                    {team.goalsScoredAgainstTeams ?? 0}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-bold ${goalDiff > 0 ? 'text-green-500' : goalDiff < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {goalDiff > 0 ? '+' : ''}{goalDiff}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {teamsList.map((team, index) => {
          const goalDiff = calculateGoalDifference(team);
          return (
            <div
              key={team._id}
              onClick={() => handleRowClick(team._id)}
              className="bg-[#1e293b] rounded-xl p-4 border border-slate-700 shadow-md cursor-pointer hover:border-orange-500/50 transition-colors"
            >
              {/* Rank and Team Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {index < 3 ? (
                      <span className="text-3xl">{getRankBadge(index)}</span>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <span className="text-slate-400 font-bold text-lg">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  {team.teamImage ? (
                    <img
                      src={getTeamImageUrl(team.teamImage)}
                      alt={team.teamName || "Team"}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-600"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.teamName || "Team")}&background=ea580c&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                      <Users className="w-7 h-7 text-orange-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-lg">{team.teamName || "Unknown Team"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-900/30 text-orange-400 border border-orange-700/50 font-bold text-sm">
                        <Trophy className="w-3 h-3 mr-1" />
                        {team.pointsScored ?? 0} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Matches Played</p>
                  <p className="text-lg font-bold text-slate-200">{team.totalMatchesPlayed ?? 0}</p>
                </div>
                <div className="p-3 bg-green-900/20 border border-green-900/30 rounded-lg">
                  <p className="text-xs text-green-400 mb-1">Won</p>
                  <p className="text-lg font-bold text-green-500">{team.wonMatches ?? 0}</p>
                </div>
                <div className="p-3 bg-red-900/20 border border-red-900/30 rounded-lg">
                  <p className="text-xs text-red-400 mb-1">Lost</p>
                  <p className="text-lg font-bold text-red-500">{team.lostMatches ?? 0}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Tied</p>
                  <p className="text-lg font-bold text-slate-200">{team.tieMatches ?? 0}</p>
                </div>
                <div className="p-3 bg-blue-900/20 border border-blue-900/30 rounded-lg">
                  <p className="text-xs text-blue-400 mb-1">Goals For</p>
                  <p className="text-lg font-bold text-blue-500">{team.goalsScoredByTeam ?? 0}</p>
                </div>
                <div className="p-3 bg-purple-900/20 border border-purple-900/30 rounded-lg">
                  <p className="text-xs text-purple-400 mb-1">Goals Against</p>
                  <p className="text-lg font-bold text-purple-500">{team.goalsScoredAgainstTeams ?? 0}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Goal Difference</p>
                      <p className={`text-2xl font-bold ${goalDiff > 0 ? 'text-green-500' : goalDiff < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        {goalDiff > 0 ? '+' : ''}{goalDiff}
                      </p>
                    </div>
                    <TrendingUp className={`w-8 h-8 ${goalDiff > 0 ? 'text-green-500' : goalDiff < 0 ? 'text-red-500' : 'text-slate-500'}`} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeagueTeamWiseTournamentSummary;
