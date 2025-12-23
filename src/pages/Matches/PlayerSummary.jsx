import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, Trophy, AlertCircle, Save, Loader2,
  Plus, Minus, User, Trash2, CheckCircle, MapPin, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import {
  getMatchPerformancesV2,
  savePlayerPerformanceV2,
  deletePlayerPerformanceV2,
  updateMatchV2,
  getTeamById
} from "../../services/api";

const POINT_MULTIPLIERS = {
  sacks: 1, safeties: 2, firstDowns: 1, interceptions: 2, assists: 6,
  extraPoints1: 2, extraPoints2: 4, returns: 2, pickSixes: 3, touchdowns: 6
};

const PlayerSummary = () => {
  const navigate = useNavigate();
  const { state: initialMatchData } = useLocation();
  const [match, setMatch] = useState(initialMatchData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [scores, setScores] = useState({ home: 0, away: 0 });
  const [playerPerformances, setPlayerPerformances] = useState([]);
  const [deletedPerformanceIds, setDeletedPerformanceIds] = useState(new Set());
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('home');

  // Initial Data Load
  useEffect(() => {
    if (!initialMatchData?._id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const matchId = initialMatchData._id;

        // 1. Setup Scores
        setScores({
          home: initialMatchData.homeScore || 0,
          away: initialMatchData.awayScore || 0
        });

        // 2. Fetch Players (Rosters)
        const homeTeamId = initialMatchData.homeTeam?.team?._id || initialMatchData.homeTeam?._id;
        const awayTeamId = initialMatchData.awayTeam?.team?._id || initialMatchData.awayTeam?._id;

        if (homeTeamId && awayTeamId) {
          const [homeRes, awayRes] = await Promise.all([
            getTeamById(homeTeamId),
            getTeamById(awayTeamId)
          ]);

          const homePlayers = (homeRes.data?.players || homeRes.team?.players || []).map(p => ({
            ...p,
            teamId: initialMatchData.homeTeam._id || initialMatchData.homeTeam,
            teamName: initialMatchData.homeTeam?.team?.teamName || "Home Team",
            teamType: 'home'
          }));

          const awayPlayers = (awayRes.data?.players || awayRes.team?.players || []).map(p => ({
            ...p,
            teamId: initialMatchData.awayTeam._id || initialMatchData.awayTeam,
            teamName: initialMatchData.awayTeam?.team?.teamName || "Away Team",
            teamType: 'away'
          }));

          setAvailablePlayers([...homePlayers, ...awayPlayers]);
        }

        // 3. Fetch Existing Performances
        const perfResponse = await getMatchPerformancesV2(matchId);
        if (perfResponse.status === "SUCCESS") {
          const loadedPerfs = perfResponse.performances.map(p => {
            // Determine team type based on team ID
            const teamIdStr = (p.team?._id || p.team).toString();
            const homeIdStr = (initialMatchData.homeTeam?._id || initialMatchData.homeTeam).toString();
            const isHome = teamIdStr === homeIdStr;

            return {
              _id: p._id, // Add ID to track for deletion
              playerId: p.player?._id || p.player,
              playerName: p.player?.playerName || "Unknown Player",
              teamId: p.team?._id || p.team,
              team: isHome ? 'home' : 'away',
              stats: p.stats || {
                sacks: 0, safeties: 0, firstDowns: 0, interceptions: 0,
                assists: 0, extraPoints1: 0, extraPoints2: 0, returns: 0,
                pickSixes: 0, touchdowns: 0
              }
            };
          });
          setPlayerPerformances(loadedPerfs);
        }

      } catch (error) {
        console.error("Error loading match data:", error);
        toast.error("Failed to load match data. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [initialMatchData]);

  // Helpers
  const calculatePoints = (stats) => {
    const rusher = (stats.sacks || 0) + (stats.safeties || 0) * 2;
    const attacker = (stats.extraPoints1 || 0) * 2 + (stats.firstDowns || 0) + (stats.touchdowns || 0) * 6;
    const defence = (stats.interceptions || 0) * 2 + (stats.returns || 0) * 2 + (stats.pickSixes || 0) * 3;
    const qb = (stats.firstDowns || 0) + (stats.assists || 0) * 6 + (stats.extraPoints1 || 0) * 2 + (stats.extraPoints2 || 0) * 4;
    return { rusher, attacker, defence, qb, total: rusher + attacker + defence + qb };
  };

  const addPlayerPerformance = () => {
    const teamObj = selectedTeam === 'home' ? initialMatchData.homeTeam : initialMatchData.awayTeam;
    const teamId = teamObj._id || teamObj;

    setPlayerPerformances([...playerPerformances, {
      playerId: '',
      playerName: '',
      teamId: teamId,
      team: selectedTeam,
      stats: {
        sacks: 0, safeties: 0, firstDowns: 0, interceptions: 0,
        assists: 0, extraPoints1: 0, extraPoints2: 0, returns: 0,
        pickSixes: 0, touchdowns: 0
      }
    }]);
  };

  const removePlayerPerformance = (index) => {
    const perfToRemove = playerPerformances[index];
    // If it's an existing record (has _id), mark for deletion
    if (perfToRemove._id) { // Should use the performance ID? No, endpoint uses playerId
      // Wait, deletePlayerPerformanceV2 takes (matchId, playerId)
      // If multiple entries for same player (weird but possible), this might delete all?
      // Assuming 1 entry per player per match.
      if (perfToRemove.playerId) {
        setDeletedPerformanceIds(prev => new Set(prev).add(perfToRemove.playerId));
      }
    }
    setPlayerPerformances(playerPerformances.filter((_, i) => i !== index));
  };

  const updatePlayerStat = (index, statName, value) => {
    const updated = [...playerPerformances];
    updated[index].stats[statName] = Math.max(0, parseInt(value) || 0);
    setPlayerPerformances(updated);
  };

  const updatePlayerInfo = (index, field, value) => {
    const updated = [...playerPerformances];
    updated[index][field] = value;
    setPlayerPerformances(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update Match Score
      await updateMatchV2(match._id, {
        homeScore: parseInt(scores.home) || 0,
        awayScore: parseInt(scores.away) || 0,
        status: 'completed'
      });

      // 2. Delete Removed Players
      for (const playerId of deletedPerformanceIds) {
        try {
          await deletePlayerPerformanceV2(match._id, playerId);
        } catch (err) {
          console.warn(`Failed to delete stats for ${playerId}`, err);
        }
      }

      // 3. Save (Upsert) Performances
      for (const perf of playerPerformances) {
        if (perf.playerId && perf.teamId) {
          await savePlayerPerformanceV2(match._id, {
            playerId: perf.playerId,
            teamId: perf.teamId,
            stats: perf.stats
          });
        }
      }

      toast.success("Match scores and player stats saved successfully!");
      setDeletedPerformanceIds(new Set()); // Clear deletion queue

      // Optional: Refresh data? 
      // For now just stay on page or could navigate back

    } catch (error) {
      console.error("Error saving match:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  if (!match) return <div className="p-10 text-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-6 sm:py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <ToastContainer position="top-center" theme="dark" autoClose={2000} />

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-2 flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 p-0"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Matches
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
              Update Match Details
            </h1>
            <p className="text-slate-400 flex items-center gap-2 mt-1">
              <Trophy className="w-4 h-4 text-orange-500" />
              {match.homeTeam?.team?.teamName || "Home"} vs {match.awayTeam?.team?.teamName || "Away"}
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white px-8 py-6 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save All Changes
          </Button>
        </div>

        {/* Score Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" /> Match Result
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Home Score */}
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 flex flex-col items-center">
              <span className="text-slate-400 mb-2 font-medium uppercase tracking-wider">{match.homeTeam?.team?.teamName || "Home"}</span>
              <div className="relative w-full max-w-[150px]">
                <input
                  type="number"
                  min="0"
                  value={scores.home}
                  onChange={(e) => setScores({ ...scores, home: e.target.value })}
                  className="w-full bg-slate-800 text-5xl font-bold text-center py-4 rounded-xl border-2 border-slate-600 focus:border-orange-500 focus:outline-none text-white transition-all"
                />
              </div>
            </div>
            {/* Away Score */}
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 flex flex-col items-center">
              <span className="text-slate-400 mb-2 font-medium uppercase tracking-wider">{match.awayTeam?.team?.teamName || "Away"}</span>
              <div className="relative w-full max-w-[150px]">
                <input
                  type="number"
                  min="0"
                  value={scores.away}
                  onChange={(e) => setScores({ ...scores, away: e.target.value })}
                  className="w-full bg-slate-800 text-5xl font-bold text-center py-4 rounded-xl border-2 border-slate-600 focus:border-blue-500 focus:outline-none text-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Player Stats Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Player Statistics
              </h2>
              <p className="text-slate-400 text-sm">Add players and record their performance</p>
            </div>

            <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-700">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="bg-slate-800 text-white border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="home">{match.homeTeam?.team?.teamName || "Home Team"}</option>
                <option value="away">{match.awayTeam?.team?.teamName || "Away Team"}</option>
              </select>
              <Button size="sm" onClick={addPlayerPerformance} className="bg-orange-600 hover:bg-orange-500">
                <Plus className="w-4 h-4 mr-1" /> Add Player
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-2" />
              <p className="text-slate-500">Loading player data...</p>
            </div>
          ) : playerPerformances.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-700 border-dashed">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No player stats recorded</p>
              <p className="text-slate-500 text-sm">Use the "Add Player" button above to start tracking stats.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {playerPerformances.map((perf, index) => {
                const points = calculatePoints(perf.stats);
                const isHome = perf.team === 'home';

                return (
                  <div key={index} className={`bg-slate-900/60 border ${isHome ? 'border-l-4 border-l-orange-500 border-y-slate-700 border-r-slate-700' : 'border-l-4 border-l-blue-500 border-y-slate-700 border-r-slate-700'} rounded-xl p-4 transition-all hover:bg-slate-900`}>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-full ${isHome ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 max-w-sm">
                          {perf.playerId ? (
                            <div className="font-bold text-lg">{perf.playerName}</div>
                          ) : (
                            <select
                              value={perf.playerId}
                              onChange={(e) => {
                                const player = availablePlayers.find(p => p._id === e.target.value);
                                if (player) {
                                  updatePlayerInfo(index, 'playerId', player._id);
                                  updatePlayerInfo(index, 'playerName', player.playerName);
                                }
                              }}
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                            >
                              <option value="">Select Player...</option>
                              {availablePlayers
                                .filter(p => p.teamType === perf.team)
                                .map(p => (
                                  <option key={p._id} value={p._id}>
                                    {p.playerName} ({p.position || 'Player'})
                                  </option>
                                ))
                              }
                            </select>
                          )}
                          <div className={`text-xs uppercase font-bold tracking-wider mt-1 ${isHome ? 'text-orange-400' : 'text-blue-400'}`}>
                            {isHome ? 'Home Team' : 'Away Team'}
                          </div>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" onClick={() => removePlayerPerformance(index)} className="text-slate-500 hover:text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Stats Grid - Disabled until player selected */}
                    <div className={`grid grid-cols-2 md:grid-cols-5 gap-3 ${!perf.playerId ? 'opacity-50 pointer-events-none' : ''}`}>
                      {Object.keys(perf.stats).map(statKey => (
                        <div key={statKey} className="relative group">
                          <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 pl-1">
                            {statKey.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={perf.stats[statKey]}
                            onChange={(e) => updatePlayerStat(index, statKey, e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-center font-mono text-sm focus:border-orange-500 focus:outline-none text-white group-hover:bg-slate-700/50 transition-colors"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Points Summary */}
                    {perf.playerId && (
                      <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap gap-3 text-xs">
                        <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">Rusher: <b className="text-white">{points.rusher}</b></span>
                        <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">Attacker: <b className="text-white">{points.attacker}</b></span>
                        <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">Defence: <b className="text-white">{points.defence}</b></span>
                        <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">QB: <b className="text-white">{points.qb}</b></span>
                        <span className="ml-auto bg-green-900/30 text-green-400 px-3 py-1 rounded-full font-bold border border-green-500/30">
                          Total Points: {points.total}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerSummary;
