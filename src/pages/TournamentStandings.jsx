import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    ArrowLeft,
    TrendingUp,
    Trophy,
    Target,
    Award,
    RefreshCw
} from 'lucide-react';

const TournamentStandings = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [standings, setStandings] = useState(null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedView, setSelectedView] = useState('overall'); // 'overall' or groupId
    const [recalculating, setRecalculating] = useState(false);
    const [tournamentTeams, setTournamentTeams] = useState([]);
    const [allMatches, setAllMatches] = useState([]);
    const [aggregatedStandings, setAggregatedStandings] = useState([]);
    const [isLoadingAggregated, setIsLoadingAggregated] = useState(false);

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        fetchTournamentDetails();
        fetchGroups();
        fetchTournamentTeams();
        fetchAllTournamentMatches();
    }, [id]);

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
        }
    };



    const fetchTournamentTeams = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${id}/teams`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setTournamentTeams(response.data.teams || []);
            }
        } catch (error) {
            console.error('Error fetching tournament teams:', error);
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

    const fetchAllTournamentMatches = async () => {
        setIsLoadingAggregated(true);
        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${id}/matches`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setAllMatches(response.data.matches || []);
            }
        } catch (error) {
            console.error('Error fetching tournament matches:', error);
        } finally {
            setIsLoadingAggregated(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (allMatches.length >= 0) {
            calculateAggregatedStandings(allMatches);
        }
    }, [allMatches, tournamentTeams]);

    const calculateAggregatedStandings = (matchesData) => {
        const teamStats = new Map();

        // Initialize with ALL tournament teams to ensure they all show up
        tournamentTeams.forEach(tTeam => {
            if (!tTeam.team) return;
            teamStats.set(tTeam._id, {
                tournamentTeam: tTeam._id,
                team: {
                    _id: tTeam.team._id,
                    name: tTeam.team.teamName,
                    logo: tTeam.team.teamImage
                },
                groupId: tTeam.group?._id || tTeam.group,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifference: 0,
                points: 0,
                form: []
            });
        });

        // Process only completed matches
        const completedMatches = matchesData.filter(m => m.status === 'completed');

        completedMatches.forEach(match => {
            const processTeam = (teamObj, score, oppScore, points) => {
                if (!teamObj || !teamObj.team) return;
                const teamId = teamObj._id;
                const teamName = teamObj.team.teamName;
                const teamLogo = teamObj.team.teamImage;

                if (!teamStats.has(teamId)) {
                    teamStats.set(teamId, {
                        tournamentTeam: teamId,
                        team: { _id: teamObj.team._id, name: teamName, logo: teamLogo },
                        played: 0,
                        won: 0,
                        drawn: 0,
                        lost: 0,
                        goalsFor: 0,
                        goalsAgainst: 0,
                        goalDifference: 0,
                        points: 0,
                        form: []
                    });
                }

                const stats = teamStats.get(teamId);
                stats.played += 1;
                stats.goalsFor += score;
                stats.goalsAgainst += oppScore;
                stats.points += points;

                if (score > oppScore) {
                    stats.won += 1;
                    stats.form.push('W');
                } else if (score < oppScore) {
                    stats.lost += 1;
                    stats.form.push('L');
                } else {
                    stats.drawn += 1;
                    stats.form.push('D');
                }
            };

            processTeam(match.homeTeam, match.homeScore, match.awayScore, match.pointsAwarded?.home || 0);
            processTeam(match.awayTeam, match.awayScore, match.homeScore, match.pointsAwarded?.away || 0);
        });

        // Convert Map to array and sort
        const aggregated = Array.from(teamStats.values()).map(stats => ({
            ...stats,
            goalDifference: stats.goalsFor - stats.goalsAgainst,
            form: stats.form.slice(-5)
        })).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        }).map((stats, index) => ({
            ...stats,
            position: index + 1
        }));

        setAggregatedStandings(aggregated);
    };

    const handleRecalculate = async () => {
        setRecalculating(true);
        try {
            await axios.post(`${API_BASE}/api/v2/tournaments/${id}/recalculate-standings`, {}, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            toast.success('Standings recalculated successfully!');
            fetchAllTournamentMatches();
        } catch (error) {
            console.error('Error recalculating standings:', error);
            toast.error('Failed to recalculate standings');
        } finally {
            setRecalculating(false);
        }
    };

    const getPositionColor = (position) => {
        if (position === 1) return 'text-yellow-400';
        if (position === 2) return 'text-slate-300';
        if (position === 3) return 'text-orange-400';
        return 'text-slate-500';
    };

    const getFormBadge = (result) => {
        const styles = {
            W: 'bg-green-600 text-white',
            D: 'bg-yellow-600 text-white',
            L: 'bg-red-600 text-white'
        };
        return styles[result] || 'bg-slate-600 text-white';
    };

    const renderStandingsTable = (standingsData) => {
        if (!standingsData || standingsData.length === 0) {
            return (
                <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No standings data available</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="text-left py-4 px-4 text-slate-400 font-semibold text-sm">#</th>
                            <th className="text-left py-4 px-4 text-slate-400 font-semibold text-sm">Team</th>
                            <th className="text-center py-4 px-2 text-slate-400 font-semibold text-sm">P</th>
                            <th className="text-center py-4 px-2 text-slate-400 font-semibold text-sm">W</th>
                            <th className="text-center py-4 px-2 text-slate-400 font-semibold text-sm">D</th>
                            <th className="text-center py-4 px-2 text-slate-400 font-semibold text-sm">L</th>
                            <th className="text-center py-4 px-2 text-slate-400 font-semibold text-sm">GF</th>
                            <th className="text-center py-4 px-2 text-slate-400 font-semibold text-sm">GA</th>
                            <th className="text-center py-4 px-2 text-slate-400 font-semibold text-sm">GD</th>
                            <th className="text-center py-4 px-4 text-slate-400 font-semibold text-sm">Pts</th>
                            <th className="text-center py-4 px-4 text-slate-400 font-semibold text-sm">Form</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standingsData.map((team, index) => (
                            <tr
                                key={team.tournamentTeam || index}
                                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                            >
                                <td className="py-4 px-4">
                                    <span className={`text-2xl font-bold ${getPositionColor(team.position)}`}>
                                        {team.position}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        {/* Handle both local aggregation and backend structures */}
                                        {(() => {
                                            const teamData = team.team || team.tournamentTeam?.team;
                                            const name = teamData?.name || teamData?.teamName || 'Unknown';
                                            const logo = teamData?.logo || teamData?.teamImage;

                                            return (
                                                <>
                                                    {logo && (
                                                        <img
                                                            src={logo}
                                                            alt={name}
                                                            className="w-8 h-8 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <span className="font-semibold text-white">{name}</span>
                                                </>
                                            )
                                        })()}
                                    </div>
                                </td>
                                <td className="py-4 px-2 text-center text-slate-300">{team.played}</td>
                                <td className="py-4 px-2 text-center text-green-400 font-semibold">{team.won}</td>
                                <td className="py-4 px-2 text-center text-yellow-400 font-semibold">{team.drawn}</td>
                                <td className="py-4 px-2 text-center text-red-400 font-semibold">{team.lost}</td>
                                <td className="py-4 px-2 text-center text-slate-300">{team.goalsFor}</td>
                                <td className="py-4 px-2 text-center text-slate-300">{team.goalsAgainst}</td>
                                <td className="py-4 px-2 text-center">
                                    <span className={team.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="text-xl font-bold text-white">{team.points}</span>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-center gap-1">
                                        {team.form?.slice(-5).map((result, idx) => (
                                            <span
                                                key={idx}
                                                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${getFormBadge(result)}`}
                                            >
                                                {result}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
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
                            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-green-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Standings</h1>
                                <p className="text-slate-400 mt-1">{tournament?.name}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleRecalculate}
                            disabled={recalculating}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${recalculating ? 'animate-spin' : ''}`} />
                            {recalculating ? 'Recalculating...' : 'Recalculate'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* View Selector */}
                <div className="flex gap-2 mb-8 flex-wrap">
                    <button
                        onClick={() => setSelectedView('overall')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${selectedView === 'overall'
                            ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        Tournament Standings
                    </button>

                    {groups.length > 0 && (
                        <>
                            <div className="w-px h-12 bg-slate-700 mx-2 hidden sm:block" />
                            {groups.map(group => (
                                <button
                                    key={group._id}
                                    onClick={() => setSelectedView(group._id)}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${selectedView === group._id
                                        ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {group.name}
                                </button>
                            ))}
                        </>
                    )}
                </div>

                {/* Specific filtering for League View if a group was theoretically relevant across league, 
                    but usually groups are tournament-specific. The user mentioned "and in groups it will be same it just that teams are being filter out there".
                    If they want group filtering in League view, it might mean filtering by group NAME across the league.
                */}


                {/* Standings Table */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                    {(() => {
                        // Overall Tournament Standings (Aggregated across all stages)
                        if (selectedView === 'overall') {
                            return renderStandingsTable(aggregatedStandings);
                        }

                        const group = groups.find(g => g._id === selectedView);
                        if (group) {
                            // Filter aggregated standings for teams in this group
                            // We use the groupId stored in our aggregated objects
                            const filteredStandings = aggregatedStandings.filter(ls => ls.groupId === selectedView);

                            // Re-calculate positions for the filtered view if desired, 
                            // but usually group position is relative to that group.
                            const positionalGroupStandings = filteredStandings
                                .sort((a, b) => {
                                    if (b.points !== a.points) return b.points - a.points;
                                    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                                    return b.goalsFor - a.goalsFor;
                                })
                                .map((stats, index) => ({
                                    ...stats,
                                    position: index + 1
                                }));

                            return renderStandingsTable(positionalGroupStandings);
                        }

                        return null;
                    })()}
                </div>

                {/* Legend */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            Top Performers
                        </h3>
                        <div className="space-y-2 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center text-yellow-400 font-bold">1</span>
                                <span>Champion</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-slate-400/20 rounded flex items-center justify-center text-slate-300 font-bold">2</span>
                                <span>Runner-up</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-orange-500/20 rounded flex items-center justify-center text-orange-400 font-bold">3</span>
                                <span>Third Place</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-400" />
                            Form Guide
                        </h3>
                        <div className="space-y-2 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">W</span>
                                <span>Win</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-yellow-600 rounded flex items-center justify-center text-white font-bold text-xs">D</span>
                                <span>Draw</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">L</span>
                                <span>Loss</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-400" />
                            Abbreviations
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                            <div><span className="font-semibold text-white">P:</span> Played</div>
                            <div><span className="font-semibold text-white">W:</span> Won</div>
                            <div><span className="font-semibold text-white">D:</span> Drawn</div>
                            <div><span className="font-semibold text-white">L:</span> Lost</div>
                            <div><span className="font-semibold text-white">GF:</span> Goals For</div>
                            <div><span className="font-semibold text-white">GA:</span> Goals Against</div>
                            <div><span className="font-semibold text-white">GD:</span> Goal Difference</div>
                            <div><span className="font-semibold text-white">Pts:</span> Points</div>
                        </div>
                    </div>
                </div>

                {standings?.lastUpdated && (
                    <p className="text-center text-sm text-slate-500 mt-6">
                        Last updated: {new Date(standings.lastUpdated).toLocaleString()}
                    </p>
                )}
            </div>
        </div>
    );
};

export default TournamentStandings;
