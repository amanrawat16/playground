import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Loader, Save, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateMatchModal = ({ isOpen, onClose, onSuccess, tournamentId, defaultStage }) => {
    const [loading, setLoading] = useState(false);
    const [fetchingTeams, setFetchingTeams] = useState(false);
    const [teams, setTeams] = useState([]);

    const [formData, setFormData] = useState({
        homeTeamId: '',
        awayTeamId: '',
        stage: defaultStage || 'regular_round',
        scheduledAt: '',
        location: '',
        round: 1
    });

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (isOpen && tournamentId) {
            fetchTournamentTeams();
            // Reset form
            setFormData(prev => ({
                ...prev,
                stage: defaultStage || 'regular_round',
                homeTeamId: '',
                awayTeamId: '',
                scheduledAt: '',
                location: ''
            }));
        }
    }, [isOpen, tournamentId, defaultStage]);

    const fetchTournamentTeams = async () => {
        setFetchingTeams(true);
        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${tournamentId}/teams`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setTeams(response.data.teams);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error('Failed to load tournament teams');
        } finally {
            setFetchingTeams(false);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.homeTeamId || !formData.awayTeamId) {
            toast.error('Please select both Home and Away teams');
            return;
        }
        if (formData.homeTeamId === formData.awayTeamId) {
            toast.error('Home and Away teams cannot be the same');
            return;
        }
        if (!formData.stage) {
            toast.error('Please select a stage');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE}/api/v2/tournaments/${tournamentId}/matches/manual`,
                formData,
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('Match created successfully!');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error creating match:', error);
            toast.error(error.response?.data?.message || 'Failed to create match');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const stages = [
        { value: 'regular_round', label: 'Group Stage' },
        { value: 'quarter_final', label: 'Quarter Final' },
        { value: 'semi_final', label: 'Semi Final' },
        { value: 'final', label: 'Final' }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-lg w-full overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            Create Manual Match
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Schedule a new match between any registered teams
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
                <div className="p-6 space-y-4">

                    {/* Stage Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Stage</label>
                        <select
                            value={formData.stage}
                            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                        >
                            {stages.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Team Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Home Team</label>
                            <select
                                value={formData.homeTeamId}
                                onChange={(e) => setFormData({ ...formData, homeTeamId: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                                disabled={fetchingTeams}
                            >
                                <option value="">Select Team</option>
                                {teams.map(t => (
                                    <option key={t._id} value={t._id}>{t.team.teamName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Away Team</label>
                            <select
                                value={formData.awayTeamId}
                                onChange={(e) => setFormData({ ...formData, awayTeamId: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                                disabled={fetchingTeams}
                            >
                                <option value="">Select Team</option>
                                {teams.map(t => (
                                    <option key={t._id} value={t._id}>{t.team.teamName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date and Location */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Date & Time</label>
                            <input
                                type="datetime-local"
                                value={formData.scheduledAt}
                                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors [color-scheme:dark]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Stadium / Venue"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full pl-9 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex gap-3 bg-slate-900/50">
                    <button
                        onClick={onClose}
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
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Create Match
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateMatchModal;
