import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    ArrowLeft,
    Trophy,
    Users,
    Grid,
    Play,
    Target,
    Award,
    CheckCircle2,
    Circle,
    Lock,
    ChevronRight,
    Plus,
    Calendar,
    TrendingUp,
    Settings
} from 'lucide-react';

const TournamentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        fetchTournamentDetails();
    }, [id]);

    const fetchTournamentDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${id}`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setTournament(response.data.tournament);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tournament:', error);
            toast.error('Failed to load tournament details');
            setLoading(false);
        }
    };

    const workflowSteps = [
        {
            id: 'setup',
            name: 'Setup',
            icon: Settings,
            description: 'Initial tournament setup',
            action: null,
            status: tournament?.stage?.current === 'setup' ? 'current' : 'completed'
        },
        {
            id: 'registration',
            name: 'Team Registration',
            icon: Users,
            description: 'Register and approve teams',
            action: () => navigate(`/dashboard/tournaments/${id}/teams`),
            status: tournament?.stage?.current === 'registration' ? 'current' :
                ['group_allocation', 'regular_rounds', 'quarter_finals', 'semi_finals', 'finals', 'completed'].includes(tournament?.stage?.current) ? 'completed' : 'locked'
        },
        {
            id: 'group_allocation',
            name: 'Create Groups',
            icon: Grid,
            description: 'Set up tournament groups',
            action: () => navigate(`/dashboard/tournaments/${id}/groups`),
            status: (['regular_rounds', 'quarter_finals', 'semi_finals', 'finals', 'completed'].includes(tournament?.stage?.current) || tournament?.stats?.totalMatches > 0) ? 'completed' :
                tournament?.stage?.current === 'group_allocation' ? 'current' : 'locked'
        },
        {
            id: 'regular_rounds',
            name: 'Group Stage',
            icon: Play,
            description: 'Group stage matches',
            action: () => navigate(`/dashboard/tournaments/${id}/matches?stage=regular_round`),
            status: (tournament?.stage?.current === 'regular_rounds' || (tournament?.stats?.totalMatches > 0 && tournament?.stage?.current === 'group_allocation')) ? 'current' :
                ['quarter_finals', 'semi_finals', 'finals', 'completed'].includes(tournament?.stage?.current) ? 'completed' : 'locked'
        },
        {
            id: 'quarter_finals',
            name: 'Quarter Finals',
            icon: Target,
            description: 'Knockout stage',
            action: () => navigate(`/dashboard/tournaments/${id}/matches?stage=quarter_final`),
            status: tournament?.stage?.current === 'quarter_finals' ? 'current' :
                ['semi_finals', 'finals', 'completed'].includes(tournament?.stage?.current) ? 'completed' : 'locked'
        },
        {
            id: 'semi_finals',
            name: 'Semi Finals',
            icon: Target,
            description: 'Final four teams',
            action: () => navigate(`/dashboard/tournaments/${id}/matches?stage=semi_final`),
            status: tournament?.stage?.current === 'semi_finals' ? 'current' :
                ['finals', 'completed'].includes(tournament?.stage?.current) ? 'completed' : 'locked'
        },
        {
            id: 'finals',
            name: 'Finals',
            icon: Award,
            description: 'Championship match',
            action: () => navigate(`/dashboard/tournaments/${id}/matches?stage=final`),
            status: tournament?.stage?.current === 'finals' ? 'current' :
                tournament?.stage?.current === 'completed' ? 'completed' : 'locked'
        }
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-6 h-6 text-green-500" />;
            case 'current':
                return <Circle className="w-6 h-6 text-orange-500 animate-pulse" />;
            case 'locked':
                return <Lock className="w-6 h-6 text-slate-600" />;
            default:
                return <Circle className="w-6 h-6 text-slate-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'border-green-500 bg-green-500/10';
            case 'current':
                return 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20';
            case 'locked':
                return 'border-slate-700 bg-slate-800/30';
            default:
                return 'border-slate-700 bg-slate-800/30';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-xl">Tournament not found</p>
                    <button
                        onClick={() => navigate('/dashboard/tournaments')}
                        className="mt-4 px-6 py-2 bg-orange-600 rounded-lg hover:bg-orange-700"
                    >
                        Go Back
                    </button>
                </div>
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
                        onClick={() => navigate('/dashboard/tournaments')}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Tournaments
                    </button>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Trophy className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
                                    <p className="text-slate-400 mt-1">
                                        {tournament.league?.leagueName} • Created {new Date(tournament.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-4 mt-4">
                                <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm text-slate-400">Teams:</span>
                                        <span className="font-semibold text-white">{tournament.stats?.totalTeams || 0}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-slate-400">Matches:</span>
                                        <span className="font-semibold text-white">
                                            {tournament.stats?.completedMatches || 0}/{tournament.stats?.totalMatches || 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm text-slate-400">Stage:</span>
                                        <span className="font-semibold text-white capitalize">
                                            {tournament.stage?.current?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tournament Workflow */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Tournament Progress</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {workflowSteps.map((step, index) => {
                            const Icon = step.icon;
                            const isClickable = step.status === 'current' || step.status === 'completed';

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => isClickable && step.action && step.action()}
                                    disabled={step.status === 'locked' || !step.action}
                                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${getStatusColor(step.status)
                                        } ${isClickable && step.action ? 'hover:scale-105 cursor-pointer' : 'cursor-default'} ${step.status === 'locked' ? 'opacity-50' : ''
                                        }`}
                                >
                                    {/* Step Number */}
                                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-900 border-2 border-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                        {index + 1}
                                    </div>

                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${step.status === 'completed' ? 'bg-green-600' :
                                            step.status === 'current' ? 'bg-orange-600' :
                                                'bg-slate-700'
                                            }`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        {getStatusIcon(step.status)}
                                    </div>

                                    <h3 className="font-bold text-white text-lg mb-2">{step.name}</h3>
                                    <p className="text-sm text-slate-400 mb-3">{step.description}</p>

                                    {isClickable && step.action && (
                                        <div className="flex items-center gap-2 text-sm text-orange-400 font-medium">
                                            Open
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    )}

                                    {step.status === 'current' && (
                                        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full animate-pulse" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-white">Manage Teams</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            Register teams, approve registrations, and manage team allocations
                        </p>
                        <button
                            onClick={() => navigate(`/dashboard/tournaments/${id}/teams`)}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        >
                            View Teams
                        </button>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-white">View Matches</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            See all matches, update scores, and track tournament progress
                        </p>
                        <button
                            onClick={() => navigate(`/dashboard/tournaments/${id}/matches`)}
                            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                        >
                            View Matches
                        </button>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="font-semibold text-white">Standings</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            View current standings, rankings, and team performance
                        </p>
                        <button
                            onClick={() => navigate(`/dashboard/tournaments/${id}/standings`)}
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                        >
                            View Standings
                        </button>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-orange-400" />
                            </div>
                            <h3 className="font-semibold text-white">Player Stats</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            View player leaderboards and performance statistics
                        </p>
                        <button
                            onClick={() => navigate(`/dashboard/tournaments/${id}/players`)}
                            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
                        >
                            View Leaderboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetail;
