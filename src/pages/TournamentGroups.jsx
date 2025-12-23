import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    ArrowLeft,
    Grid,
    Plus,
    Shuffle,
    Loader,
    Users,
    CheckCircle,
    Trash2,
    Edit,
    Save,
    X,
    MoreVertical,
    Wand2
} from 'lucide-react';

const TournamentGroups = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [groups, setGroups] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [groupCount, setGroupCount] = useState(4);

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                await Promise.all([
                    fetchTournament(),
                    fetchGroups(),
                    fetchTeams()
                ]);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id]);

    const fetchTournament = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${id}`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            setTournament(response.data.data);
        } catch (error) {
            console.error('Error fetching tournament:', error);
            toast.error('Failed to load tournament details');
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${id}/groups`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                // Backend returns { status: "SUCCESS", groups: [...] }
                const groupsList = response.data.groups || [];
                setGroups(groupsList.sort((a, b) => a.displayOrder - b.displayOrder));
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            setGroups([]); // Ensure groups is always an array on error
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${id}/teams`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                // Backend returns { status: "SUCCESS", teams: [...] }
                setTeams(response.data.teams || []);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            setTeams([]); // Ensure teams is always an array on error
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!confirm('Are you sure? All teams in this group will be unallocated.')) return;

        setActionLoading(true);
        try {
            await axios.delete(`${API_BASE}/api/v2/groups/${groupId}`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            toast.success('Group deleted');
            fetchGroups();
            fetchTeams(); // Update team statuses
        } catch (error) {
            console.error('Error deleting group:', error);
            toast.error('Failed to delete group');
        } finally {
            setActionLoading(false);
        }
    };

    const handleMoveTeam = async (teamId, targetGroupId) => {
        setActionLoading(true);
        try {
            await axios.put(
                `${API_BASE}/api/v2/tournaments/${id}/teams/${teamId}/move`,
                { targetGroupId },
                { headers: { 'api_key': 'THE123FIELD' } }
            );
            toast.success('Team moved successfully');
            fetchGroups();
            fetchTeams();
        } catch (error) {
            console.error('Error moving team:', error);
            toast.error('Failed to move team');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateGroups = async () => {
        setActionLoading(true);
        try {
            const groupsData = Array.from({ length: groupCount }, (_, i) => ({
                name: `Group ${String.fromCharCode(65 + i)}`,
                displayOrder: i + 1
            }));

            const response = await axios.post(
                `${API_BASE}/api/v2/tournaments/${id}/groups`,
                { groups: groupsData },
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('Groups created successfully!');
                fetchGroups();
            }
        } catch (error) {
            console.error('Error creating groups:', error);
            toast.error(error.response?.data?.error || 'Failed to create groups');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddGroup = async () => {
        setActionLoading(true);
        try {
            // Determine next group name and order
            const nextOrder = groups.length + 1;
            const nextLetter = String.fromCharCode(65 + groups.length); // A, B, C...

            const newGroup = {
                name: `Group ${nextLetter}`,
                displayOrder: nextOrder
            };

            const response = await axios.post(
                `${API_BASE}/api/v2/tournaments/${id}/groups`,
                { groups: [newGroup] },
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('Group added successfully');
                fetchGroups();
            }
        } catch (error) {
            console.error('Error adding group:', error);
            toast.error('Failed to add group');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAutoAllocate = async () => {
        if (groups.length === 0) {
            toast.error('Please create groups first');
            return;
        }

        setActionLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE}/api/v2/tournaments/${id}/auto-allocate`,
                {},
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('Teams allocated successfully');
                fetchGroups();
                fetchTeams();
            }
        } catch (error) {
            console.error('Error allocating teams:', error);
            toast.error(error.response?.data?.error || 'Failed to allocate teams');
        } finally {
            setActionLoading(false);
        }
    };

    const handleGenerateMatches = async () => {
        if (groups.length === 0) {
            toast.error('Please create groups and allocate teams first');
            return;
        }

        setActionLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE}/api/v2/tournaments/${id}/generate-matches/regular`,
                {},
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success(`${response.data.matchesCreated} matches generated!`);
                setTimeout(() => {
                    navigate(`/dashboard/tournaments/${id}/matches?stage=regular_round`);
                }, 1500);
            }
        } catch (error) {
            console.error('Error generating matches:', error);
            toast.error(error.response?.data?.error || 'Failed to generate matches');
        } finally {
            setActionLoading(false);
        }
    };

    const approvedTeamsCount = teams.filter(t => t.status === 'approved').length;
    const allocatedTeamsCount = teams.filter(t => t.group).length;
    const unallocatedTeams = teams.filter(t => t.status === 'approved' && !t.group);
    const hasGroups = groups.length > 0;
    const allTeamsAllocated = approvedTeamsCount > 0 && allocatedTeamsCount === approvedTeamsCount;
    const matchesGenerated = tournament?.stats?.totalMatches > 0 ||
        ['quarter_finals', 'semi_finals', 'finals', 'completed'].includes(tournament?.stage?.current);

    // Redirect to matches if already generated and not in edit mode
    useEffect(() => {
        if (matchesGenerated && !isEditMode && !loading) {
            // matches are generated, UI will update to show "Go to Matches"
        }
    }, [matchesGenerated, isEditMode, loading]);

    console.log('RENDER TOURNAMENT GROUPS', { loading, hasGroups, isEditMode });

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
                            <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                                <Grid className="w-7 h-7 text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Group Management</h1>
                                <p className="text-slate-400 mt-1">{tournament?.name}</p>
                            </div>
                        </div>

                        {/* Admin Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium border ${isEditMode
                                    ? 'bg-orange-600/20 text-orange-400 border-orange-600/30 hover:bg-orange-600/30'
                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                    }`}
                            >
                                {isEditMode ? (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Done Editing
                                    </>
                                ) : (
                                    <>
                                        <Edit className="w-4 h-4" />
                                        Edit Groups
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className={`p-6 rounded-xl border-2 ${hasGroups ? 'border-green-600 bg-green-600/10' : 'border-slate-700 bg-slate-800/50'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            {hasGroups ? <CheckCircle className="w-8 h-8 text-green-400" /> : <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold">1</div>}
                            <h3 className="font-bold text-white text-lg">Create Groups</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">{hasGroups ? `${groups.length} groups created` : 'Set up groups'}</p>

                        {isEditMode ? (
                            <button
                                onClick={handleAddGroup}
                                disabled={actionLoading}
                                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Group
                            </button>
                        ) : !hasGroups && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Number of Groups</label>
                                    <input
                                        type="number"
                                        value={groupCount}
                                        onChange={(e) => setGroupCount(parseInt(e.target.value))}
                                        min="2"
                                        max="8"
                                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateGroups}
                                    disabled={actionLoading}
                                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    Create Groups
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${allTeamsAllocated ? 'border-green-600 bg-green-600/10' : 'border-slate-700 bg-slate-800/50'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            {allTeamsAllocated ? (
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            ) : (
                                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold">2</div>
                            )}
                            <h3 className="font-bold text-white text-lg">Allocate Teams</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            {allTeamsAllocated
                                ? `${allocatedTeamsCount} teams allocated`
                                : `${allocatedTeamsCount}/${approvedTeamsCount} teams allocated`}
                        </p>
                        {isEditMode ? (
                            <p className="text-sm text-yellow-500">You can manually move teams below.</p>
                        ) : !allTeamsAllocated && hasGroups && (
                            <button
                                onClick={handleAutoAllocate}
                                disabled={actionLoading}
                                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                                Auto Allocate Teams
                            </button>
                        )}
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${matchesGenerated ? 'border-green-600 bg-green-600/10' : 'border-slate-700 bg-slate-800/50'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            {matchesGenerated ? (
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            ) : (
                                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold">3</div>
                            )}
                            <h3 className="font-bold text-white text-lg">Generate Matches</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            {matchesGenerated
                                ? "Matches have been generated"
                                : "Create round-robin fixtures"}
                        </p>
                        <div className="space-y-3">
                            {matchesGenerated ? (
                                <button
                                    onClick={() => navigate(`/dashboard/tournaments/${id}/matches?stage=regular_round`)}
                                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    Go to Matches
                                </button>
                            ) : (
                                <button
                                    onClick={handleGenerateMatches}
                                    disabled={actionLoading || !allTeamsAllocated}
                                    className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : 'Generate Matches'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Groups Display */}
                {hasGroups && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groups.map((group) => (
                            <div
                                key={group._id}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 relative group/card"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white">{group.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-sm font-semibold">
                                            {group.teams?.length || 0} teams
                                        </span>
                                        {isEditMode && (
                                            <button
                                                onClick={() => handleDeleteGroup(group._id)}
                                                className="p-1 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                                                title="Delete Group"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {group.teams && group.teams.length > 0 ? (
                                        group.teams.map((tournamentTeam) => (
                                            <div
                                                key={tournamentTeam._id}
                                                className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-700"
                                            >
                                                {tournamentTeam.team?.teamImage && (
                                                    <img
                                                        src={tournamentTeam.team.teamImage}
                                                        alt={tournamentTeam.team.teamName}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold text-white">
                                                        {tournamentTeam.team?.teamName || 'Unknown Team'}
                                                    </p>
                                                </div>

                                                {isEditMode && (
                                                    <select
                                                        onChange={(e) => handleMoveTeam(tournamentTeam.team._id, e.target.value)}
                                                        value=""
                                                        className="w-8 h-8 rounded bg-slate-800 text-slate-400 border border-slate-600 focus:outline-none focus:border-indigo-500 text-xs appearance-none cursor-pointer"
                                                        title="Move to..."
                                                    >
                                                        <option value="" disabled>Move</option>
                                                        {groups.filter(g => g._id !== group._id).map(g => (
                                                            <option key={g._id} value={g._id}>{g.name}</option>
                                                        ))}
                                                        <option value="">Unassign</option>
                                                    </select>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Users className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                                            <p className="text-slate-500 text-sm">No teams allocated yet</p>
                                        </div>
                                    )}

                                    {isEditMode && unallocatedTeams.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-slate-700">
                                            <select
                                                onChange={(e) => handleMoveTeam(e.target.value, group._id)}
                                                value=""
                                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                                            >
                                                <option value="" disabled>+ Add Unallocated Team</option>
                                                {unallocatedTeams.map(team => (
                                                    <option key={team._id} value={team.team?._id}>
                                                        {team.team?.teamName || 'Unknown Team'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!hasGroups && (
                    <div className="text-center py-12">
                        <Grid className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-400 mb-2">No groups created yet</h3>
                        <p className="text-slate-500">Create groups to get started with tournament organization</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TournamentGroups;
