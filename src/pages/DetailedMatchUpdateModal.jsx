import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trophy, Save, Loader, User, AlertCircle, RefreshCw, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DetailedMatchUpdateModal = ({ isOpen, onClose, match, onSuccess, tournamentId }) => {
    const [loading, setLoading] = useState(false);
    const [tournamentTeams, setTournamentTeams] = useState([]);
    const [scores, setScores] = useState({
        home: match?.scores?.home || 0,
        away: match?.scores?.away || 0
    });
    const [replacementTeams, setReplacementTeams] = useState({ home: '', away: '' });
    const [playerPerformances, setPlayerPerformances] = useState([]);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('home');
    const [isCompleted, setIsCompleted] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [location, setLocation] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    // Points calculation formulas (matching backend)
    const POINT_MULTIPLIERS = {
        sacks: 1,
        safeties: 2,
        firstDowns: 1,
        interceptions: 2,
        assists: 6,
        extraPoints1: 2,
        extraPoints2: 4,
        returns: 2,
        pickSixes: 3,
        touchdowns: 6
    };

    useEffect(() => {
        if (isOpen && match) {
            // Fetch players from both teams
            fetchTeamPlayers();
            fetchTournamentTeams();
            fetchExistingPerformances();
            setScores({
                home: match.homeScore || 0,
                away: match.awayScore || 0
            });
            setIsCompleted(match.status === 'completed');
            setReplacementTeams({ home: '', away: '' });
            setScheduledAt(match.scheduledAt ? new Date(match.scheduledAt).toISOString().split('T')[0] : '');
            setScheduledTime(match.scheduledTime || '');
            setLocation(match.location || '');
        }
    }, [isOpen, match, tournamentId]);

    // Fetch players when teams change (either via replacement or initial load)
    useEffect(() => {
        if (isOpen && (match || replacementTeams.home || replacementTeams.away)) {
            fetchTeamPlayers();
        }
    }, [isOpen, replacementTeams.home, replacementTeams.away, tournamentTeams]);

    const fetchTournamentTeams = async () => {
        if (!tournamentId) return;
        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${tournamentId}/teams`, {
                headers: { api_key: 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setTournamentTeams(response.data.teams);
            }
        } catch (error) {
            console.error('Error fetching tournament teams:', error);
        }
    };

    const fetchTeamPlayers = async () => {
        try {
            const homeV2TeamId = replacementTeams.home || match?.homeTeam?._id;
            const awayV2TeamId = replacementTeams.away || match?.awayTeam?._id;

            const homeV2Team = tournamentTeams.find(t => t._id === homeV2TeamId) || match?.homeTeam;
            const awayV2Team = tournamentTeams.find(t => t._id === awayV2TeamId) || match?.awayTeam;

            if (!homeV2Team?.team?._id || !awayV2Team?.team?._id) return;

            const [homeResponse, awayResponse] = await Promise.all([
                axios.get(`${API_BASE}/api/comp/team/getTeam/${homeV2Team.team._id}`, {
                    headers: { api_key: 'THE123FIELD' }
                }),
                axios.get(`${API_BASE}/api/comp/team/getTeam/${awayV2Team.team._id}`, {
                    headers: { api_key: 'THE123FIELD' }
                })
            ]);

            const homeTeamData = homeResponse.data.data || homeResponse.data.team;
            const awayTeamData = awayResponse.data.data || awayResponse.data.team;

            const homePlayers = (homeTeamData?.players || []).map(p => ({
                ...p,
                teamId: homeV2TeamId,
                teamName: homeV2Team.team.teamName,
                teamType: 'home'
            }));

            const awayPlayers = (awayTeamData?.players || []).map(p => ({
                ...p,
                teamId: awayV2TeamId,
                teamName: awayV2Team.team.teamName,
                teamType: 'away'
            }));

            setAvailablePlayers([...homePlayers, ...awayPlayers]);
        } catch (error) {
            console.error('Error fetching players:', error);
            toast.error('Failed to load players');
        }
    };

    const fetchExistingPerformances = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/v2/matches/${match._id}/player-stats`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                const performances = response.data.performances.map(p => ({
                    playerId: p.player?._id,
                    playerName: p.player?.playerName,
                    teamId: p.team?._id,
                    team: p.team?._id === match.homeTeam?._id ? 'home' : 'away',
                    stats: p.stats
                }));
                setPlayerPerformances(performances);
            }
        } catch (error) {
            console.error('Error fetching existing performances:', error);
        }
    };

    const calculatePlayerPoints = (stats) => {
        const rusher = (stats.sacks || 0) * POINT_MULTIPLIERS.sacks +
            (stats.safeties || 0) * POINT_MULTIPLIERS.safeties;

        const attacker = (stats.extraPoints1 || 0) * POINT_MULTIPLIERS.extraPoints1 +
            (stats.firstDowns || 0) * POINT_MULTIPLIERS.firstDowns +
            (stats.touchdowns || 0) * POINT_MULTIPLIERS.touchdowns;

        const defence = (stats.interceptions || 0) * POINT_MULTIPLIERS.interceptions +
            (stats.returns || 0) * POINT_MULTIPLIERS.returns +
            (stats.pickSixes || 0) * POINT_MULTIPLIERS.pickSixes;

        const qb = (stats.firstDowns || 0) * POINT_MULTIPLIERS.firstDowns +
            (stats.assists || 0) * POINT_MULTIPLIERS.assists +
            (stats.extraPoints1 || 0) * POINT_MULTIPLIERS.extraPoints1 +
            (stats.extraPoints2 || 0) * POINT_MULTIPLIERS.extraPoints2;

        return { rusher, attacker, defence, qb, total: rusher + attacker + defence + qb };
    };

    const addPlayerPerformance = () => {
        setPlayerPerformances([...playerPerformances, {
            playerId: '',
            playerName: '',
            teamId: selectedTeam === 'home' ? match?.homeTeam?._id : match?.awayTeam?._id,
            team: selectedTeam,
            stats: {
                sacks: 0,
                safeties: 0,
                firstDowns: 0,
                interceptions: 0,
                assists: 0,
                extraPoints1: 0,
                extraPoints2: 0,
                returns: 0,
                pickSixes: 0,
                touchdowns: 0
            }
        }]);
    };

    const removePlayerPerformance = (index) => {
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

    const handleSubmit = async () => {
        // Validate scores
        if (scores.home === '' || scores.away === '') {
            toast.error('Please enter scores for both teams');
            return;
        }

        setLoading(true);
        try {
            // Update match with scores
            await axios.put(
                `${API_BASE}/api/v2/matches/${match._id}`,
                {
                    homeScore: parseInt(scores.home) || 0,
                    awayScore: parseInt(scores.away) || 0,
                    status: isCompleted ? 'completed' : 'scheduled',
                    scheduledAt: scheduledAt || null,
                    scheduledTime: scheduledTime || null,
                    location: location || null,
                    ...(replacementTeams.home && { homeTeam: replacementTeams.home }),
                    ...(replacementTeams.away && { awayTeam: replacementTeams.away })
                },
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            // Save player performances
            for (const perf of playerPerformances) {
                if (perf.playerId && perf.teamId) {
                    await axios.post(
                        `${API_BASE}/api/v2/matches/${match._id}/player-stats`,
                        {
                            playerId: perf.playerId,
                            teamId: perf.teamId,
                            stats: perf.stats
                        },
                        { headers: { 'api_key': 'THE123FIELD' } }
                    );
                }
            }

            toast.success('Match and player statistics updated successfully!');
            if (onSuccess) onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error updating match:', error);
            toast.error(error.response?.data?.message || 'Failed to update match');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMatch = async () => {
        if (!window.confirm("Are you sure you want to delete this match? This will also delete all player performances for this match and update standings.")) return;

        setLoading(true);
        try {
            await axios.delete(
                `${API_BASE}/api/v2/matches/${match._id}`,
                { headers: { 'api_key': 'THE123FIELD' } }
            );
            toast.success('Match deleted successfully');
            if (onSuccess) onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error deleting match:', error);
            toast.error(error.response?.data?.message || 'Failed to delete match');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setScores({ home: 0, away: 0 });
        setPlayerPerformances([]);
        setSelectedTeam('home');
        onClose();
    };

    if (!isOpen || !match) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-orange-500" />
                            Update Match & Player Stats
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            {match.homeTeam?.team?.teamName} vs {match.awayTeam?.team?.teamName}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Scores Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Match Scores</h3>

                        {/* Team Replacement UI (Only if match not completed) */}
                        {match.status !== 'completed' && (
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <RefreshCw className="w-4 h-4 text-slate-400" />
                                        <label className="text-xs text-slate-400">Replace Home Team</label>
                                    </div>
                                    <select
                                        value={replacementTeams.home}
                                        onChange={(e) => setReplacementTeams({ ...replacementTeams, home: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                                    >
                                        <option value="">Keep {match.homeTeam?.team?.teamName}</option>
                                        {tournamentTeams.map(t => (
                                            <option key={t._id} value={t._id}>{t.team.teamName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <RefreshCw className="w-4 h-4 text-slate-400" />
                                        <label className="text-xs text-slate-400">Replace Away Team</label>
                                    </div>
                                    <select
                                        value={replacementTeams.away}
                                        onChange={(e) => setReplacementTeams({ ...replacementTeams, away: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                                    >
                                        <option value="">Keep {match.awayTeam?.team?.teamName}</option>
                                        {tournamentTeams.map(t => (
                                            <option key={t._id} value={t._id}>{t.team.teamName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {replacementTeams.home ? tournamentTeams.find(t => t._id === replacementTeams.home)?.team?.teamName : (match.homeTeam?.team?.teamName || 'Home Team')}
                                </label>
                                <input
                                    type="number"
                                    value={scores.home}
                                    onChange={(e) => setScores({ ...scores, home: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-2xl font-bold text-center focus:outline-none focus:border-orange-500"
                                    min="0"
                                />
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {replacementTeams.away ? tournamentTeams.find(t => t._id === replacementTeams.away)?.team?.teamName : (match.awayTeam?.team?.teamName || 'Away Team')}
                                </label>
                                <input
                                    type="number"
                                    value={scores.away}
                                    onChange={(e) => setScores({ ...scores, away: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-2xl font-bold text-center focus:outline-none focus:border-orange-500"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Scheduling Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
                            <div>
                                <label className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                    <Calendar className="w-3 h-3" /> Date
                                </label>
                                <input
                                    type="date"
                                    value={scheduledAt}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                    <Clock className="w-3 h-3" /> Time
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 14:00"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                    <MapPin className="w-3 h-3" /> Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Field 1"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                        </div>

                        {/* Status Selection */}
                        <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isCompleted}
                                    onChange={(e) => setIsCompleted(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-800"
                                />
                                <div>
                                    <span className="text-white font-medium">Mark match as completed</span>
                                    <p className="text-xs text-slate-400">This will update standings and final results</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Player Performances Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Player Performance Stats</h3>
                            <div className="flex gap-2">
                                <select
                                    value={selectedTeam}
                                    onChange={(e) => setSelectedTeam(e.target.value)}
                                    className={`px-3 py-2 border rounded-lg text-white text-sm focus:outline-none transition-all ${selectedTeam === 'home'
                                        ? 'bg-blue-900/30 border-blue-500/30 text-blue-100'
                                        : 'bg-emerald-900/30 border-emerald-500/30 text-emerald-100'
                                        }`}
                                >
                                    <option value="home">{match.homeTeam?.team?.teamName || 'Home'}</option>
                                    <option value="away">{match.awayTeam?.team?.teamName || 'Away'}</option>
                                </select>
                                <button
                                    onClick={addPlayerPerformance}
                                    className={`px-4 py-2 text-white rounded-lg font-medium flex items-center gap-2 text-sm transition-all shadow-lg ${selectedTeam === 'home'
                                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                        }`}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Player
                                </button>
                            </div>
                        </div>

                        {playerPerformances.length === 0 ? (
                            <div className="bg-slate-900/30 border border-slate-700 rounded-xl p-8 text-center">
                                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                                <p className="text-slate-400">No player statistics added yet</p>
                                <p className="text-sm text-slate-500 mt-1">Click &quot;Add Player&quot; to record player performance</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {playerPerformances.map((perf, index) => {
                                    const points = calculatePlayerPoints(perf.stats);
                                    const isHome = perf.team === 'home';

                                    return (
                                        <div
                                            key={index}
                                            className={`rounded-xl p-4 transition-all duration-300 border ${isHome
                                                ? 'bg-blue-500/5 border-blue-500/30'
                                                : 'bg-emerald-500/5 border-emerald-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <User className={`w-5 h-5 ${isHome ? 'text-blue-400' : 'text-emerald-400'}`} />
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${isHome ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                                                            }`}>
                                                            {isHome ? (match.homeTeam?.team?.teamName || 'Home') : (match.awayTeam?.team?.teamName || 'Away')}
                                                        </span>
                                                    </div>
                                                    <select
                                                        value={perf.playerId}
                                                        onChange={(e) => {
                                                            const player = availablePlayers.find(p => p._id === e.target.value);
                                                            if (player) {
                                                                updatePlayerInfo(index, 'playerId', player._id);
                                                                updatePlayerInfo(index, 'playerName', player.playerName);
                                                            }
                                                        }}
                                                        className={`flex-1 px-3 py-2 bg-slate-800/80 border rounded-lg text-white focus:outline-none transition-colors ${isHome ? 'border-blue-500/30 focus:border-blue-500' : 'border-emerald-500/30 focus:border-emerald-500'
                                                            }`}
                                                    >
                                                        <option value="">Select Player</option>
                                                        {availablePlayers
                                                            .filter(p => p.teamType === perf.team)
                                                            .map(player => (
                                                                <option key={player._id} value={player._id}>
                                                                    {player.playerName} ({player.position})
                                                                </option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => removePlayerPerformance(index)}
                                                    className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Minus className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                                {Object.keys(perf.stats).map(stat => (
                                                    <div key={stat}>
                                                        <label className="block text-xs text-slate-400 mb-1 capitalize">
                                                            {stat.replace(/([A-Z])/g, ' $1').trim()}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={perf.stats[stat]}
                                                            onChange={(e) => updatePlayerStat(index, stat, e.target.value)}
                                                            className={`w-full px-2 py-1.5 bg-slate-800/50 border rounded text-white text-sm text-center focus:outline-none transition-colors ${isHome ? 'border-blue-500/20 focus:border-blue-500' : 'border-emerald-500/20 focus:border-emerald-500'
                                                                }`}
                                                            min="0"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Points Display */}
                                            <div className="flex gap-2 text-xs flex-wrap">
                                                <div className="bg-blue-900/20 border border-blue-700/50 px-3 py-1.5 rounded-full">
                                                    <span className="text-blue-400 font-medium">Rusher: {points.rusher}</span>
                                                </div>
                                                <div className="bg-red-900/20 border border-red-700/50 px-3 py-1.5 rounded-full">
                                                    <span className="text-red-400 font-medium">Attacker: {points.attacker}</span>
                                                </div>
                                                <div className="bg-green-900/20 border border-green-700/50 px-3 py-1.5 rounded-full">
                                                    <span className="text-green-400 font-medium">Defence: {points.defence}</span>
                                                </div>
                                                <div className="bg-purple-900/20 border border-purple-700/50 px-3 py-1.5 rounded-full">
                                                    <span className="text-purple-400 font-medium">QB: {points.qb}</span>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full border shadow-sm ${isHome
                                                    ? 'bg-blue-500/10 border-blue-500/40 shadow-blue-500/5'
                                                    : 'bg-emerald-500/10 border-emerald-500/40 shadow-emerald-500/5'
                                                    }`}>
                                                    <span className={`font-bold ${isHome ? 'text-blue-400' : 'text-emerald-400'}`}>
                                                        Total Points: {points.total}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex flex-wrap gap-3 bg-slate-900/50">
                    <button
                        type="button"
                        onClick={handleDeleteMatch}
                        disabled={loading}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-xl transition-all font-medium flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-5 h-5" />
                        Delete Match
                    </button>
                    <div className="flex-1"></div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 disabled:opacity-50 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Match & Stats
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailedMatchUpdateModal;
