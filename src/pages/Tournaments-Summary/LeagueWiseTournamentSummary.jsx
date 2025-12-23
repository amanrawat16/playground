import { useEffect, useState } from "react";
import { getTournamentPlayerRankings } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Target, Shield, Zap, TrendingUp, User, Award, AlertCircle } from "lucide-react";
import ReactLoader from "../../common/ReactLoader";

const LeagueWiseTournamentSummary = ({ selectedLeague }) => {
  const navigate = useNavigate()
  const [PlayersData, setPlayersData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  // Position configurations with icons and colors
  const positions = [
    {
      id: "rusher",
      name: "Rushers",
      icon: Zap,
      color: "from-blue-600 to-blue-500",
      dataKey: "rusherSorted",
      pointsKey: "totalRusherPoints",
    },
    {
      id: "attacker",
      name: "Attackers",
      icon: Target,
      color: "from-red-600 to-red-500",
      dataKey: "attackerSorted",
      pointsKey: "totalAttackerPoints",
    },
    {
      id: "defender",
      name: "Defenders",
      icon: Shield,
      color: "from-green-600 to-green-500",
      dataKey: "defenderSorted",
      pointsKey: "totalDefenderPoints",
    },
    {
      id: "qb",
      name: "Quarterbacks",
      icon: Trophy,
      color: "from-purple-600 to-purple-500",
      dataKey: "qbSorted",
      pointsKey: "totalQbPoints",
    },
  ]


  const fetchPlayerPerformances = async () => {
    if (!selectedLeague) {
      setPlayersData({});
      return;
    }

    try {
      setIsLoading(true);
      setPlayersData({});

      // Use V2 API to get rankings
      const response = await getTournamentPlayerRankings(selectedLeague);

      if (response && response.status === 'SUCCESS' && response.rankings) {
        const { topRushers, topDefenders, topQuarterbacks, topAttackers } = response.rankings;

        // Map V2 structure to Component expected structure
        const rusherSorted = (topRushers || []).map(p => ({
          playerId: p._id,
          playerName: p.player?.[0]?.playerName || p.player?.name || 'Unknown',
          teamLogo: p.team?.[0]?.teamImage || p.team?.logo,
          totalRusherPoints: p.rusherPoints || 0
        }));

        const defenderSorted = (topDefenders || []).map(p => ({
          playerId: p._id,
          playerName: p.player?.[0]?.playerName || p.player?.name || 'Unknown',
          teamLogo: p.team?.[0]?.teamImage || p.team?.logo,
          totalDefenderPoints: p.defencePoints || 0
        }));

        const qbSorted = (topQuarterbacks || []).map(p => ({
          playerId: p._id,
          playerName: p.player?.[0]?.playerName || p.player?.name || 'Unknown',
          teamLogo: p.team?.[0]?.teamImage || p.team?.logo,
          totalQbPoints: p.qbPoints || 0
        }));

        const attackerSorted = (topAttackers || []).map(p => ({
          playerId: p._id,
          playerName: p.player?.[0]?.playerName || p.player?.name || 'Unknown',
          teamLogo: p.team?.[0]?.teamImage || p.team?.logo,
          totalAttackerPoints: p.attackerPoints || 0
        }));

        setPlayersData({
          rusherSorted,
          attackerSorted,
          defenderSorted,
          qbSorted
        });

      } else {
        setPlayersData({});
      }
    } catch (error) {
      console.error("Error fetching player performances:", error);
      setPlayersData({});
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPlayerPerformances()
  }, [selectedLeague])

  const handleRowClick = (record) => {
    if (record?.playerId) {
      navigate(`/dashboard/playerProfile/${record.playerId}`);
    }
  };

  // Component to render player stats for a position
  const PositionStats = ({ position }) => {
    const Icon = position.icon;
    const players = PlayersData[position.dataKey] || [];
    const sortedPlayers = [...players].sort((a, b) => (b[position.pointsKey] || 0) - (a[position.pointsKey] || 0));

    return (
      <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden h-full">
        {/* Header */}
        <div className={`bg-gradient-to-r ${position.color} px-6 py-4 border-b border-white/10`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {position.name}
            </h2>
            <span className="ml-auto px-3 py-1 bg-white/20 rounded-full text-white text-sm font-semibold">
              {sortedPlayers.length}
            </span>
          </div>
        </div>

        {/* Content */}
        {sortedPlayers.length === 0 ? (
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
                  <TableRow className="bg-[#0f172a] border-b border-slate-700 hover:bg-[#0f172a]">
                    <TableHead className="font-bold text-slate-300 w-16 text-center py-4">Rank</TableHead>
                    <TableHead className="font-bold text-slate-300 py-4">Player Name</TableHead>
                    <TableHead className="font-bold text-slate-300 text-right py-4 pr-6">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPlayers.map((player, index) => (
                    <TableRow
                      key={player._id || index}
                      className="hover:bg-slate-800/50 cursor-pointer transition-all duration-200 border-b border-slate-700"
                      onClick={() => handleRowClick(player)}
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
                          <span className="font-semibold text-slate-200">{player.playerName || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6">
                        <div className="inline-flex items-center gap-2 bg-orange-900/20 border border-orange-900/50 px-4 py-2 rounded-full">
                          <span className="font-bold text-orange-500 text-lg">
                            {player[position.pointsKey] ?? 0}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-700">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player._id || index}
                  className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(player)}
                >
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
                          {player.playerName || "N/A"}
                        </p>
                      </div>
                    </div>
                    {/* Points */}
                    <div className="flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">Points</p>
                        <p className="text-lg font-bold text-orange-500">
                          {player[position.pointsKey] ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (!selectedLeague) {
    return (
      <div className="p-12 text-center bg-[#1e293b] rounded-xl shadow-lg border border-slate-700">
        <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg">Please select a league to view player statistics</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ReactLoader />
      </div>
    );
  }

  // Check if all positions have no data
  const hasNoData = positions.every(position => {
    const players = PlayersData[position.dataKey] || [];
    return !players || players.length === 0;
  });

  // Check if PlayersData is completely empty or all arrays are empty
  const isEmpty = Object.keys(PlayersData).length === 0 || hasNoData;

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Empty State - No Data at All */}
      {isEmpty ? (
        <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6 border border-slate-700">
              <AlertCircle className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Player Performance Data Available</h3>
            <p className="text-slate-400 mb-4">
              There are no player performance statistics available for this league. Player statistics will appear here once matches are completed and player data is recorded.
            </p>
            <p className="text-sm text-slate-500">
              Please check the browser console for more details about the API response.
            </p>
          </div>
        </div>
      ) : (
        /* Positions Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {positions.map((position) => (
            <PositionStats key={position.id} position={position} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeagueWiseTournamentSummary;
