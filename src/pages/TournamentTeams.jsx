import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    ArrowLeft,
    Users,
    Plus,
    Check,
    X,
    Trash2,
    Search,
    UserCheck,
    UserX,
    Loader
} from 'lucide-react';

const TournamentTeams = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [availableTeams, setAvailableTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [availableLoading, setAvailableLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchMode, setSearchMode] = useState('league'); // 'league' or 'global'

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    // ... (existing useEffects)

    const fetchGlobalTeams = async (query = '') => {
        setAvailableLoading(true);
        try {
            // If query is provided, use it. If not, fetch all (empty search)
            const url = `${API_BASE}/api/comp/team/all${query ? `?search=${encodeURIComponent(query)}` : ''}`;
            const response = await axios.get(url, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setAvailableTeams(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching global teams:', error);
            toast.error('Failed to load teams');
        } finally {
            setAvailableLoading(false);
        }
    };

    // Wrapper for search button/enter key
    const handleGlobalSearch = () => {
        fetchGlobalTeams(searchQuery);
    };

    useEffect(() => {
        fetchTournamentDetails();
        fetchTournamentTeams();
    }, [id]);

    useEffect(() => {
        if (tournament?.league?._id) {
            fetchAvailableTeams(tournament.league._id);
        }
    }, [tournament]);

    const fetchTournamentDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${id}`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setTournament(response.data.tournament);
            }
        } catch (error) {
            console.error('Error fetching tournament:', error);
            toast.error('Failed to load tournament details');
        }
    };

    const fetchTournamentTeams = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${id}/teams`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setTeams(response.data.teams || []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setLoading(false);
        }
    };

    const fetchAvailableTeams = async (leagueId) => {
        setAvailableLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/api/comp/team/get/${leagueId}`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setAvailableTeams(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching available teams:', error);
            if (error.response?.status !== 404) {
                toast.error('Failed to load available teams');
            }
        } finally {
            setAvailableLoading(false);
        }
    };

    const handleRegisterTeam = async () => {
        if (selectedTeams.length === 0) {
            toast.error('Please select at least one team');
            return;
        }

        setActionLoading('register');
        let successCount = 0;
        let failCount = 0;

        try {
            await Promise.all(selectedTeams.map(async (teamId) => {
                try {
                    const response = await axios.post(
                        `${API_BASE}/api/v2/tournaments/${id}/teams`,
                        { teamId: teamId },
                        { headers: { 'api_key': 'THE123FIELD' } }
                    );
                    if (response.data.status === 'SUCCESS') {
                        successCount++;
                    }
                } catch (error) {
                    console.error(`Error registering team ${teamId}:`, error);
                    failCount++;
                }
            }));

            if (successCount > 0) {
                toast.success(`${successCount} team(s) registered successfully!`);
                if (failCount > 0) {
                    toast.warning(`${failCount} team(s) failed to register.`);
                }
                // setShowAddModal(false); // Removed as it causes crash and seems undefined
                setSelectedTeams([]);
                fetchTournamentTeams();
            } else if (failCount > 0) {
                toast.error('Failed to register selected teams.');
            }
        } catch (error) {
            console.error('Error in bulk registration:', error);
            toast.error('An unexpected error occurred during registration.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleBulkApprove = async () => {
        const pendingTeams = selectedTeams.filter(id => {
            const team = filteredTeams.find(t => t._id === id);
            return team && team.status === 'pending';
        });

        if (pendingTeams.length === 0) return;

        setActionLoading('bulk-approve');
        let successCount = 0;

        try {
            await Promise.all(pendingTeams.map(async (teamId) => {
                try {
                    const response = await axios.put(
                        `${API_BASE}/api/v2/tournaments/${id}/teams/${teamId}/approve`,
                        { adminId: '507f1f77bcf86cd799439011' },
                        { headers: { 'api_key': 'THE123FIELD' } }
                    );
                    if (response.data.status === 'SUCCESS') {
                        successCount++;
                    }
                } catch (error) {
                    console.error(`Error approving team ${teamId}:`, error);
                }
            }));

            if (successCount > 0) {
                toast.success(`${successCount} team(s) approved!`);
                setSelectedTeams(prev => prev.filter(id => !pendingTeams.includes(id)));
                fetchTournamentTeams();
            }
        } catch (error) {
            toast.error('Error processing approvals');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveTeam = async (teamId) => {
        setActionLoading(`approve-${teamId}`);
        try {
            const response = await axios.put(
                `${API_BASE}/api/v2/tournaments/${id}/teams/${teamId}/approve`,
                { adminId: '507f1f77bcf86cd799439011' }, // Dummy valid ObjectId for development
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('Team approved!');
                fetchTournamentTeams();
            }
        } catch (error) {
            console.error('Error approving team:', error);
            toast.error('Failed to approve team');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectTeam = async (teamId) => {
        setActionLoading(`reject-${teamId}`);
        try {
            const response = await axios.put(
                `${API_BASE}/api/v2/tournaments/${id}/teams/${teamId}/reject`,
                {},
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('Team rejected');
                fetchTournamentTeams();
            }
        } catch (error) {
            console.error('Error rejecting team:', error);
            toast.error('Failed to reject team');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddSingleTeam = async (teamId) => {
        setActionLoading(`register-${teamId}`);
        try {
            const response = await axios.post(
                `${API_BASE}/api/v2/tournaments/${id}/teams`,
                { teamId: teamId },
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('Team added successfully!');
                fetchTournamentTeams();
            }
        } catch (error) {
            console.error('Error adding team:', error);
            toast.error(error.response?.data?.message || 'Failed to add team');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveTeam = async (teamId) => {
        if (!confirm('Are you sure you want to remove this team?')) return;

        setActionLoading(`remove-${teamId}`);
        try {
            await axios.delete(`${API_BASE}/api/v2/tournaments/${id}/teams/${teamId}`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            toast.success('Team removed');
            fetchTournamentTeams();
        } catch (error) {
            console.error('Error removing team:', error);
            toast.error('Failed to remove team');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
            approved: 'bg-green-600/20 text-green-400 border-green-600/30',
            rejected: 'bg-red-600/20 text-red-400 border-red-600/30'
        };
        return styles[status] || styles.pending;
    };

    // Merge available teams with registered tournament teams
    const allLeagueTeams = availableTeams.map(leagueTeam => {
        const registeredTeam = teams.find(t => t.team?._id === leagueTeam._id); // Assuming availableTeams has _id and teams has team._id
        return {
            ...leagueTeam, // Basic info from league (name, logo, etc.)
            tournamentData: registeredTeam, // The registration record if it exists
            status: registeredTeam ? registeredTeam.status : 'not_registered'
        };
    });

    const filteredTeams = allLeagueTeams.filter(t =>
        t.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: teams.length, // Registered teams
        approved: teams.filter(t => t.status === 'approved').length,
        pending: teams.filter(t => t.status === 'pending').length,
        available: availableTeams.length - teams.length
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

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                                <Users className="w-7 h-7 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Team Management</h1>
                                <p className="text-slate-400 mt-1">{tournament?.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(`/dashboard/tournaments/${id}/groups`)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all border border-slate-600"
                            >
                                Next Step: Groups
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </button>
                            {selectedTeams.some(id => filteredTeams.find(t => t._id === id && t.status === 'not_registered')) && (
                                <button
                                    onClick={handleRegisterTeam}
                                    disabled={actionLoading === 'register'}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all shadow-lg"
                                >
                                    {actionLoading === 'register' ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                    Add Selected ({selectedTeams.filter(id => filteredTeams.find(t => t._id === id && t.status === 'not_registered')).length})
                                </button>
                            )}

                            {selectedTeams.some(id => filteredTeams.find(t => t._id === id && t.status === 'pending')) && (
                                <button
                                    onClick={handleBulkApprove}
                                    disabled={actionLoading === 'bulk-approve'}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-lg"
                                >
                                    {actionLoading === 'bulk-approve' ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Check className="w-5 h-5" />
                                    )}
                                    Approve Selected ({selectedTeams.filter(id => filteredTeams.find(t => t._id === id && t.status === 'pending')).length})
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Total Teams</span>
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Approved</span>
                            <UserCheck className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mt-2">{stats.approved}</p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Available to Add</span>
                            <Users className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mt-2">{stats.available}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={searchMode === 'global' ? "Search all global teams..." : "Search teams in this league..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchMode === 'global') {
                                    handleGlobalSearch();
                                }
                            }}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        />
                    </div>

                    <button
                        onClick={() => {
                            if (searchMode === 'league') {
                                setSearchMode('global');
                                setSearchQuery('');
                                // Fetch all global teams immediately
                                fetchGlobalTeams('');
                            } else {
                                setSearchMode('league');
                                setSearchQuery('');
                                if (tournament?.league?._id) {
                                    fetchAvailableTeams(tournament.league._id);
                                }
                            }
                        }}
                        className={`px-4 py-2 rounded-xl border transition-colors flex items-center gap-2 ${searchMode === 'global'
                            ? 'bg-orange-600 text-white border-orange-500'
                            : 'bg-slate-800 text-slate-300 border-slate-600 hover:border-slate-500'
                            }`}
                    >
                        {searchMode === 'global' ? (
                            <>
                                <Users className="w-5 h-5" />
                                Searching Global
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Search Global Teams
                            </>
                        )}
                    </button>

                    {searchMode === 'global' && (
                        <button
                            onClick={handleGlobalSearch}
                            disabled={availableLoading || !searchQuery.trim()}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                        >
                            Search
                        </button>
                    )}
                </div>

                {/* Teams List */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4 px-2">
                        {/* Select Unregistered */}
                        {filteredTeams.some(t => t.status === 'not_registered') && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={filteredTeams.some(t => t.status === 'not_registered') && filteredTeams.filter(t => t.status === 'not_registered').every(t => selectedTeams.includes(t._id))}
                                    onChange={(e) => {
                                        const unregistered = filteredTeams.filter(t => t.status === 'not_registered').map(t => t._id);
                                        if (e.target.checked) {
                                            setSelectedTeams(prev => [...new Set([...prev, ...unregistered])]);
                                        } else {
                                            setSelectedTeams(prev => prev.filter(id => !unregistered.includes(id)));
                                        }
                                    }}
                                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                                />
                                <span className="text-slate-400 text-sm">Select New Teams</span>
                            </div>
                        )}

                        {/* Select Pending */}
                        {filteredTeams.some(t => t.status === 'pending') && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={filteredTeams.some(t => t.status === 'pending') && filteredTeams.filter(t => t.status === 'pending').every(t => selectedTeams.includes(t._id))}
                                    onChange={(e) => {
                                        const pending = filteredTeams.filter(t => t.status === 'pending').map(t => t._id);
                                        if (e.target.checked) {
                                            setSelectedTeams(prev => [...new Set([...prev, ...pending])]);
                                        } else {
                                            setSelectedTeams(prev => prev.filter(id => !pending.includes(id)));
                                        }
                                    }}
                                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                                />
                                <span className="text-slate-400 text-sm">Select Pending Teams</span>
                            </div>
                        )}
                    </div>

                    {filteredTeams.map((team) => (
                        <div
                            key={team._id}
                            className={`border rounded-xl p-4 transition-all ${team.status === 'not_registered'
                                ? 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                                : 'bg-slate-800/80 border-slate-600'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    {(team.status === 'not_registered' || team.status === 'pending') && (
                                        <input
                                            type="checkbox"
                                            checked={selectedTeams.includes(team._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedTeams([...selectedTeams, team._id]);
                                                } else {
                                                    setSelectedTeams(selectedTeams.filter(id => id !== team._id));
                                                }
                                            }}
                                            className={`w-5 h-5 rounded border-slate-600 bg-slate-700 focus:ring-offset-0 ${team.status === 'pending' ? 'text-green-500 focus:ring-green-500' : 'text-orange-500 focus:ring-orange-500'}`}
                                        />
                                    )}

                                    {team.teamImage && (
                                        <img
                                            src={team.teamImage}
                                            alt={team.teamName}
                                            className={`w-12 h-12 rounded-lg object-cover border-2 ${team.status === 'not_registered' ? 'border-slate-700 grayscale' : 'border-slate-500'
                                                }`}
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold mb-1 ${team.status === 'not_registered' ? 'text-slate-300' : 'text-white'}`}>
                                            {team.teamName || 'Unknown Team'}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            {team.status === 'not_registered' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-400">
                                                    Not Registered
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(team.status)}`}>
                                                    {team.status}
                                                </span>
                                            )}
                                            {team.tournamentData?.group && (
                                                <span className="text-sm text-slate-400">
                                                    {team.tournamentData.group.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Actions based on status */}
                                    {team.status === 'not_registered' ? (
                                        <button
                                            onClick={() => {
                                                setSelectedTeams([team._id]); // Just register this one
                                                // We need a slight delay or direct call because handleRegisterTeam uses selectedTeams state
                                                // Ideally refactor handleRegisterTeam to accept optional ids, but keeping it simple:
                                                // Using a direct axios call here for single add might be cleaner, 
                                                // OR simpler: just set state and call register? 
                                                // Creating a specific single-add handler is safer.
                                                // Let's call a new direct handler function to avoid state race conditions.
                                                handleAddSingleTeam(team._id);
                                            }}
                                            disabled={actionLoading === `register-${team._id}`}
                                            className="px-4 py-2 bg-slate-700 hover:bg-orange-600 hover:text-white text-slate-300 rounded-lg transition-colors font-medium flex items-center gap-2"
                                        >
                                            {actionLoading === `register-${team._id}` ? (
                                                <Loader className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Plus className="w-4 h-4" />
                                            )}
                                            Add
                                        </button>
                                    ) : (
                                        <>
                                            {team.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApproveTeam(team._id)} // Pass team._id (CompTeam ID) as expected by backend
                                                        disabled={actionLoading === `approve-${team._id}`}
                                                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        {actionLoading === `approve-${team._id}` ? (
                                                            <Loader className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <Check className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectTeam(team._id)}
                                                        disabled={actionLoading === `reject-${team._id}`}
                                                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        {actionLoading === `reject-${team._id}` ? (
                                                            <Loader className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <X className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleRemoveTeam(team._id)}
                                                disabled={actionLoading === `remove-${team._id}`}
                                                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                                title="Remove from Tournament"
                                            >
                                                {actionLoading === `remove-${team._id}` ? (
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-5 h-5" />
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {availableLoading ? (
                        <div className="text-center py-12">
                            <Loader className="w-12 h-12 text-orange-500 mx-auto animate-spin mb-4" />
                            <p className="text-slate-400">Loading available teams...</p>
                        </div>
                    ) : filteredTeams.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">No teams found in this league</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default TournamentTeams;

