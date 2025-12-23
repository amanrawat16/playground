import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    ArrowLeft,
    Calendar,
    Filter,
    Edit,
    Trophy,
    Clock,
    MapPin,
    Loader,
    Shuffle,
    Shield,
    Medal,
    AlertCircle
} from 'lucide-react';
import KnockoutGeneratorModal from './KnockoutGeneratorModal';
import PromotionModal from './PromotionModal';
import StageSkipModal from './StageSkipModal';
import DetailedMatchUpdateModal from './DetailedMatchUpdateModal';
import WildcardTeamModal from './WildcardTeamModal';
import CreateMatchModal from './CreateMatchModal';
import EndTournamentModal from './EndTournamentModal';

const TournamentMatches = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const stageFilter = searchParams.get('stage');

    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStage, setSelectedStage] = useState(stageFilter || 'all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [editingMatch, setEditingMatch] = useState(null);
    const [scores, setScores] = useState({ homeScore: 0, awayScore: 0 });
    const [standings, setStandings] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
    const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
    const [nextRoundStage, setNextRoundStage] = useState('');
    const [isDetailedMatchModalOpen, setIsDetailedMatchModalOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [isWildcardModalOpen, setIsWildcardModalOpen] = useState(false);
    const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);
    const [isEndTournamentModalOpen, setIsEndTournamentModalOpen] = useState(false);
    const [groups, setGroups] = useState([]);

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (stageFilter) {
            setSelectedStage(stageFilter);
        }
    }, [stageFilter]);

    useEffect(() => {
        fetchTournamentDetails();
        fetchMatches();
        fetchGroups();
        // Fetch standings for current stage
        if (selectedStage && selectedStage !== 'all') {
            fetchStandings(selectedStage);
            if (selectedStage !== 'regular_round') {
                fetchStageTeams();
            }
        } else if (selectedStage === 'regular_round') {
            fetchStandings('regular_round');
        }
    }, [id, selectedStage, selectedStatus]);

    const fetchTournamentDetails = async () => {
        try {
            setLoading(true); // Ensure main loading state is active
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${id}`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setTournament(response.data.tournament);
                setError(null);
            } else {
                // If status is not SUCCESS, consider it an error or handle appropriately
                setError('Failed to load tournament details');
            }
        } catch (error) {
            console.error('Error fetching tournament:', error);
            // Specific check for 404 to show "Not Found" message
            setError(error.response?.status === 404 ? 'Tournament Not Found' : 'Error loading tournament');
            setTournament(null); // Clear tournament data on error
        } finally {
            setIsLoading(false);
            // Note: We don't set setLoading(false) here because fetchMatches might still be running.
            // But if we have an error, we should probably stop the main loading spinner?
            // Let's rely on the error state to show the error UI which overrides the loading spinner if needed, 
            // OR ensure we stop loading.
            if (error) setLoading(false);
        }
    };

    const fetchMatches = async () => {
        try {
            let url = `${API_BASE}/api/v2/tournaments/${id}/matches`;
            const params = new URLSearchParams();

            if (selectedStage !== 'all') params.append('stage', selectedStage);
            if (selectedStatus !== 'all') params.append('status', selectedStatus);

            if (params.toString()) url += `?${params.toString()}`;

            const response = await axios.get(url, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setMatches(response.data.matches || []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching matches:', error);
            setLoading(false);
        }
    };

    // New: Fetch Qualified Teams for Knockout Stages
    const [stageTeams, setStageTeams] = useState([]);
    const fetchStageTeams = async () => {
        if (selectedStage === 'regular_round' || selectedStage === 'all') return;

        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${id}/teams`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                let teams = [];
                if (selectedStage === 'quarter_final') teams = response.data.teams.filter(t => t.progression?.inQuarterFinals);
                else if (selectedStage === 'semi_final') teams = response.data.teams.filter(t => t.progression?.inSemiFinals);
                else if (selectedStage === 'final') teams = response.data.teams.filter(t => t.progression?.inFinals);
                setStageTeams(teams);
            }
        } catch (error) {
            console.error('Error fetching stage teams:', error);
        }
    };

    const fetchStandings = async (stage = null) => {
        try {
            let url = `${API_BASE}/api/v2/tournaments/${id}/standings`;
            if (stage && stage !== 'all') {
                url += `?stage=${stage}`;
            }

            const response = await axios.get(url, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setStandings(response.data.standings);
            }
        } catch (error) {
            console.error('Error fetching standings:', error);
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${id}/groups`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setGroups(response.data.groups || []);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handlePromoteTeams = (nextStage) => {
        setNextRoundStage(nextStage);
        setIsPromotionModalOpen(true);
    };

    const handlePromotionSuccess = () => {
        setIsPromotionModalOpen(false);
        // Refresh tournament details and navigate to next stage
        fetchTournamentDetails();
        setTimeout(() => {
            // Navigate to the next stage view
            window.location.reload();
        }, 1500);
    };

    const getGroupedMatches = () => {
        if (selectedStage !== 'regular_round' && selectedStage !== 'all') return { 'All Matches': matches };

        const grouped = {};
        matches.forEach(match => {
            const groupName = match.group?.name || 'Unassigned';
            if (!grouped[groupName]) {
                grouped[groupName] = [];
            }
            grouped[groupName].push(match);
        });
        return grouped;
    };

    const handleSkipStageSuccess = (targetStage) => {
        setIsSkipModalOpen(false);
        fetchTournamentDetails();
        fetchMatches();

        if (targetStage) {
            setTimeout(() => {
                navigate(`/dashboard/tournaments/${id}/matches?stage=${targetStage}`);
            }, 500);
        }
    };

    const handleGenerateNextRound = (nextStage) => {
        setNextRoundStage(nextStage);
        setIsGeneratorOpen(true);
    };

    const handleUpdateScore = async () => {
        if (!editingMatch) return;

        try {
            const response = await axios.put(
                `${API_BASE}/api/v2/matches/${editingMatch}`,
                {
                    homeScore: parseInt(scores.homeScore),
                    awayScore: parseInt(scores.awayScore),
                    status: 'completed'
                },
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('Match updated! Standings recalculated automatically.');
                setEditingMatch(null);
                setScores({ homeScore: 0, awayScore: 0 });
                fetchMatches();
                fetchStandings(); // Refresh standings
            }
        } catch (error) {
            console.error('Error updating match:', error);
            toast.error('Failed to update match');
        }
    };

    const handleEditMatch = (match) => {
        setSelectedMatch(match);
        setIsDetailedMatchModalOpen(true);
    };

    const getStatusBadge = (status) => {
        const styles = {
            scheduled: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
            live: 'bg-green-600/20 text-green-400 border-green-600/30',
            completed: 'bg-slate-600/20 text-slate-400 border-slate-600/30',
            cancelled: 'bg-red-600/20 text-red-400 border-red-600/30'
        };
        return styles[status] || styles.scheduled;
    };

    const getStageName = (stage) => {
        const names = {
            'regular_round': 'Group Stage',
            'quarter_final': 'Quarter Final',
            'semi_final': 'Semi Final',
            'final': 'Final',
            'third_place': '3rd Place'
        };
        return names[stage] || stage;
    };

    const stages = [
        { value: 'all', label: 'All Stages' },
        { value: 'regular_round', label: 'Group Stage' },
        { value: 'quarter_final', label: 'Quarter Finals' },
        { value: 'semi_final', label: 'Semi Finals' },
        { value: 'final', label: 'Finals' }
    ];

    const statuses = [
        { value: 'all', label: 'All Status' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Completed' }
    ];

    const stats = {
        total: matches.length,
        scheduled: matches.filter(m => m.status === 'scheduled').length,
        completed: matches.filter(m => m.status === 'completed').length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-slate-200">
            <ToastContainer theme="dark" position="top-right" />

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate(`/dashboard/tournaments/${id}`)}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Tournament
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Matches</h1>
                                <p className="text-slate-400 mt-1">{tournament?.name}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setIsWildcardModalOpen(true)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors border border-slate-600"
                            >
                                <Shield className="w-4 h-4" />
                                Add Wildcard Team
                            </button>

                            <button
                                onClick={() => setIsCreateMatchModalOpen(true)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors border border-slate-600"
                            >
                                <Plus className="w-4 h-4" />
                                Create Match
                            </button>

                            {stageFilter && stageFilter !== 'all' && stageFilter !== 'final' && (
                                <button
                                    onClick={() => setIsSkipModalOpen(true)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors border border-slate-600"
                                >
                                    <Shuffle className="w-4 h-4" />
                                    Skip Stage
                                </button>
                            )}

                            {/* Promotion Actions */}
                            {selectedStage === 'regular_round' && tournament && (
                                <button
                                    onClick={() => handlePromoteTeams('quarter_final')}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-orange-500/20"
                                >
                                    {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                                    End Group Stage
                                </button>
                            )}

                            {selectedStage === 'quarter_final' && tournament && (
                                <button
                                    onClick={() => handlePromoteTeams('semi_final')}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-purple-500/20"
                                >
                                    <Trophy className="w-4 h-4" />
                                    Promote to SF
                                </button>
                            )}

                            {selectedStage === 'semi_final' && tournament && (
                                <button
                                    onClick={() => handlePromoteTeams('final')}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-purple-500/20"
                                >
                                    <Trophy className="w-4 h-4" />
                                    Promote to Final
                                </button>
                            )}
                            {/* End Tournament Button */}
                            {selectedStage === 'final' && tournament && (
                                <button
                                    onClick={() => {
                                        console.log("End Tournament Button Clicked");
                                        console.log("Current Matches:", matches);
                                        setIsEndTournamentModalOpen(true);
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/20"
                                >
                                    <Medal className="w-4 h-4" />
                                    End Tournament
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader className="w-12 h-12 text-orange-500 animate-spin" />
                    <p className="text-slate-400 font-medium">Loading Tournament Details...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{error}</h2>
                        <p className="text-slate-400 max-w-md mx-auto">
                            We couldn't find the tournament you're looking for. It may have been deleted or the link might be incorrect.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/tournaments')}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors"
                    >
                        Back to Tournaments
                    </button>
                </div>
            ) : (
                <>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Total Matches</span>
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                </div>
                                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Scheduled</span>
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                </div>
                                <p className="text-3xl font-bold text-white mt-2">{stats.scheduled}</p>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Completed</span>
                                    <Trophy className="w-5 h-5 text-green-400" />
                                </div>
                                <p className="text-3xl font-bold text-white mt-2">{stats.completed}</p>
                            </div>
                        </div>

                        {/* Filters - Conditionally show stage dropdown */}
                        {!stageFilter || stageFilter === 'all' ? (
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-1">
                                    <label className="block text-sm text-slate-400 mb-2">Stage</label>
                                    <select
                                        value={selectedStage}
                                        onChange={(e) => setSelectedStage(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                    >
                                        {stages.map(stage => (
                                            <option key={stage.value} value={stage.value}>
                                                {stage.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-sm text-slate-400 mb-2">Status</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                    >
                                        {statuses.map(status => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">
                                                {getStageName(stageFilter)}
                                            </h3>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Viewing {getStageName(stageFilter).toLowerCase()} matches and standings only
                                            </p>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm text-slate-400 mb-2">Status</label>
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                            >
                                                {statuses.map(status => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Standings Section (Visible in All or Regular Round) */}
                        {/* --- REGULAR ROUND OR OVERALL VIEW --- */}
                        {(selectedStage === 'regular_round' || selectedStage === 'all') && (
                            <div className="space-y-8">
                                {Array.isArray(standings) ? (
                                    standings.map((groupStanding) => (
                                        <div key={groupStanding._id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                                                <div>
                                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                        <Trophy className="w-5 h-5 text-yellow-400" />
                                                        {groupStanding.group?.name || 'Overall'} Standings
                                                    </h2>
                                                    <p className="text-sm text-slate-400">Top teams qualify for Knockouts</p>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-slate-900/50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Pos</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Team</th>
                                                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">P</th>
                                                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">W</th>
                                                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">D</th>
                                                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">L</th>
                                                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">GD</th>
                                                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Pts</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-700">
                                                        {groupStanding.standings.map((team) => (
                                                            <tr key={typeof team.tournamentTeam === 'object' ? team.tournamentTeam._id : team.tournamentTeam} className={team.position <= (tournament?.config?.topTeamsAdvance || 2) ? 'bg-green-900/10' : ''}>
                                                                <td className="px-4 py-3 text-sm text-white font-bold">{team.position}</td>
                                                                <td className="px-4 py-3 text-sm text-white flex items-center gap-2">
                                                                    {team.team?.logo && <img src={team.team.logo} className="w-6 h-6 rounded" />}
                                                                    {team.team?.name || 'Unknown'}
                                                                    {team.position <= (tournament?.config?.topTeamsAdvance || 2) && (
                                                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">Q</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-slate-300 text-center">{team.played}</td>
                                                                <td className="px-4 py-3 text-sm text-green-400 text-center">{team.won}</td>
                                                                <td className="px-4 py-3 text-sm text-yellow-400 text-center">{team.drawn}</td>
                                                                <td className="px-4 py-3 text-sm text-red-400 text-center">{team.lost}</td>
                                                                <td className="px-4 py-3 text-sm text-slate-300 text-center">{team.goalDifference}</td>
                                                                <td className="px-4 py-3 text-sm text-white font-bold text-center">{team.points}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))
                                ) : standings?.standings?.length > 0 && (
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                                            <div>
                                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                    <Trophy className="w-5 h-5 text-yellow-400" />
                                                    Tournament Standings
                                                </h2>
                                                <p className="text-sm text-slate-400">Top teams qualify for Knockouts</p>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-slate-900/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Pos</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Team</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">P</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">W</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">D</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">L</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">GD</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Pts</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-700">
                                                    {standings.standings.map((team) => (
                                                        <tr key={typeof team.tournamentTeam === 'object' ? team.tournamentTeam._id : team.tournamentTeam} className={team.position <= (tournament?.config?.topTeamsAdvance || 2) ? 'bg-green-900/10' : ''}>
                                                            <td className="px-4 py-3 text-sm text-white font-bold">{team.position}</td>
                                                            <td className="px-4 py-3 text-sm text-white flex items-center gap-2">
                                                                {team.team?.logo && <img src={team.team.logo} className="w-6 h-6 rounded" />}
                                                                {team.team?.name || 'Unknown'}
                                                                {team.position <= (tournament?.config?.topTeamsAdvance || 2) && (
                                                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">Q</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-slate-300 text-center">{team.played}</td>
                                                            <td className="px-4 py-3 text-sm text-green-400 text-center">{team.won}</td>
                                                            <td className="px-4 py-3 text-sm text-yellow-400 text-center">{team.drawn}</td>
                                                            <td className="px-4 py-3 text-sm text-red-400 text-center">{team.lost}</td>
                                                            <td className="px-4 py-3 text-sm text-slate-300 text-center">{team.goalDifference}</td>
                                                            <td className="px-4 py-3 text-sm text-white font-bold text-center">{team.points}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- KNOCKOUT STAGE VIEW --- */}
                        {selectedStage !== 'regular_round' && selectedStage !== 'all' && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-purple-400" />
                                        {selectedStage.replace('_', ' ').toUpperCase()} Teams
                                    </h2>

                                </div>

                                {stageTeams.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {stageTeams.map((t) => (
                                            <div key={t._id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                                                    {t.team.teamImage ? (
                                                        <img src={t.team.teamImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-white font-bold">{t.team.teamName?.[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-medium text-sm">{t.team.teamName}</h4>
                                                    <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded">Qualified</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-slate-500 text-sm italic">
                                        Waiting for team promotion to this stage...
                                    </div>
                                )}

                                {/* Knockout Stage Standings */}
                                {standings?.standings?.length > 0 && matches.length > 0 && (
                                    <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                        <div className="p-4 border-b border-slate-700 bg-slate-800">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <Trophy className="w-5 h-5 text-purple-400" />
                                                {getStageName(selectedStage)} Standings
                                            </h3>
                                            <p className="text-sm text-slate-400 mt-1">Based on matches in this stage only</p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-slate-900/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Pos</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Team</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">P</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">W</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">D</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">L</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">GD</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Pts</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-700">
                                                    {standings.standings.map((team) => (
                                                        <tr key={typeof team.tournamentTeam === 'object' ? team.tournamentTeam._id : team.tournamentTeam}>
                                                            <td className="px-4 py-3 text-sm text-white font-bold">{team.position}</td>
                                                            <td className="px-4 py-3 text-sm text-white flex items-center gap-2">
                                                                {team.team?.logo && <img src={team.team.logo} className="w-6 h-6 rounded" />}
                                                                {team.team?.name || 'Unknown'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-slate-300 text-center">{team.played}</td>
                                                            <td className="px-4 py-3 text-sm text-green-400 text-center">{team.won}</td>
                                                            <td className="px-4 py-3 text-sm text-yellow-400 text-center">{team.drawn}</td>
                                                            <td className="px-4 py-3 text-sm text-red-400 text-center">{team.lost}</td>
                                                            <td className="px-4 py-3 text-sm text-slate-300 text-center">{team.goalDifference}</td>
                                                            <td className="px-4 py-3 text-sm text-white font-bold text-center">{team.points}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Matches List */}
                        {matches.length === 0 && !loading && (selectedStage !== 'regular_round' && selectedStage !== 'all') ? (
                            <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700 mt-8">
                                <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No Matches Yet</h3>
                                <p className="text-slate-400 mb-6">The qualified teams are ready. Generate the fixtures now to start this stage.</p>
                                <button
                                    onClick={() => handleGenerateNextRound(selectedStage)}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Shuffle className="w-4 h-4" />
                                    Generate {selectedStage.replace('_', ' ')} Fixtures
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-12 mt-8">
                                {Object.entries(getGroupedMatches()).map(([groupName, groupMatches]) => (
                                    <div key={groupName} className="space-y-6">
                                        {(selectedStage === 'regular_round' || selectedStage === 'all') && (
                                            <div className="flex items-center gap-4 py-2">
                                                <div className="h-px flex-1 bg-slate-700"></div>
                                                <h3 className="text-lg font-bold text-orange-500 uppercase tracking-wider">{groupName}</h3>
                                                <div className="h-px flex-1 bg-slate-700"></div>
                                            </div>
                                        )}
                                        <div className="grid gap-4">
                                            {groupMatches.map((match) => (
                                                <div
                                                    key={match._id}
                                                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(match.status)}`}>
                                                                {match.status}
                                                            </span>
                                                            <span className="text-sm text-slate-400">
                                                                {getStageName(match.stage)}
                                                                {match.round && ` - Round ${match.round}`}
                                                            </span>
                                                            {match.group && (
                                                                <span className="text-sm text-slate-400">
                                                                    • {match.group.name}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={() => handleEditMatch(match)}
                                                            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                                            title="Update Score"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        {/* Home Team */}
                                                        <div className="flex items-center gap-4 flex-1">
                                                            {match.homeTeam?.team?.teamImage && (
                                                                <img
                                                                    src={match.homeTeam.team.teamImage}
                                                                    alt={match.homeTeam.team.teamName}
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                />
                                                            )}
                                                            <span className="font-semibold text-white text-lg">
                                                                {match.homeTeam?.team?.teamName || 'TBD'}
                                                            </span>
                                                        </div>

                                                        {/* Score */}
                                                        <div className="flex items-center gap-4 px-8">
                                                            <span className="text-3xl font-bold text-white">
                                                                {match.homeScore ?? '-'}
                                                            </span>
                                                            <span className="text-2xl font-bold text-slate-600">:</span>
                                                            <span className="text-3xl font-bold text-white">
                                                                {match.awayScore ?? '-'}
                                                            </span>
                                                        </div>

                                                        {/* Away Team */}
                                                        <div className="flex items-center gap-4 flex-1 justify-end">
                                                            <span className="font-semibold text-white text-lg">
                                                                {match.awayTeam?.team?.teamName || 'TBD'}
                                                            </span>
                                                            {match.awayTeam?.team?.teamImage && (
                                                                <img
                                                                    src={match.awayTeam.team.teamImage}
                                                                    alt={match.awayTeam.team.teamName}
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {match.scheduledAt && (
                                                        <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4" />
                                                                {new Date(match.scheduledAt).toLocaleDateString()}
                                                            </div>
                                                            {match.location && (
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="w-4 h-4" />
                                                                    {match.location}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {matches.length === 0 && (
                                    <div className="text-center py-12">
                                        <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400">No matches found</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Edit Score Modal */}
                    {
                        editingMatch && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6">
                                    <h2 className="text-2xl font-bold text-white mb-6">Update Match Score</h2>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-2">Home Score</label>
                                            <input
                                                type="number"
                                                value={scores.homeScore}
                                                onChange={(e) => setScores(prev => ({ ...prev, homeScore: e.target.value }))}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-center text-2xl font-bold focus:outline-none focus:border-orange-500"
                                                min="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-slate-400 mb-2">Away Score</label>
                                            <input
                                                type="number"
                                                value={scores.awayScore}
                                                onChange={(e) => setScores(prev => ({ ...prev, awayScore: e.target.value }))}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-center text-2xl font-bold focus:outline-none focus:border-orange-500"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                                        <p className="text-sm text-blue-300">
                                            ✨ Standings will be automatically recalculated when you update the score!
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setEditingMatch(null);
                                                setScores({ homeScore: 0, awayScore: 0 });
                                            }}
                                            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdateScore}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-xl transition-colors"
                                        >
                                            Update Score
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {/* Promotion Selection Modal */}
                    <PromotionModal
                        isOpen={isPromotionModalOpen}
                        onClose={() => setIsPromotionModalOpen(false)}
                        onSuccess={handlePromotionSuccess}
                        tournamentId={id}
                        standings={standings}
                        nextStage={nextRoundStage}
                    />
                    {/* Generator Modal */}
                    <KnockoutGeneratorModal
                        isOpen={isGeneratorOpen}
                        onClose={() => setIsGeneratorOpen(false)}
                        onSuccess={() => {
                            setSelectedStage(nextRoundStage);
                            fetchMatches();
                            fetchStandings(nextRoundStage);
                        }}
                        tournamentId={id}
                        stage={nextRoundStage}
                        standings={standings}
                        tournamentConfig={tournament?.config}
                    />
                    {/* Detailed Match Update Modal (with Player Stats) */}
                    <DetailedMatchUpdateModal
                        isOpen={isDetailedMatchModalOpen}
                        onClose={() => {
                            setIsDetailedMatchModalOpen(false);
                            setSelectedMatch(null);
                        }}
                        onSuccess={() => {
                            fetchMatches();
                            if (selectedStage && selectedStage !== 'all') {
                                fetchStandings(selectedStage);
                            }
                        }}
                        match={selectedMatch}
                        tournamentId={id}
                    />
                    {/* Skip Stage Modal */}
                    <StageSkipModal
                        isOpen={isSkipModalOpen}
                        onClose={() => setIsSkipModalOpen(false)}
                        onSuccess={handleSkipStageSuccess}
                        tournamentId={id}
                        currentStage={tournament?.stage?.current || 'regular_rounds'}
                        standings={standings}
                    />
                    {/* Wildcard Team Modal */}
                    <WildcardTeamModal
                        isOpen={isWildcardModalOpen}
                        onClose={() => setIsWildcardModalOpen(false)}
                        onSuccess={() => {
                            fetchStageTeams();
                            fetchMatches(); // Implicitly refreshes context if needed
                        }}
                        tournamentId={id}
                    />
                    {/* Create Manual Match Modal */}
                    <CreateMatchModal
                        isOpen={isCreateMatchModalOpen}
                        onClose={() => setIsCreateMatchModalOpen(false)}
                        onSuccess={fetchMatches}
                        tournamentId={id}
                        defaultStage={selectedStage !== 'all' ? selectedStage : 'regular_round'}
                    />
                    {/* End Tournament Modal */}
                    {isEndTournamentModalOpen && (
                        <EndTournamentModal
                            isOpen={isEndTournamentModalOpen}
                            onClose={() => setIsEndTournamentModalOpen(false)}
                            tournamentId={id}
                            matches={matches}
                            onSuccess={() => {
                                fetchTournamentDetails();
                                fetchMatches();
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default TournamentMatches;
