import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournamentTeamPlayerStats } from '../../services/api';
import { ArrowLeft, User, Shield, Target, Award, Info } from 'lucide-react';

const TeamSummaryPage = () => {
    const { tournamentId, teamId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [teamStats, setTeamStats] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'rusher', 'attacker', 'defence', 'qb'

    useEffect(() => {
        const fetchTeamStats = async () => {
            if (!tournamentId || !teamId) return;

            try {
                setLoading(true);
                const response = await getTournamentTeamPlayerStats(tournamentId, teamId);

                if (response && response.status === 'SUCCESS') {
                    setTeamStats(response);
                } else {
                    setError("Failed to fetch team stats");
                }
            } catch (err) {
                console.error("Error loading team stats:", err);
                setError("Error loading team statistics. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeamStats();
    }, [tournamentId, teamId]);

    const handleBack = () => {
        navigate(-1);
    };

    const getFilteredPlayers = () => {
        if (!teamStats?.players) return [];

        // Sort logic can be customized based on tab if needed
        // Default sort is by total points (already sorted by backend)

        // Filter by position category if needed (though backend categorizes points, not necessarily players)
        // For now, we show all players but highlight the relevant columns
        return teamStats.players;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Loading team statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <div className="text-center p-8 bg-slate-800 rounded-lg max-w-md">
                    <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p className="text-slate-300 mb-6">{error}</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const teamName = teamStats?.team?.teamName || "Team Stats";
    const teamImage = teamStats?.team?.teamImage;
    const filteredPlayers = getFilteredPlayers();

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Summary</span>
                </button>

                <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                    {teamImage ? (
                        <img
                            src={teamImage}
                            alt={teamName}
                            className="w-24 h-24 rounded-full object-cover border-4 border-slate-700 shadow-xl"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600">
                            <Shield className="w-10 h-10 text-slate-400" />
                        </div>
                    )}

                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                            {teamName}
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                                <User className="w-4 h-4 text-blue-400" />
                                <span>{filteredPlayers.length} Players</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                                <Award className="w-4 h-4 text-yellow-400" />
                                <span>Tournament Stats</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-400" />
                            Player Performance Summary
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-medium border-b border-slate-700 sticky left-0 bg-slate-900/95 z-10 w-12 text-center">#</th>
                                    <th className="p-4 font-medium border-b border-slate-700 sticky left-12 bg-slate-900/95 z-10 min-w-[180px]">Player</th>
                                    <th className="p-4 font-medium border-b border-slate-700 text-center text-white bg-blue-900/20">Total Pts</th>
                                    <th className="p-4 font-medium border-b border-slate-700 text-center">Played</th>
                                    <th className="p-4 font-medium border-b border-slate-700 text-center">Rusher</th>
                                    <th className="p-4 font-medium border-b border-slate-700 text-center">Attacker</th>
                                    <th className="p-4 font-medium border-b border-slate-700 text-center">Defence</th>
                                    <th className="p-4 font-medium border-b border-slate-700 text-center">QB</th>
                                    <th className="p-4 font-medium border-b border-slate-700 text-center text-slate-500 hidden md:table-cell">Sacks</th>
                                    <th className="p-4 font-medium border-b border-slate-700 text-center text-slate-500 hidden md:table-cell">Int</th>
                                    <th className="p-4 font-medium border-b border-slate-700 text-center text-slate-500 hidden md:table-cell">TDs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredPlayers.length > 0 ? (
                                    filteredPlayers.map((player, index) => (
                                        <tr
                                            key={player.playerId}
                                            className="hover:bg-slate-700/30 transition-colors group"
                                        >
                                            <td className="p-4 text-center text-slate-500 font-mono sticky left-0 bg-slate-800 group-hover:bg-slate-700/30 z-10">
                                                {index + 1}
                                            </td>
                                            <td className="p-4 sticky left-12 bg-slate-800 group-hover:bg-slate-700/30 z-10">
                                                <div className="flex items-center gap-3">
                                                    {player.playerImage ? (
                                                        <img
                                                            src={player.playerImage}
                                                            alt={player.playerName}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-600"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600 text-slate-400">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                            {player.playerName}
                                                        </div>
                                                        <div className="text-xs text-slate-500 capitalize">
                                                            {player.position || 'Player'} {player.jerseyNumber && `• #${player.jerseyNumber}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-bold text-blue-400 bg-blue-900/10 text-lg">
                                                {player.totalPoints}
                                            </td>
                                            <td className="p-4 text-center text-slate-300 font-medium">
                                                {player.matchesPlayed}
                                            </td>
                                            <td className="p-4 text-center text-slate-400">
                                                {player.categories?.rusher || 0}
                                            </td>
                                            <td className="p-4 text-center text-slate-400">
                                                {player.categories?.attacker || 0}
                                            </td>
                                            <td className="p-4 text-center text-slate-400">
                                                {player.categories?.defence || 0}
                                            </td>
                                            <td className="p-4 text-center text-slate-400">
                                                {player.categories?.qb || 0}
                                            </td>

                                            {/* Detailed Stats - Hidden on Small Screens */}
                                            <td className="p-4 text-center text-slate-500 hidden md:table-cell">
                                                {player.detailedStats?.sacks || 0}
                                            </td>
                                            <td className="p-4 text-center text-slate-500 hidden md:table-cell">
                                                {player.detailedStats?.interceptions || 0}
                                            </td>
                                            <td className="p-4 text-center text-slate-500 hidden md:table-cell">
                                                {player.detailedStats?.touchdowns || 0}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <Info className="w-8 h-8 opacity-50" />
                                                <p>No player statistics available for this team yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamSummaryPage;
