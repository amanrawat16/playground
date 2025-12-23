import React, { useEffect, useState } from "react";
import Pagination from "../../common/Pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Target, Shield, Zap, User, Award, AlertCircle, Calendar, MapPin, Clock, Users } from "lucide-react";
import { getMatchPlayerStats } from "../../services/api";

const MatchWiseTournamentSummary = ({ selectedMatch, matchWiseSummany }) => {
  const [paginatedRusherItemsList, setPaginatedRusherItemsList] = useState([]);
  const [paginatedAttackersItemsList, setPaginatedAttackersItemsList] = useState([]);
  const [paginatedDefendersItemsList, setPaginatedDefendersItemsList] = useState([]);
  const [paginatedQbItemsList, setPaginatedQbItemsList] = useState([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [fetchedMatchData, setFetchedMatchData] = useState(null);

  const [categoryWiseSortedData, setCategoryWiseSortedData] = useState([]);

  // Position configurations
  const positions = [
    {
      id: "rusher",
      name: "Rushers",
      icon: Zap,
      color: "from-blue-600 to-blue-500",
      dataKey: "sortedByRusher",
      pointsKey: "rusherPointsScored",
      paginatedList: paginatedRusherItemsList,
      setPaginatedList: setPaginatedRusherItemsList,
    },
    {
      id: "attacker",
      name: "Attackers",
      icon: Target,
      color: "from-red-600 to-red-500",
      dataKey: "sortedByAttacker",
      pointsKey: "attackerPointsScored",
      paginatedList: paginatedAttackersItemsList,
      setPaginatedList: setPaginatedAttackersItemsList,
    },
    {
      id: "defender",
      name: "Defenders",
      icon: Shield,
      color: "from-green-600 to-green-500",
      dataKey: "sortedByDefence",
      pointsKey: "defencePointsScored",
      paginatedList: paginatedDefendersItemsList,
      setPaginatedList: setPaginatedDefendersItemsList,
    },
    {
      id: "qb",
      name: "Quarterbacks",
      icon: Trophy,
      color: "from-purple-600 to-purple-500",
      dataKey: "sortedByQB",
      pointsKey: "qbPointsScored",
      paginatedList: paginatedQbItemsList,
      setPaginatedList: setPaginatedQbItemsList,
    },
  ];

  useEffect(() => {
    // Clear pagination lists when match changes
    setPaginatedRusherItemsList([]);
    setPaginatedAttackersItemsList([]);
    setPaginatedDefendersItemsList([]);
    setPaginatedQbItemsList([]);
    setCategoryWiseSortedData([]);

    // Reset loading state
    setIsLoadingPlayers(false);

    const fetchPlayersData = async () => {
      if (!selectedMatch) {
        return;
      }

      setIsLoadingPlayers(true);

      try {
        const response = await getMatchPlayerStats(selectedMatch);

        if (response && response.status === 'SUCCESS') {
          // API returns { status, match, playerStats } directly
          const playerStats = response.playerStats || [];
          const matchData = response.match || {};

          // Store match data for display (when matchWiseSummany is not provided)
          setFetchedMatchData({
            ...matchData,
            team1: matchData.homeTeam?.team || matchData.homeTeam,
            team2: matchData.awayTeam?.team || matchData.awayTeam,
            team1stPoints: { score: matchData.homeScore, points: matchData.pointsAwarded?.home || 0 },
            team2ndPoints: { score: matchData.awayScore, points: matchData.pointsAwarded?.away || 0 },
            date: matchData.scheduledDate,
            matchType: matchData.stage,
            location: matchData.location,
            time: matchData.scheduledTime ? [{ startTime: matchData.scheduledTime }] : []
          });

          let homeTeamPlayers = [];
          let awayTeamPlayers = [];

          if (playerStats.length > 0 && matchData.homeTeam) {
            const homeTeamId = matchData.homeTeam._id;
            const awayTeamId = matchData.awayTeam._id;

            homeTeamPlayers = playerStats.filter(p => p.team?._id === homeTeamId);
            awayTeamPlayers = playerStats.filter(p => p.team?._id === awayTeamId);
          }


          // Helper to process players from V2 format to component format
          const processV2Players = (players) => {
            if (!players) return [];
            return players.map(p => {
              const player = p.player || {};
              // console.log("Processing player:", player);
              const points = p.points || {};
              const stats = p.stats || {};

              // Ensure we have a valid ID
              if (!player._id) return null;

              return {
                _id: player._id,
                playerName: player.playerName || player.name || "Unknown",
                teamId: p.team?._id,
                teamImage: p.team?.team?.teamImage, // Deep populate might be nested
                scored: {
                  rusherPointsScored: points.rusher || 0,
                  attackerPointsScored: points.attacker || 0,
                  defencePointsScored: points.defence || 0,
                  qbPointsScored: points.qb || 0,
                  totalPointsScored: points.total || 0
                }
              };
            }).filter(Boolean); // Remote nulls
          };

          const processedHomePlayers = processV2Players(homeTeamPlayers);
          const processedAwayPlayers = processV2Players(awayTeamPlayers);

          const allProcessedPlayers = [...processedHomePlayers, ...processedAwayPlayers];
          // Separate and sort by category for lists
          const sortByCategory = (players, key) => {
            return [...players].sort((a, b) => (b.scored?.[key] || 0) - (a.scored?.[key] || 0));
          };

          const sortedByRusher = sortByCategory(allProcessedPlayers, 'rusherPointsScored');
          const sortedByAttacker = sortByCategory(allProcessedPlayers, 'attackerPointsScored');
          const sortedByDefence = sortByCategory(allProcessedPlayers, 'defencePointsScored');
          const sortedByQB = sortByCategory(allProcessedPlayers, 'qbPointsScored');

          // Set the structured data expected by the view and useEffect
          setCategoryWiseSortedData([{
            sortedByRusher,
            sortedByAttacker,
            sortedByDefence,
            sortedByQB
          }]);

          // Initial pagination setup is now handled by the useEffect below
        } else {
          setCategoryWiseSortedData([]);
        }

      } catch (error) {
        console.error("Error fetching match players:", error);
        setCategoryWiseSortedData([]);
      } finally {
        setIsLoadingPlayers(false);
      }
    };

    fetchPlayersData();
  }, [selectedMatch]);

  useEffect(() => {
    // Initialize pagination for each position when data is ready
    if (categoryWiseSortedData?.[0]) {
      const data = categoryWiseSortedData[0];

      // Initialize pagination - always set first page when data changes

      if (data.sortedByAttacker?.length > 0) {
        const firstPage = data.sortedByAttacker.slice(0, 5);
        setPaginatedAttackersItemsList(firstPage);
      } else {
        setPaginatedAttackersItemsList([]);
      }

      if (data.sortedByRusher?.length > 0) {
        const firstPage = data.sortedByRusher.slice(0, 5);
        setPaginatedRusherItemsList(firstPage);
      } else {
        setPaginatedRusherItemsList([]);
      }

      if (data.sortedByDefence?.length > 0) {
        const firstPage = data.sortedByDefence.slice(0, 5);
        setPaginatedDefendersItemsList(firstPage);
      } else {
        setPaginatedDefendersItemsList([]);
      }

      if (data.sortedByQB?.length > 0) {
        const firstPage = data.sortedByQB.slice(0, 5);
        setPaginatedQbItemsList(firstPage);
      } else {
        setPaginatedQbItemsList([]);
      }
    } else {
      // Clear all if no data
      setPaginatedRusherItemsList([]);
      setPaginatedAttackersItemsList([]);
      setPaginatedDefendersItemsList([]);
      setPaginatedQbItemsList([]);
    }
  }, [categoryWiseSortedData]);

  // Component to render position stats
  const PositionStats = ({ position }) => {
    const Icon = position.icon;
    const players = position.paginatedList || [];
    const allPlayers = categoryWiseSortedData?.[0]?.[position.dataKey] || [];
    // Show all players, even those with 0 points (filtering is already done in sorting)
    const filteredPlayers = players.filter(
      (player) => player?.playerName
    );

    return (
      <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden h-full">
        {/* Header */}
        <div className={`bg-gradient-to-r ${position.color} px-6 py-4 border-b border-white/20`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {position.name}
            </h2>
            <span className="ml-auto px-3 py-1 bg-white/20 rounded-full text-white text-sm font-semibold">
              {filteredPlayers.length}
            </span>
          </div>
        </div>

        {/* Content */}
        {filteredPlayers.length === 0 ? (
          <div className="p-12 text-center">
            <Icon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No {position.name.toLowerCase()} data available</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#0f172a] border-b border-slate-700">
                    <TableHead className="font-bold text-slate-300 w-16 text-center py-4">Rank</TableHead>
                    <TableHead className="font-bold text-slate-300 py-4">Player Name</TableHead>
                    <TableHead className="font-bold text-slate-300 text-right py-4 pr-6">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player, index) => {
                    const points = player?.scored?.[position.pointsKey] || 0;
                    return (
                      <TableRow
                        key={index}
                        className="hover:bg-slate-800/50 transition-all duration-200 border-b border-slate-700"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center justify-center">
                            {index === 0 && (
                              <div className="w-8 h-8 rounded-full bg-yellow-900/30 border border-yellow-700/50 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                              </div>
                            )}
                            {index === 1 && (
                              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                                <Award className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            {index === 2 && (
                              <div className="w-8 h-8 rounded-full bg-orange-900/30 border border-orange-700/50 flex items-center justify-center">
                                <Award className="w-5 h-5 text-orange-500" />
                              </div>
                            )}
                            {index > 2 && (
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                <span className="text-slate-400 font-bold text-sm">#{index + 1}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-orange-500" />
                            </div>
                            <span className="font-semibold text-slate-200">{player.playerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4 pr-6">
                          <div className="inline-flex items-center gap-2 bg-orange-900/20 px-4 py-2 rounded-full border border-orange-900/50">
                            <span className="font-bold text-orange-500 text-lg">{points}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-700">
              {filteredPlayers.map((player, index) => {
                const points = player?.scored?.[position.pointsKey] || 0;
                return (
                  <div key={index} className="p-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Rank */}
                        <div className="flex-shrink-0">
                          {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                          {index === 1 && <Award className="w-6 h-6 text-slate-400" />}
                          {index === 2 && <Award className="w-6 h-6 text-orange-500" />}
                          {index > 2 && (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                              <span className="text-slate-400 font-semibold text-sm">#{index + 1}</span>
                            </div>
                          )}
                        </div>
                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-200 truncate flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            {player.playerName}
                          </p>
                        </div>
                      </div>
                      {/* Points */}
                      <div className="flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 mb-1">Points</p>
                          <p className="text-lg font-bold text-orange-500">{points}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {allPlayers.length > 5 && (
              <div className="px-6 py-4 border-t border-slate-700">
                <Pagination
                  items={allPlayers}
                  itemsPerPage={5}
                  sendDataToParent={(data) => position.setPaginatedList(data)}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Loading state
  if (isLoadingPlayers) {
    return (
      <div className="p-12 text-center bg-[#1e293b] rounded-xl shadow-lg border border-slate-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-slate-400 text-lg">Loading player statistics...</p>
      </div>
    );
  }

  // Empty state when no match is selected
  if (!selectedMatch) {
    return (
      <div className="p-12 text-center bg-[#1e293b] rounded-xl shadow-lg border border-slate-700">
        <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg">Please select a match to view player statistics</p>
      </div>
    );
  }

  // Don't return early - we want to show match summary even if no player data
  // The empty state check was preventing the match summary from showing

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Format time
  const formatTime = (timeArray) => {
    if (!timeArray || timeArray.length === 0) return "N/A";
    const time = timeArray[0];
    return `${time.startTime || "N/A"} - ${time.endTime || "N/A"}`;
  };

  // Get base URL for images
  const baseURL = import.meta.env.VITE_BASE_URL || "";

  // Use either prop or fetched data
  const displayMatchData = matchWiseSummany || fetchedMatchData;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Match Summary Card */}
      {displayMatchData && (
        <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
          {/* Match Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Match Summary
            </h2>
          </div>

          <div className="p-6">
            {/* Teams and Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Team 1 */}
              <div className="text-center">
                <div className="mb-3">
                  {displayMatchData.team1?.teamImage ? (
                    <img
                      src={`${baseURL}/api/${displayMatchData.team1.teamImage.replace(/\\/g, '/')}`}
                      alt={displayMatchData.team1?.teamName || "Team 1"}
                      className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-orange-900/50"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayMatchData.team1?.teamName || "Team 1")}&background=ea580c&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <Users className="w-10 h-10 text-orange-500" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {displayMatchData.team1?.teamName || "Team 1"}
                </h3>
                <p className="text-2xl font-bold text-slate-300">
                  {displayMatchData.team1stPoints?.score || displayMatchData.team1?.matchData?.find(m => m.matchId === selectedMatch)?.goalsScoredByTeam || "0"}
                </p>
              </div>

              {/* VS / Winner Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-slate-500 mb-2">VS</div>
                {displayMatchData.winningTeamName && (
                  <div className="mt-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold shadow-lg shadow-green-900/20">
                    🏆 {displayMatchData.winningTeamName} Won
                  </div>
                )}
                {displayMatchData.isMatchDraw && (
                  <div className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-full text-sm font-semibold shadow-lg shadow-yellow-900/20">
                    Draw
                  </div>
                )}
              </div>

              {/* Team 2 */}
              <div className="text-center">
                <div className="mb-3">
                  {displayMatchData.team2?.teamImage ? (
                    <img
                      src={`${baseURL}/api/${displayMatchData.team2.teamImage.replace(/\\/g, '/')}`}
                      alt={displayMatchData.team2?.teamName || "Team 2"}
                      className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-orange-900/50"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayMatchData.team2?.teamName || "Team 2")}&background=ea580c&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <Users className="w-10 h-10 text-orange-500" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {displayMatchData.team2?.teamName || "Team 2"}
                </h3>
                <p className="text-2xl font-bold text-slate-300">
                  {displayMatchData.team2ndPoints?.score || displayMatchData.team2?.matchData?.find(m => m.matchId === selectedMatch)?.goalsScoredByTeam || "0"}
                </p>
              </div>
            </div>

            {/* Match Details Table */}
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Match Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Date</p>
                    <p className="font-semibold text-slate-200">{formatDate(displayMatchData.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Time</p>
                    <p className="font-semibold text-slate-200">{formatTime(displayMatchData.time)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Location</p>
                    <p className="font-semibold text-slate-200">{displayMatchData.location || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Trophy className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Match Type</p>
                    <p className="font-semibold text-slate-200">{displayMatchData.matchType || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Team Points Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-900/50">
                  <h4 className="font-semibold text-blue-400 mb-2">{displayMatchData.team1?.teamName || "Team 1"}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Points:</span>
                      <span className="font-bold text-blue-500">{displayMatchData.team1stPoints?.points || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Score:</span>
                      <span className="font-bold text-blue-500">{displayMatchData.team1stPoints?.score || "0"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-900/20 rounded-lg border border-red-900/50">
                  <h4 className="font-semibold text-red-400 mb-2">{displayMatchData.team2?.teamName || "Team 2"}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Points:</span>
                      <span className="font-bold text-red-500">{displayMatchData.team2ndPoints?.points || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Score:</span>
                      <span className="font-bold text-red-500">{displayMatchData.team2ndPoints?.score || "0"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Performance Section */}
      {categoryWiseSortedData?.[0] && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" />
            Player Performance Statistics
          </h2>

          {/* Positions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {positions.map((position) => (
              <PositionStats key={position.id} position={position} />
            ))}
          </div>
        </div>
      )}

      {/* Show message if no player data */}
      {!isLoadingPlayers &&
        (!categoryWiseSortedData?.[0] ||
          (!categoryWiseSortedData[0].sortedByRusher?.length &&
            !categoryWiseSortedData[0].sortedByAttacker?.length &&
            !categoryWiseSortedData[0].sortedByDefence?.length &&
            !categoryWiseSortedData[0].sortedByQB?.length)) && (
          <div className="bg-orange-900/20 border border-orange-900/50 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-400 mb-2">No Player Performance Data Available</h3>
                <p className="text-orange-300 text-sm">
                  Match summary is available above, but player performance statistics are not yet recorded for this match.
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default MatchWiseTournamentSummary;
