import ReactLoader from '@/common/ReactLoader';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/layouts/Header/Header';
import { getAllLeagues, getTournamentsByLeague, getTournamentPlayerRankings, getTournamentStandings, getTournamentMatches, getTournamentTeams } from '@/services/api';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy, Users, ChevronRight, Award, Flag, Target, Shield, Zap, User, MapPin, AlertCircle, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const baseURL = import.meta.env.VITE_BASE_URL;

function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [leaguesData, setLeaguesData] = useState([]);
    const [tournamentsList, setTournamentsList] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState('');
    const [selectedTournament, setSelectedTournament] = useState('');
    const [playersData, setPlayersData] = useState({});
    const [standings, setStandings] = useState([]);
    const [matches, setMatches] = useState([]);
    const [tournamentInfo, setTournamentInfo] = useState(null);
    const [activeTab, setActiveTab] = useState('rankings');
    const [selectedStage, setSelectedStage] = useState('all');
    const [allTeams, setAllTeams] = useState([]);
    const navigate = useNavigate();
    const userType = localStorage.getItem('userType');

    // Stage options
    const stages = [
        { id: "all", label: "All Stages" },
        { id: "regular_round", label: "Regular Round" },
        { id: "quarter_final", label: "Quarter Finals" },
        { id: "semi_final", label: "Semi Finals" },
        { id: "final", label: "Final" }
    ];

    // Position configurations
    const positions = [
        { id: "rusher", name: "Rushers", icon: Zap, color: "from-blue-600 to-blue-500", dataKey: "rusherSorted", pointsKey: "totalRusherPoints" },
        { id: "attacker", name: "Attackers", icon: Target, color: "from-red-600 to-red-500", dataKey: "attackerSorted", pointsKey: "totalAttackerPoints" },
        { id: "defender", name: "Defenders", icon: Shield, color: "from-green-600 to-green-500", dataKey: "defenderSorted", pointsKey: "totalDefenderPoints" },
        { id: "qb", name: "Quarterbacks", icon: Trophy, color: "from-purple-600 to-purple-500", dataKey: "qbSorted", pointsKey: "totalQbPoints" },
    ];

    useEffect(() => {
        if (userType) {
            navigate('/dashboard');
        }
        fetchLeagues();
    }, []);

    useEffect(() => {
        if (selectedLeague) {
            fetchTournaments();
        } else {
            setTournamentsList([]);
            setSelectedTournament('');
        }
    }, [selectedLeague]);

    useEffect(() => {
        if (selectedTournament) {
            fetchTournamentData();
        } else {
            setPlayersData({});
            setStandings([]);
            setMatches([]);
            setTournamentInfo(null);
            setAllTeams([]);
        }
    }, [selectedTournament]);

    const fetchLeagues = async () => {
        try {
            const response = await getAllLeagues();
            setLeaguesData(response.leagues || []);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchTournaments = async () => {
        try {
            setIsLoading(true);
            const data = await getTournamentsByLeague(selectedLeague);
            if (data && data.tournaments) {
                setTournamentsList(data.tournaments);
            }
        } catch (error) {
            console.log("Error fetching tournaments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate standings from matches (for stage filtering)
    const calculateStandingsFromMatches = (teamsList, matchesList, stage) => {
        // Initialize stats for all teams
        const teamStats = new Map();
        teamsList.forEach(v2Team => {
            const teamInfo = v2Team.team || {};
            teamStats.set(v2Team._id, {
                _id: v2Team._id,
                teamId: teamInfo._id,
                teamName: teamInfo.teamName || 'Unknown Team',
                teamImage: teamInfo.teamImage,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifference: 0,
                points: 0
            });
        });

        // Filter matches by stage if specified
        const filteredMatches = stage === 'all'
            ? matchesList.filter(m => m.status === 'completed')
            : matchesList.filter(m => m.status === 'completed' && m.stage === stage);

        // Process each match
        filteredMatches.forEach(match => {
            const homeTeamId = match.homeTeam?._id;
            const awayTeamId = match.awayTeam?._id;

            if (!homeTeamId || !awayTeamId) return;

            const homeStats = teamStats.get(homeTeamId);
            const awayStats = teamStats.get(awayTeamId);

            if (!homeStats || !awayStats) return;

            // Update played
            homeStats.played++;
            awayStats.played++;

            // Update goals
            const homeScore = match.homeScore ?? 0;
            const awayScore = match.awayScore ?? 0;

            homeStats.goalsFor += homeScore;
            homeStats.goalsAgainst += awayScore;
            awayStats.goalsFor += awayScore;
            awayStats.goalsAgainst += homeScore;

            // Update W/D/L and points
            if (homeScore > awayScore) {
                homeStats.won++;
                homeStats.points += 3;
                awayStats.lost++;
            } else if (awayScore > homeScore) {
                awayStats.won++;
                awayStats.points += 3;
                homeStats.lost++;
            } else {
                homeStats.drawn++;
                awayStats.drawn++;
                homeStats.points += 1;
                awayStats.points += 1;
            }
        });

        // Calculate goal difference and convert to array
        const standingsArray = Array.from(teamStats.values()).map(team => ({
            ...team,
            goalDifference: team.goalsFor - team.goalsAgainst
        }));

        // Sort by points, then goal difference
        return standingsArray.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.goalDifference - a.goalDifference;
        });
    };

    // Effect to recalculate standings when stage changes
    useEffect(() => {
        if (selectedTournament && allTeams.length > 0 && matches.length > 0) {
            const calculatedStandings = calculateStandingsFromMatches(allTeams, matches, selectedStage);
            setStandings(calculatedStandings);
        }
    }, [selectedStage, allTeams, matches]);

    const fetchStandings = async () => {
        if (!selectedTournament) return;

        try {
            // Ensure allTeams are fetched if not already available
            let currentTeams = allTeams;
            if (currentTeams.length === 0) {
                const teamsRes = await getTournamentTeams(selectedTournament).catch(() => null);
                if (teamsRes?.status === 'SUCCESS' && Array.isArray(teamsRes.teams)) {
                    currentTeams = teamsRes.teams;
                    setAllTeams(currentTeams);
                }
            }

            // Ensure matches are fetched if not already available
            let currentMatches = matches;
            if (currentMatches.length === 0) {
                const matchesRes = await getTournamentMatches(selectedTournament).catch(() => null);
                if (matchesRes?.status === 'SUCCESS') {
                    currentMatches = matchesRes.matches || [];
                    setMatches(currentMatches);
                }
            }

            // Calculate standings using the helper function
            const calculatedStandings = calculateStandingsFromMatches(currentTeams, currentMatches, selectedStage);
            setStandings(calculatedStandings);

        } catch (error) {
            console.error("Error fetching standings:", error);
        }
    };

    const fetchTournamentData = async () => {
        if (!selectedTournament) return;

        setIsLoading(true);
        setSelectedStage('all'); // Reset stage filter

        try {
            // Fetch all data in parallel
            const [rankingsRes, standingsRes, matchesRes, teamsRes] = await Promise.all([
                getTournamentPlayerRankings(selectedTournament).catch(() => null),
                getTournamentStandings(selectedTournament).catch(() => null),
                getTournamentMatches(selectedTournament).catch(() => null),
                getTournamentTeams(selectedTournament).catch(() => null)
            ]);

            // Process rankings
            if (rankingsRes?.status === 'SUCCESS' && rankingsRes.rankings) {
                const { topRushers, topDefenders, topQuarterbacks, topAttackers } = rankingsRes.rankings;

                const mapPlayers = (players, pointsKey, sourceKey) =>
                    (players || []).map(p => ({
                        playerId: p._id,
                        playerName: p.player?.[0]?.playerName || p.player?.name || 'Unknown',
                        teamName: p.team?.[0]?.teamName || 'Unknown',
                        [pointsKey]: p[sourceKey] || 0
                    }));

                setPlayersData({
                    rusherSorted: mapPlayers(topRushers, 'totalRusherPoints', 'rusherPoints'),
                    attackerSorted: mapPlayers(topAttackers, 'totalAttackerPoints', 'attackerPoints'),
                    defenderSorted: mapPlayers(topDefenders, 'totalDefenderPoints', 'defencePoints'),
                    qbSorted: mapPlayers(topQuarterbacks, 'totalQbPoints', 'qbPoints')
                });
            }

            // Store all teams
            let teamsList = [];
            if (teamsRes?.status === 'SUCCESS' && Array.isArray(teamsRes.teams)) {
                teamsList = teamsRes.teams;
                setAllTeams(teamsList);
            }

            // Process standings with teams merge
            let standingsData = [];
            if (standingsRes?.status === 'SUCCESS') {
                if (Array.isArray(standingsRes.standings)) {
                    standingsData = standingsRes.standings;
                } else if (standingsRes.standings && typeof standingsRes.standings === 'object') {
                    Object.values(standingsRes.standings).forEach(group => {
                        if (Array.isArray(group)) {
                            standingsData = [...standingsData, ...group];
                        }
                    });
                }
            }

            // Merge teams with standings
            const mergedStandings = teamsList.map(v2Team => {
                const teamId = v2Team.team?._id;
                const standing = standingsData.find(s => {
                    const sTeamId = s.tournamentTeam?.team?._id || s.team?._id;
                    return sTeamId === teamId;
                });

                const teamInfo = v2Team.team || {};
                return {
                    _id: v2Team._id,
                    teamId: teamInfo._id,
                    teamName: teamInfo.teamName || 'Unknown Team',
                    teamImage: teamInfo.teamImage,
                    points: standing?.points || v2Team.stats?.points || 0,
                    played: standing?.played || v2Team.stats?.played || 0,
                    won: standing?.won || v2Team.stats?.won || 0,
                    lost: standing?.lost || v2Team.stats?.lost || 0,
                    drawn: standing?.drawn || v2Team.stats?.drawn || 0,
                    goalsFor: standing?.goalsFor || v2Team.stats?.goalsFor || 0,
                    goalsAgainst: standing?.goalsAgainst || v2Team.stats?.goalsAgainst || 0,
                    goalDifference: (standing?.goalsFor || v2Team.stats?.goalsFor || 0) - (standing?.goalsAgainst || v2Team.stats?.goalsAgainst || 0)
                };
            });

            const sortedStandings = mergedStandings.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                return b.goalDifference - a.goalDifference;
            });
            setStandings(sortedStandings);

            // Process matches
            if (matchesRes?.status === 'SUCCESS') {
                setMatches(matchesRes.matches || []);
            }

            // Get tournament info
            const tourney = tournamentsList.find(t => t._id === selectedTournament);
            setTournamentInfo(tourney);

        } catch (error) {
            console.error("Error fetching tournament data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Position Stats Component
    const PositionStats = ({ position }) => {
        const Icon = position.icon;
        const players = playersData[position.dataKey] || [];
        const sortedPlayers = [...players].sort((a, b) => (b[position.pointsKey] || 0) - (a[position.pointsKey] || 0)).slice(0, 5);

        return (
            <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className={`bg-gradient-to-r ${position.color} px-4 py-3`}>
                    <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-white" />
                        <h3 className="text-lg font-bold text-white">{position.name}</h3>
                        <span className="ml-auto px-2 py-0.5 bg-white/20 rounded-full text-white text-xs">{players.length}</span>
                    </div>
                </div>
                {sortedPlayers.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No data available</div>
                ) : (
                    <div className="divide-y divide-slate-700">
                        {sortedPlayers.map((player, index) => (
                            <div key={player.playerId || index} className="flex items-center justify-between p-3 hover:bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                        {index === 0 ? <Trophy className="w-4 h-4 text-yellow-500" /> :
                                            index === 1 ? <Award className="w-4 h-4 text-slate-400" /> :
                                                index === 2 ? <Award className="w-4 h-4 text-orange-500" /> :
                                                    <span className="text-xs text-slate-400">#{index + 1}</span>}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white text-sm">{player.playerName}</p>
                                        <p className="text-xs text-slate-400">{player.teamName}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-orange-500">{player[position.pointsKey] || 0}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-[#0f172a] text-slate-200">
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600/20 rounded-full mb-4">
                            <Trophy className="w-5 h-5 text-orange-500" />
                            <span className="text-sm font-medium text-orange-400">Tournament Hub</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                            Tournament Summary
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
                            Select a league and tournament to view player rankings, standings, and match results
                        </p>
                    </div>

                    {/* Selectors */}
                    <div className="bg-[#1e293b] rounded-xl p-4 sm:p-6 border border-slate-700 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* League Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Select League</label>
                                <Select value={selectedLeague} onValueChange={(val) => { setSelectedLeague(val); setSelectedTournament(''); }}>
                                    <SelectTrigger className="w-full h-12 bg-[#0f172a] border-slate-600 text-slate-200">
                                        <SelectValue placeholder="Choose a league..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1e293b] border-slate-700">
                                        {leaguesData.map((league) => (
                                            <SelectItem key={league._id} value={league._id} className="text-slate-200 focus:bg-slate-700">
                                                {league.leagueName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tournament Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Select Tournament</label>
                                <Select value={selectedTournament} onValueChange={setSelectedTournament} disabled={!selectedLeague}>
                                    <SelectTrigger className="w-full h-12 bg-[#0f172a] border-slate-600 text-slate-200 disabled:opacity-50">
                                        <SelectValue placeholder={selectedLeague ? "Choose a tournament..." : "Select a league first"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1e293b] border-slate-700">
                                        {tournamentsList.map((tournament) => (
                                            <SelectItem key={tournament._id} value={tournament._id} className="text-slate-200 focus:bg-slate-700">
                                                {tournament.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <ReactLoader />
                        </div>
                    )}

                    {/* No Selection */}
                    {!isLoading && !selectedTournament && (
                        <div className="bg-[#1e293b] rounded-xl p-12 text-center border border-slate-700">
                            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Select a Tournament</h3>
                            <p className="text-slate-400">Choose a league and tournament above to view the summary</p>
                        </div>
                    )}

                    {/* Tournament Content */}
                    {!isLoading && selectedTournament && (
                        <div className="space-y-6">
                            {/* Tournament Info Card */}
                            {tournamentInfo && (
                                <div className="bg-gradient-to-r from-orange-600/20 to-slate-800 rounded-xl p-6 border border-orange-500/30">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="p-3 bg-orange-600 rounded-xl">
                                            <Trophy className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-white">{tournamentInfo.name}</h2>
                                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-300">
                                                <span className="flex items-center gap-1"><Flag className="w-4 h-4" />{tournamentInfo.category?.name || 'Open'}</span>
                                                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{standings.length} Teams</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${tournamentInfo.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                                                    tournamentInfo.status === 'in_progress' ? 'bg-blue-900/50 text-blue-400' : 'bg-slate-700 text-slate-300'
                                                    }`}>
                                                    {tournamentInfo.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tabs */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="w-full bg-[#1e293b] border border-slate-700 p-1">
                                    <TabsTrigger value="rankings" className="flex-1 data-[state=active]:bg-orange-600">Player Rankings</TabsTrigger>
                                    <TabsTrigger value="standings" className="flex-1 data-[state=active]:bg-orange-600">Standings</TabsTrigger>
                                    <TabsTrigger value="matches" className="flex-1 data-[state=active]:bg-orange-600">Matches</TabsTrigger>
                                </TabsList>

                                {/* Rankings Tab */}
                                <TabsContent value="rankings" className="mt-6">
                                    {Object.keys(playersData).length === 0 || positions.every(p => (playersData[p.dataKey] || []).length === 0) ? (
                                        <div className="bg-[#1e293b] rounded-xl p-12 text-center border border-slate-700">
                                            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-white mb-2">No Player Rankings Available</h3>
                                            <p className="text-slate-400">Player statistics will appear once matches are completed.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {positions.map((position) => (
                                                <PositionStats key={position.id} position={position} />
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Standings Tab */}
                                <TabsContent value="standings" className="mt-6">
                                    {/* Stage Filter */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Users className="w-5 h-5 text-orange-500" />
                                            Team Standings
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-slate-400" />
                                            <Select value={selectedStage} onValueChange={setSelectedStage}>
                                                <SelectTrigger className="w-[180px] h-10 bg-[#0f172a] border-slate-600 text-slate-200">
                                                    <SelectValue placeholder="Filter by stage" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1e293b] border-slate-700">
                                                    {stages.map((stage) => (
                                                        <SelectItem key={stage.id} value={stage.id} className="text-slate-200 focus:bg-slate-700">
                                                            {stage.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {standings.length === 0 ? (
                                        <div className="bg-[#1e293b] rounded-xl p-12 text-center border border-slate-700">
                                            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-400">No teams in this tournament yet</p>
                                        </div>
                                    ) : (
                                        <div className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-[#0f172a] border-b border-slate-700">
                                                        <TableHead className="text-slate-300 w-12">#</TableHead>
                                                        <TableHead className="text-slate-300">Team</TableHead>
                                                        <TableHead className="text-slate-300 text-center">P</TableHead>
                                                        <TableHead className="text-slate-300 text-center">W</TableHead>
                                                        <TableHead className="text-slate-300 text-center">D</TableHead>
                                                        <TableHead className="text-slate-300 text-center">L</TableHead>
                                                        <TableHead className="text-slate-300 text-center">GF</TableHead>
                                                        <TableHead className="text-slate-300 text-center">GA</TableHead>
                                                        <TableHead className="text-slate-300 text-center">GD</TableHead>
                                                        <TableHead className="text-slate-300 text-center">Pts</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {standings.map((team, index) => (
                                                        <TableRow key={team._id || team.teamId || index} className="border-b border-slate-700 hover:bg-slate-800/50">
                                                            <TableCell className="font-medium text-center">
                                                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-900/50 text-yellow-400' :
                                                                    index === 1 ? 'bg-slate-600 text-slate-300' :
                                                                        index === 2 ? 'bg-orange-900/50 text-orange-400' : 'bg-slate-800 text-slate-400'
                                                                    }`}>
                                                                    {index + 1}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <img
                                                                        src={team.teamImage || '/placeholder-team.png'}
                                                                        alt={team.teamName}
                                                                        className="w-8 h-8 rounded-full object-cover border border-slate-600"
                                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/32'; }}
                                                                    />
                                                                    <span className="font-medium text-white">{team.teamName}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center text-slate-300">{team.played || 0}</TableCell>
                                                            <TableCell className="text-center text-green-400">{team.won || 0}</TableCell>
                                                            <TableCell className="text-center text-slate-400">{team.drawn || 0}</TableCell>
                                                            <TableCell className="text-center text-red-400">{team.lost || 0}</TableCell>
                                                            <TableCell className="text-center text-slate-300">{team.goalsFor || 0}</TableCell>
                                                            <TableCell className="text-center text-slate-300">{team.goalsAgainst || 0}</TableCell>
                                                            <TableCell className="text-center">
                                                                <span className={team.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                                    {team.goalDifference > 0 ? '+' : ''}{team.goalDifference || 0}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-orange-500">{team.points || 0}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Matches Tab */}
                                <TabsContent value="matches" className="mt-6">
                                    {matches.length === 0 ? (
                                        <div className="bg-[#1e293b] rounded-xl p-12 text-center border border-slate-700">
                                            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-400">No matches scheduled</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {matches.map((match) => (
                                                <div key={match._id} className="bg-[#1e293b] rounded-xl p-4 border border-slate-700 hover:border-orange-500/50 transition-colors">
                                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                                        {/* Home Team */}
                                                        <div className="flex-1 flex items-center justify-end gap-2 text-right">
                                                            <span className="font-medium text-white">{match.homeTeam?.team?.teamName || 'TBD'}</span>
                                                            <img
                                                                src={match.homeTeam?.team?.teamImage || '/placeholder-team.png'}
                                                                alt=""
                                                                className="w-10 h-10 rounded-full object-cover"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                                                            />
                                                        </div>

                                                        {/* Score */}
                                                        <div className="px-4 py-2 bg-slate-800 rounded-lg text-center min-w-[80px]">
                                                            {match.status === 'completed' ? (
                                                                <span className="text-xl font-bold text-white">
                                                                    {match.homeScore ?? 0} - {match.awayScore ?? 0}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-slate-400">
                                                                    {match.scheduledAt ? moment(match.scheduledAt).format('MMM DD') : 'TBD'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Away Team */}
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <img
                                                                src={match.awayTeam?.team?.teamImage || '/placeholder-team.png'}
                                                                alt=""
                                                                className="w-10 h-10 rounded-full object-cover"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                                                            />
                                                            <span className="font-medium text-white">{match.awayTeam?.team?.teamName || 'TBD'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Match Info */}
                                                    <div className="flex flex-wrap justify-center gap-4 mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Flag className="w-3 h-3" /> {match.stage?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Match'}
                                                        </span>
                                                        {match.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" /> {match.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

export default Home