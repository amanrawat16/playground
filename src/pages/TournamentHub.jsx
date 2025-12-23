import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Plus,
    Trophy,
    Calendar,
    Users,
    ChevronRight,
    Search,
    TrendingUp,
    Layers,
    Eye
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CreateLeagueModal from './CreateLeagueModal';

const TournamentHub = () => {
    const navigate = useNavigate();
    const [leagues, setLeagues] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leagueSearchQuery, setLeagueSearchQuery] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [isCreateLeagueOpen, setIsCreateLeagueOpen] = useState(false);

    // Pagination states
    const [leaguePage, setLeaguePage] = useState(1);
    const [tournamentPage, setTournamentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        fetchLeagues();
    }, []);

    useEffect(() => {
        if (selectedLeague) {
            fetchTournaments(selectedLeague);
        }
    }, [selectedLeague]);

    const fetchLeagues = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/comp/league/viewLeagues`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setLeagues(response.data.leagues || []);
                if (response.data.leagues?.length > 0 && !selectedLeague) {
                    setSelectedLeague(response.data.leagues[0]._id);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leagues:', error);
            toast.error('Failed to load leagues');
            setLoading(false);
        }
    };

    const fetchTournaments = async (leagueId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/api/v2/leagues/${leagueId}/tournaments`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setTournaments(response.data.tournaments || []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            setLoading(false);
        }
    };

    const getStageColor = (stage) => {
        const colors = {
            'setup': 'bg-slate-600',
            'registration': 'bg-blue-600',
            'group_allocation': 'bg-indigo-600',
            'regular_rounds': 'bg-purple-600',
            'quarter_finals': 'bg-pink-600',
            'semi_finals': 'bg-orange-600',
            'finals': 'bg-red-600',
            'completed': 'bg-green-600'
        };
        return colors[stage] || 'bg-gray-600';
    };

    const getStageLabel = (stage) => {
        const labels = {
            'setup': 'Setup',
            'registration': 'Registration',
            'group_allocation': 'Group Setup',
            'regular_rounds': 'Group Stage',
            'quarter_finals': 'Quarter Finals',
            'semi_finals': 'Semi Finals',
            'finals': 'Finals',
            'completed': 'Completed'
        };
        return labels[stage] || stage;
    };

    // Filtered & Paginated Leagues
    const filteredLeagues = leagues.filter(l =>
        l.leagueName.toLowerCase().includes(leagueSearchQuery.toLowerCase())
    );
    const totalLeaguePages = Math.ceil(filteredLeagues.length / ITEMS_PER_PAGE);
    const paginatedLeagues = filteredLeagues.slice(
        (leaguePage - 1) * ITEMS_PER_PAGE,
        leaguePage * ITEMS_PER_PAGE
    );

    // Filtered & Paginated Tournaments
    const filteredTournaments = tournaments.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalTournamentPages = Math.ceil(filteredTournaments.length / ITEMS_PER_PAGE);
    const paginatedTournaments = filteredTournaments.slice(
        (tournamentPage - 1) * ITEMS_PER_PAGE,
        tournamentPage * ITEMS_PER_PAGE
    );

    const selectedLeagueName = leagues.find(l => l._id === selectedLeague)?.leagueName || 'Select a league';

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-slate-200">
            <ToastContainer theme="dark" position="top-right" />

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Trophy className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Tournament Hub</h1>
                                <p className="text-slate-400 text-sm mt-1">Manage your leagues and tournaments</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsCreateLeagueOpen(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                            >
                                <Layers className="w-5 h-5" />
                                Create League
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/tournaments/create')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                <Plus className="w-5 h-5" />
                                Create Tournament
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Leagues Table */}
                <div className="mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Layers className="w-5 h-5 text-orange-500" />
                            Leagues ({filteredLeagues.length})
                        </h2>

                        {/* League Search */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search leagues..."
                                value={leagueSearchQuery}
                                onChange={(e) => {
                                    setLeagueSearchQuery(e.target.value);
                                    setLeaguePage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 text-sm"
                            />
                        </div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <TableHead className="text-slate-300 font-semibold">League Name</TableHead>
                                    <TableHead className="text-slate-300 font-semibold text-center">Tournaments</TableHead>
                                    <TableHead className="text-slate-300 font-semibold text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedLeagues.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-slate-400">
                                            No leagues found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedLeagues.map(league => (
                                        <TableRow
                                            key={league._id}
                                            className={`border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors ${selectedLeague === league._id ? 'bg-orange-500/10' : ''}`}
                                            onClick={() => {
                                                setSelectedLeague(league._id);
                                                setTournamentPage(1);
                                            }}
                                        >
                                            <TableCell className="font-medium text-white">
                                                <div className="flex items-center gap-3">
                                                    {selectedLeague === league._id && (
                                                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                                    )}
                                                    {league.leagueName}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center text-slate-300">
                                                {selectedLeague === league._id ? tournaments.length : '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedLeague(league._id);
                                                        setTournamentPage(1);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedLeague === league._id
                                                        ? 'bg-orange-600 text-white'
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                        }`}
                                                >
                                                    {selectedLeague === league._id ? 'Selected' : 'View'}
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* League Pagination */}
                    {totalLeaguePages > 1 && (
                        <div className="flex items-center justify-end gap-2 mt-4 text-sm">
                            <button
                                onClick={() => setLeaguePage(p => Math.max(1, p - 1))}
                                disabled={leaguePage === 1}
                                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-slate-400 px-2">
                                Page <span className="text-white font-medium">{leaguePage}</span> of <span className="text-white font-medium">{totalLeaguePages}</span>
                            </span>
                            <button
                                onClick={() => setLeaguePage(p => Math.min(totalLeaguePages, p + 1))}
                                disabled={leaguePage === totalLeaguePages}
                                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

                {/* Tournament Section */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-orange-500" />
                            Tournaments - {selectedLeagueName}
                        </h2>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search tournaments..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setTournamentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Total</span>
                                <Trophy className="w-4 h-4 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-white mt-1">{tournaments.length}</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Active</span>
                                <TrendingUp className="w-4 h-4 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold text-white mt-1">
                                {tournaments.filter(t => t.status === 'active').length}
                            </p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Completed</span>
                                <Calendar className="w-4 h-4 text-purple-400" />
                            </div>
                            <p className="text-2xl font-bold text-white mt-1">
                                {tournaments.filter(t => t.status === 'completed').length}
                            </p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Teams</span>
                                <Users className="w-4 h-4 text-orange-400" />
                            </div>
                            <p className="text-2xl font-bold text-white mt-1">
                                {tournaments.reduce((acc, t) => acc + (t.stats?.totalTeams || 0), 0)}
                            </p>
                        </div>
                    </div>

                    {/* Tournaments Table */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-slate-700 hover:bg-slate-700/50">
                                        <TableHead className="text-slate-300 font-semibold">Tournament Name</TableHead>
                                        <TableHead className="text-slate-300 font-semibold text-center">Stage</TableHead>
                                        <TableHead className="text-slate-300 font-semibold text-center">Teams</TableHead>
                                        <TableHead className="text-slate-300 font-semibold text-center">Matches</TableHead>
                                        <TableHead className="text-slate-300 font-semibold text-center">Progress</TableHead>
                                        <TableHead className="text-slate-300 font-semibold text-center">Created</TableHead>
                                        <TableHead className="text-slate-300 font-semibold text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedTournaments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12">
                                                <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                                <p className="text-slate-400 mb-4">No tournaments found</p>
                                                <button
                                                    onClick={() => navigate('/dashboard/tournaments/create')}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Create Tournament
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedTournaments.map(tournament => {
                                            const progress = tournament.stats?.totalMatches > 0
                                                ? Math.round((tournament.stats.completedMatches / tournament.stats.totalMatches) * 100)
                                                : 0;

                                            return (
                                                <TableRow
                                                    key={tournament._id}
                                                    className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors"
                                                    onClick={() => navigate(`/dashboard/tournaments/${tournament._id}`)}
                                                >
                                                    <TableCell className="font-medium text-white">
                                                        <div className="flex items-center gap-2">
                                                            <Trophy className="w-4 h-4 text-orange-500" />
                                                            {tournament.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white ${getStageColor(tournament.stage?.current)}`}>
                                                            {getStageLabel(tournament.stage?.current)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center text-slate-300">
                                                        {tournament.stats?.totalTeams || 0}
                                                    </TableCell>
                                                    <TableCell className="text-center text-slate-300">
                                                        {tournament.stats?.completedMatches || 0}/{tournament.stats?.totalMatches || 0}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-20 bg-slate-700 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-gradient-to-r from-orange-500 to-pink-600 h-2"
                                                                    style={{ width: `${progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-slate-400 w-10">{progress}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-slate-400 text-sm">
                                                        {new Date(tournament.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/dashboard/tournaments/${tournament._id}`);
                                                            }}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View
                                                        </button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Tournament Pagination */}
                    {totalTournamentPages > 1 && (
                        <div className="flex items-center justify-end gap-2 mt-4 text-sm">
                            <button
                                onClick={() => setTournamentPage(p => Math.max(1, p - 1))}
                                disabled={tournamentPage === 1}
                                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-slate-400 px-2">
                                Page <span className="text-white font-medium">{tournamentPage}</span> of <span className="text-white font-medium">{totalTournamentPages}</span>
                            </span>
                            <button
                                onClick={() => setTournamentPage(p => Math.min(totalTournamentPages, p + 1))}
                                disabled={tournamentPage === totalTournamentPages}
                                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create League Modal */}
            <CreateLeagueModal
                isOpen={isCreateLeagueOpen}
                onClose={() => setIsCreateLeagueOpen(false)}
                onSuccess={(newLeague) => {
                    fetchLeagues();
                    setSelectedLeague(newLeague._id);
                }}
            />
        </div>
    );
};

export default TournamentHub;
