import { useState, useEffect } from 'react';
import { X, Search, Plus, Loader, Shield, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const WildcardTeamModal = ({ isOpen, onClose, onSuccess, tournamentId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addingTeamId, setAddingTeamId] = useState(null);

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length >= 2) {
                searchRef();
            } else if (searchTerm.length === 0) {
                setTeams([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const searchRef = async () => {
        setLoading(true);
        try {
            // Using existing API to get all teams or search
            // Assuming we can fetch all and filter client side if search api not available, 
            // or use specific search endpoint. 
            // Let's check `compTeamsController.js` logic - usually `viewAllTeams` returns all.
            const response = await axios.get(`${API_BASE}/api/comp/team/all`, {
                headers: { 'api_key': 'THE123FIELD' }
            });

            if (response.data.status === 'SUCCESS') {
                const allTeams = response.data.data;
                const filtered = allTeams.filter(t =>
                    t.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (t.clubId?.clubName && t.clubId.clubName.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                setTeams(filtered.slice(0, 10)); // Limit results
            }
        } catch (error) {
            console.error('Error searching teams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWildcard = async (team) => {
        setAddingTeamId(team._id);
        try {
            const response = await axios.post(
                `${API_BASE}/api/v2/tournaments/${tournamentId}/wildcard`,
                { teamId: team._id },
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success(`${team.teamName} added as Wildcard!`);
                onSuccess(); // Refresh parent
                // Don't close immediately, maybe user wants to add more? 
                // Or close. Let's close for cleaner UX.
                onClose();
            }
        } catch (error) {
            console.error('Error adding wildcard:', error);
            toast.error(error.response?.data?.message || 'Failed to add team');
        } finally {
            setAddingTeamId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-lg w-full overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-orange-500" />
                            Add Wildcard Team
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Search and add any available team to this tournament
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Search Input */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search team name or club..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="text-center py-8">
                            <Loader className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">Searching global database...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {teams.length > 0 ? (
                                teams.map(team => (
                                    <div
                                        key={team._id}
                                        className="bg-slate-900/50 border border-slate-700 p-3 rounded-xl flex items-center justify-between hover:border-slate-600 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                                                {team.teamImage ? (
                                                    <img src={team.teamImage} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-slate-400 font-bold">{team.teamName?.[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-medium group-hover:text-orange-400 transition-colors">
                                                    {team.teamName}
                                                </h4>
                                                {team.clubId?.clubName && (
                                                    <span className="text-xs text-slate-500">{team.clubId.clubName}</span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAddWildcard(team)}
                                            disabled={addingTeamId === team._id}
                                            className="px-3 py-1.5 bg-slate-800 hover:bg-orange-500/20 text-slate-300 hover:text-orange-400 border border-slate-600 hover:border-orange-500/30 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                                        >
                                            {addingTeamId === team._id ? (
                                                <Loader className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4" />
                                                    Add
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))
                            ) : searchTerm.length >= 2 ? (
                                <div className="text-center py-8 text-slate-500">
                                    No teams found matching "{searchTerm}"
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    Type at least 2 characters to search
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WildcardTeamModal;
