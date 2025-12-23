import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    ArrowLeft,
    Trophy,
    Users,
    Calendar,
    Settings,
    Check,
    Loader
} from 'lucide-react';

const CreateTournament = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [leagues, setLeagues] = useState([]);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        league: '',
        category: '',
        startDate: '',
        endDate: '',
        config: {
            teamLimit: 16,
            groupCount: 4,
            teamsPerGroup: 4,
            topTeamsAdvance: 2,
            matchesInRegularRound: 1,
            hasQuarterFinals: true,
            hasSemiFinals: true,
            pointsForWin: 3,
            pointsForDraw: 1,
            pointsForLoss: 0
        }
    });

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        fetchLeagues();
    }, []);

    const fetchLeagues = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/comp/league/viewLeagues`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setLeagues(response.data.leagues || []);
            }
        } catch (error) {
            console.error('Error fetching leagues:', error);
            toast.error('Failed to load leagues');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'league') {
            const selectedLeague = leagues.find(l => l._id === value);
            if (selectedLeague && selectedLeague.categories) {
                setCategories(selectedLeague.categories);
            } else {
                setCategories([]);
            }
            // Reset category when league changes
            setFormData(prev => ({ ...prev, [name]: value, category: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.league || !formData.startDate || !formData.endDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE}/api/v2/tournaments`,
                formData,
                {
                    headers: { 'api_key': 'THE123FIELD' }
                }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('Tournament created! Proceeding to team selection...');
                setTimeout(() => {
                    // Redirect to TEAMS page instead of dashboard
                    navigate(`/dashboard/tournaments/${response.data.tournament._id}/teams`);
                }, 1000);
            }
        } catch (error) {
            console.error('Error creating tournament:', error);
            toast.error(error.response?.data?.error || 'Failed to create tournament');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-slate-200 py-8">
            <ToastContainer theme="dark" position="top-right" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/dashboard/tournaments')}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Tournaments
                    </button>

                    <h1 className="text-3xl font-bold text-white mb-2">Start New Tournament</h1>
                    <p className="text-slate-400">Step 1: Basic Setup</p>
                </div>

                {/* Simplified Form Content */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Tournament Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Tournament Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Summer Championship 2024"
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Select League *
                                </label>
                                <select
                                    name="league"
                                    value={formData.league}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                                >
                                    <option value="">Choose a league</option>
                                    {leagues.map(league => (
                                        <option key={league._id} value={league._id}>
                                            {league.leagueName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Category (Optional)
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                                >
                                    <option value="">Choose a category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name || cat.categoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 transform hover:scale-105 shadow-lg"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Starting...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Next: Add Teams
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTournament;
