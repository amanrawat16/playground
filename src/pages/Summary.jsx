import Header from "@/layouts/Header/Header";
import ReactLoader from "@/common/ReactLoader";
import { baseURL, getAllLeagues, getAllTeamsBasedOnLeague } from "@/services/api";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Users, Target, TrendingUp, BarChart3 } from "lucide-react";

function Summary() {
    const [isLoading, setIsLoading] = useState(false);
    const [teamsList, setTeamsList] = useState([]);
    const [leaguesList, setLeaguesList] = useState([]);
    const [selectedLeagueId, setSelectedLeague] = useState('');
    const [selectedLeagueName, setSelectedLeagueName] = useState('');

    const fetchLeagues = async () => {
        try {
            setIsLoading(true);
            const data = await getAllLeagues();
            if (data) setIsLoading(false);
            setLeaguesList(data?.leagues || []);
        } catch (error) {
            setIsLoading(false);
            console.log("Getting an error while fetching leagues list: ", error);
        }
    };

    const fetchTeamsListBasedOnLeague = async (selectedLeagueId) => {
        try {
            setIsLoading(true);
            const data = await getAllTeamsBasedOnLeague(selectedLeagueId);
            if (data) setIsLoading(false);
            // Sort teams by points (descending) and then by score difference
            const sortedTeams = (data?.teams || []).sort((a, b) => {
                if (b.pointsScored !== a.pointsScored) {
                    return b.pointsScored - a.pointsScored;
                }
                const diffA = (a.goalsScoredByTeam || 0) - (a.goalsScoredAgainstTeams || 0);
                const diffB = (b.goalsScoredByTeam || 0) - (b.goalsScoredAgainstTeams || 0);
                return diffB - diffA;
            });
            setTeamsList(sortedTeams);
        } catch (error) {
            setIsLoading(false);
            console.log("Getting an error while fetching teams list: ", error);
        }
    };

    const handleLeagueChange = (value) => {
        const selectedLeague = leaguesList.find(league => league._id === value);
        setSelectedLeague(value);
        setSelectedLeagueName(selectedLeague?.leagueName || '');
        if (value) {
            fetchTeamsListBasedOnLeague(value);
        } else {
            setTeamsList([]);
        }
    };

    useEffect(() => {
        fetchLeagues();
    }, []);

    // Team Card Component for Mobile
    const TeamCard = ({ team, rank }) => {
        const scoreDiff = (team.goalsScoredByTeam || 0) - (team.goalsScoredAgainstTeams || 0);
        const getRankBadge = () => {
            if (rank === 1) return '🥇';
            if (rank === 2) return '🥈';
            if (rank === 3) return '🥉';
            return `#${rank}`;
        };

        const getRankColor = () => {
            if (rank === 1) return 'from-yellow-400 to-yellow-600';
            if (rank === 2) return 'from-gray-300 to-gray-500';
            if (rank === 3) return 'from-orange-300 to-orange-500';
            return 'from-gray-100 to-gray-200';
        };

        return (
            <div className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 ${rank <= 3 ? 'border-orange-500' : 'border-gray-300'}`}>
                <div className="p-4 sm:p-5">
                    {/* Header with Rank and Team Info */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${getRankColor()} flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md`}>
                                {getRankBadge()}
                            </div>
                            <img
                                src={`${baseURL}/uploads/${team?.teamImage?.split('\\').pop()?.split('/').pop()}`}
                                alt={team?.teamName || "team"}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg';
                                }}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200 shadow-md flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                    {team?.teamName}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {team?.pointsScored || 0} Points
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
                                <BarChart3 className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase">Played</span>
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-gray-900">{team?.totalMatchesPlayed || 0}</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                                <Trophy className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase">Won</span>
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-green-600">{team?.wonMatches || 0}</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 text-red-600 mb-1">
                                <TrendingUp className="w-4 h-4 rotate-180" />
                                <span className="text-xs font-semibold uppercase">Lost</span>
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-red-600">{team?.lostMatches || 0}</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                                <Target className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase">Tied</span>
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-blue-600">{team?.tieMatches || 0}</p>
                        </div>
                    </div>

                    {/* Goals Stats */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Goals For</p>
                            <p className="text-sm sm:text-base font-bold text-gray-900">{team?.goalsScoredByTeam || 0}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Goals Against</p>
                            <p className="text-sm sm:text-base font-bold text-gray-900">{team?.goalsScoredAgainstTeams || 0}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Difference</p>
                            <p className={`text-sm sm:text-base font-bold ${scoreDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {scoreDiff >= 0 ? '+' : ''}{scoreDiff}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const columns = [
        {
            title: 'Rank',
            align: "center",
            key: 'rank',
            width: 80,
            render: (_, __, index) => {
                const rank = index + 1;
                if (rank === 1) return <span className="text-2xl">🥇</span>;
                if (rank === 2) return <span className="text-2xl">🥈</span>;
                if (rank === 3) return <span className="text-2xl">🥉</span>;
                return (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold">
                        {rank}
                    </span>
                );
            },
        },
        {
            title: 'Team',
            align: "left",
            key: 'team',
            render: (_, record) => (
                <div className="flex items-center space-x-3">
                    <img
                        src={`${baseURL}/uploads/${record?.teamImage?.split('\\').pop()?.split('/').pop()}`}
                        alt={record?.teamName || "team"}
                        className='h-10 w-10 rounded-full object-cover border-2 border-gray-200'
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg';
                        }}
                    />
                    <span className="font-semibold text-gray-900">{record?.teamName}</span>
                </div>
            ),
        },
        {
            title: 'Pts',
            align: "center",
            dataIndex: 'pointsScored',
            key: 'pointsScored',
            width: 80,
            render: (points) => (
                <span className="font-bold text-orange-600 text-lg">{points || 0}</span>
            ),
        },
        {
            title: 'P',
            align: "center",
            dataIndex: 'totalMatchesPlayed',
            key: 'totalMatchesPlayed',
            width: 60,
            render: (value) => (value ?? 0),
        },
        {
            title: 'W',
            align: "center",
            dataIndex: 'wonMatches',
            key: 'wonMatches',
            width: 60,
            render: (wins) => (
                <span className="font-semibold text-green-600">{wins ?? 0}</span>
            ),
        },
        {
            title: 'L',
            align: "center",
            dataIndex: 'lostMatches',
            key: 'lostMatches',
            width: 60,
            render: (losses) => (
                <span className="font-semibold text-red-600">{losses ?? 0}</span>
            ),
        },
        {
            title: 'T',
            align: "center",
            dataIndex: 'tieMatches',
            key: 'tieMatches',
            width: 60,
            render: (ties) => (
                <span className="font-semibold text-blue-600">{ties ?? 0}</span>
            ),
        },
        {
            title: 'GF',
            align: "center",
            dataIndex: 'goalsScoredByTeam',
            key: 'goalsScoredByTeam',
            width: 70,
            render: (value) => (value ?? 0),
        },
        {
            title: 'GA',
            align: "center",
            dataIndex: 'goalsScoredAgainstTeams',
            key: 'goalsScoredAgainstTeams',
            width: 70,
            render: (value) => (value ?? 0),
        },
        {
            title: 'GD',
            align: "center",
            key: 'goalDifference',
            width: 80,
            render: (_, record) => {
                const diff = (record.goalsScoredByTeam || 0) - (record.goalsScoredAgainstTeams || 0);
                return (
                    <span className={`font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diff >= 0 ? '+' : ''}{diff}
                    </span>
                );
            }
        },
    ];

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                    {/* Header Section */}
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full mb-4">
                            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                            Tournament Summary
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                            View team standings, statistics, and rankings for your selected league
                        </p>
                    </div>

                    {/* League Selector */}
                    <div className="mb-6 sm:mb-8 max-w-md mx-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select League
                        </label>
                        <Select
                            value={selectedLeagueId}
                            onValueChange={handleLeagueChange}
                        >
                            <SelectTrigger className="w-full h-12 bg-white border-2 border-gray-200 focus:border-orange-500">
                                <SelectValue placeholder="Select a league to view standings" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Leagues</SelectLabel>
                                    {leaguesList.length > 0 ? (
                                        leaguesList.map((league) => (
                                            <SelectItem value={league._id} key={league._id}>
                                                {league.leagueName}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>No leagues available</SelectItem>
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selected League Info */}
                    {selectedLeagueName && (
                        <div className="mb-6 text-center">
                            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-semibold">{selectedLeagueName}</span>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <ReactLoader />
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !selectedLeagueId && (
                        <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center max-w-md mx-auto">
                            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Trophy className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a League</h3>
                            <p className="text-gray-600">
                                Please select a league from the dropdown above to view team standings and statistics.
                            </p>
                        </div>
                    )}

                    {!isLoading && selectedLeagueId && teamsList.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center max-w-md mx-auto">
                            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Teams Found</h3>
                            <p className="text-gray-600">
                                There are no teams in this league yet. Check back later for team standings.
                            </p>
                        </div>
                    )}

                    {/* Mobile Card View */}
                    {!isLoading && teamsList.length > 0 && (
                        <div className="block lg:hidden space-y-4 sm:space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Team Standings</h2>
                                <span className="text-sm text-gray-600">{teamsList.length} teams</span>
                            </div>
                            {teamsList.map((team, index) => (
                                <TeamCard key={team._id || index} team={team} rank={index + 1} />
                            ))}
                        </div>
                    )}

                    {/* Desktop Table View */}
                    {!isLoading && teamsList.length > 0 && (
                        <div className="hidden lg:block">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Team Standings</h2>
                                <span className="text-sm text-gray-600">{teamsList.length} teams</span>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <Table>
                                    <TableCaption className="py-4 text-sm text-gray-500">
                                        Team standings sorted by points and goal difference
                                    </TableCaption>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-600 hover:to-orange-500">
                                            {columns.map((col) => (
                                                <TableHead key={col.key} className="text-white font-semibold" style={{ width: col.width }}>
                                                    {col.title}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teamsList.map((team, index) => (
                                            <TableRow key={team._id || index} className="hover:bg-gray-50 transition-colors">
                                                {columns.map((col) => {
                                                    // Get the value from team data if dataIndex exists
                                                    const cellValue = col.dataIndex ? team[col.dataIndex] : null;
                                                    
                                                    // Render the cell content
                                                    let cellContent;
                                                    if (col.render) {
                                                        // For columns with custom render function
                                                        cellContent = col.render(cellValue, team, index);
                                                    } else {
                                                        // For columns without render, use the value or fallback
                                                        cellContent = cellValue ?? '-';
                                                    }
                                                    
                                                    return (
                                                        <TableCell key={col.key} className={col.align === 'center' ? 'text-center' : ''}>
                                                            {cellContent}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

export default Summary;