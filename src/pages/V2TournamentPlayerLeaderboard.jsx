import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Trophy,
    Target,
    Shield,
    Zap,
    User,
    Award,
    AlertCircle,
    Filter,
    TrendingUp,
    ArrowLeft
} from 'lucide-react';

const V2TournamentPlayerLeaderboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [leaderboard, setLeaderboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPosition, setSelectedPosition] = useState('rusher');
    const [selectedStage, setSelectedStage] = useState('all');

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    // Position configurations
    const positions = [
        {
            id: 'rusher',
            name: 'Rushers',
            icon: Zap,
            color: 'from-blue-600 to-blue-500',
            dataKey: 'rusherLeaderboard',
            pointsKey: 'totalRusherPoints',
        },
        {
            id: 'attacker',
            name: 'Attackers',
            icon: Target,
            color: 'from-red-600 to-red-500',
            dataKey: 'attackerLeaderboard',
            pointsKey: 'totalAttackerPoints',
        },
        {
            id: 'defender',
            name: 'Defenders',
            icon: Shield,
            color: 'from-green-600 to-green-500',
            dataKey: 'defenderLeaderboard',
            pointsKey: 'totalDefenderPoints',
        },
        {
            id: 'qb',
            name: 'Quarterbacks',
            icon: Trophy,
            color: 'from-purple-600 to-purple-500',
            dataKey: 'qbLeaderboard',
            pointsKey: 'totalQbPoints',
        },
    ];

    const stages = [
        { value: 'all', label: 'All Stages' },
        { value: 'regular_round', label: 'Regular Rounds' },
        { value: 'quarter_final', label: 'Quarter Finals' },
        { value: 'semi_final', label: 'Semi Finals' },
        { value: 'final', label: 'Finals' },
    ];

    useEffect(() => {
        fetchTournament();
        fetchLeaderboard();
    }, [id, selectedStage]);

    const fetchTournament = async () => {
        try {
            const response = await axios.get(
                `${API_BASE}/api/v2/tournaments/${id}`,
                { headers: { 'api_key': 'THE123FIELD' } }
            );
            setTournament(response.data.tournament);
        } catch (error) {
            console.error('Error fetching tournament:', error);
            toast.error('Failed to load tournament');
        }
    };

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const params = selectedStage !== 'all' ? `?stage=${selectedStage}` : '';
            const response = await axios.get(
                `${API_BASE}/api/v2/tournaments/${id}/player-leaderboard${params}`,
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                setLeaderboard(response.data.leaderboard);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            toast.error('Failed to load player leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const currentPosition = positions.find(p => p.id === selectedPosition);
    const players = leaderboard?.[currentPosition?.dataKey] || [];

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => navigate(`/dashboard/tournaments/${id}`)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-slate-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Player Leaderboard</h1>
                            <p className="text-slate-400 text-sm mt-1">{tournament?.name}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-slate-400" />
                            <select
                                value={selectedStage}
                                onChange={(e) => setSelectedStage(e.target.value)}
                                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                            >
                                {stages.map(stage => (
                                    <option key={stage.value} value={stage.value}>
                                        {stage.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Position Tabs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {positions.map(position => {
                        const Icon = position.icon;
                        const isActive = selectedPosition === position.id;
                        return (
                            <button
                                key={position.id}
                                onClick={() => setSelectedPosition(position.id)}
                                className={`p-4 rounded-xl border-2 transition-all ${isActive
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-gradient-to-r ${position.color}`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-white">{position.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {leaderboard?.[position.dataKey]?.length || 0} players
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Leaderboard Card */}
                <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                    {/* Card Header */}
                    <div className={`bg-gradient-to-r ${currentPosition.color} px-6 py-4 border-b border-white/20`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <currentPosition.icon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">
                                {currentPosition.name} Leaderboard
                            </h2>
                            <span className="ml-auto px-3 py-1 bg-white/20 rounded-full text-white text-sm font-semibold">
                                {players.length}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">Loading leaderboard...</p>
                        </div>
                    ) : players.length === 0 ? (
                        <div className="p-12 text-center">
                            <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">No player data available</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#0f172a] border-b border-slate-700">
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-300 w-20">Rank</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-300">Player</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-300">Team</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-300">Matches</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-slate-300">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {players.map((player, index) => (
                                        <tr
                                            key={player.playerId}
                                            className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center">
                                                    {index === 0 && (
                                                        <div className="w-10 h-10 rounded-full bg-yellow-900/30 border border-yellow-700/50 flex items-center justify-center">
                                                            <Trophy className="w-6 h-6 text-yellow-500" />
                                                        </div>
                                                    )}
                                                    {index === 1 && (
                                                        <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                                                            <Award className="w-6 h-6 text-slate-400" />
                                                        </div>
                                                    )}
                                                    {index === 2 && (
                                                        <div className="w-10 h-10 rounded-full bg-orange-900/30 border border-orange-700/50 flex items-center justify-center">
                                                            <Award className="w-6 h-6 text-orange-500" />
                                                        </div>
                                                    )}
                                                    {index > 2 && (
                                                        <span className="text-slate-400 font-bold text-lg">#{index + 1}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{player.playerName}</p>
                                                        {player.position && (
                                                            <p className="text-xs text-slate-400">{player.position}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-slate-300">{player.team?.team?.teamName || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300">
                                                    {player.matchesPlayed}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-2 bg-orange-900/20 px-4 py-2 rounded-full border border-orange-900/50">
                                                    <TrendingUp className="w-4 h-4 text-orange-400" />
                                                    <span className="font-bold text-orange-500 text-lg">
                                                        {player[currentPosition.pointsKey] || 0}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default V2TournamentPlayerLeaderboard;
