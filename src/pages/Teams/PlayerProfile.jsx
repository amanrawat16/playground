import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPlayer } from '../../services/api'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Mail, Hash, Target, Shield, Calendar, MapPin, Trophy, TrendingUp, ArrowLeft, Loader2 } from "lucide-react";

function PlayerProfile() {
    const navigate = useNavigate()
    const { playerId } = useParams()
    const [playerDetail, setPlayerDetail] = useState({})
    const [isLoading, setIsLoading] = useState(true)

    const fetchPlayer = async () => {
        try {
            setIsLoading(true)
            const response = await getPlayer(playerId)
            if (response.status === "SUCCESS") {
                setPlayerDetail(response.data || {})
            }
        } catch (error) {
            console.error("Error fetching player:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Get player initials for avatar
    const getInitials = (name) => {
        if (!name) return "??"
        return name.split(" ").map(n => n[0]?.toUpperCase()).join("").slice(0, 2)
    }

    // Format player name
    const formatName = (name) => {
        if (!name) return "N/A"
        return name.split(" ").map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(" ")
    }

    // Calculate total stats
    const totalStats = playerDetail?.matchWiseDetails?.reduce((acc, match) => {
        const calc = match?.calculatedValue || {}
        return {
            totalPoints: acc.totalPoints + (calc.totalPointsScored || 0),
            rusherPoints: acc.rusherPoints + (calc.rusherPointsScored || 0),
            attackerPoints: acc.attackerPoints + (calc.attackerPointsScored || 0),
            defencePoints: acc.defencePoints + (calc.defencePointsScored || 0),
            qbPoints: acc.qbPoints + (calc.qbPointsScored || 0),
        }
    }, { totalPoints: 0, rusherPoints: 0, attackerPoints: 0, defencePoints: 0, qbPoints: 0 }) || { totalPoints: 0, rusherPoints: 0, attackerPoints: 0, defencePoints: 0, qbPoints: 0 }

    const matchesCount = playerDetail?.matchWiseDetails?.length || 0

    useEffect(() => {
        fetchPlayer()
    }, [playerId])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!playerDetail?.playerName) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-12 text-center max-w-md">
                    <User className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Player Not Found</h3>
                    <p className="text-slate-400 mb-6">The player profile you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-orange-400 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back</span>
                </button>

                {/* Player Info Card */}
                <div className="bg-slate-800/50 rounded-xl shadow-xl border border-slate-700 overflow-hidden mb-6 backdrop-blur-sm">
                    <div className="bg-gradient-to-r from-orange-600 to-pink-600 px-6 py-8">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 border-4 border-white/30 shadow-2xl">
                                <span className="text-3xl sm:text-5xl font-bold text-white tracking-widest">
                                    {getInitials(playerDetail.playerName)}
                                </span>
                            </div>

                            {/* Player Info */}
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-md">
                                    {formatName(playerDetail.playerName)}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-white/90">
                                    {playerDetail.email && (
                                        <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                            <Mail className="w-4 h-4" />
                                            <span>{playerDetail.email}</span>
                                        </div>
                                    )}
                                    {playerDetail.jerseyNumber && (
                                        <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                            <Hash className="w-4 h-4" />
                                            <span>#{playerDetail.jerseyNumber}</span>
                                        </div>
                                    )}
                                    {playerDetail.position && (
                                        <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                            <Target className="w-4 h-4" />
                                            <span>{playerDetail.position}</span>
                                        </div>
                                    )}
                                    {playerDetail.role && (
                                        <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                            <Shield className="w-4 h-4" />
                                            <span>{playerDetail.role}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-4 text-center hover:bg-slate-750 transition-colors">
                        <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-1">{totalStats.totalPoints}</div>
                        <div className="text-xs sm:text-sm text-slate-400">Total Points</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-4 text-center hover:bg-slate-750 transition-colors">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">{totalStats.rusherPoints}</div>
                        <div className="text-xs sm:text-sm text-slate-400">Rusher</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-4 text-center hover:bg-slate-750 transition-colors">
                        <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-1">{totalStats.attackerPoints}</div>
                        <div className="text-xs sm:text-sm text-slate-400">Attacker</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-4 text-center hover:bg-slate-750 transition-colors">
                        <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">{totalStats.defencePoints}</div>
                        <div className="text-xs sm:text-sm text-slate-400">Defence</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-4 text-center hover:bg-slate-750 transition-colors">
                        <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1">{totalStats.qbPoints}</div>
                        <div className="text-xs sm:text-sm text-slate-400">QB</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-4 text-center hover:bg-slate-750 transition-colors">
                        <div className="text-2xl sm:text-3xl font-bold text-slate-200 mb-1">{matchesCount}</div>
                        <div className="text-xs sm:text-sm text-slate-400">Matches</div>
                    </div>
                </div>

                {/* Player Stats Table */}
                <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                    <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-orange-500" />
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Match Statistics</h2>
                        </div>
                    </div>

                    {!playerDetail?.matchWiseDetails || playerDetail.matchWiseDetails.length === 0 ? (
                        <div className="p-12 text-center">
                            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">No match statistics available</p>
                            <p className="text-slate-500 text-sm mt-2">Player statistics will appear here once matches are played.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-900 border-slate-700 hover:bg-slate-900">
                                            <TableHead className="text-slate-400 font-semibold">Date</TableHead>
                                            <TableHead className="text-slate-400 font-semibold">League</TableHead>
                                            <TableHead className="text-slate-400 font-semibold">Location</TableHead>
                                            <TableHead className="text-slate-400 font-semibold">Match Type</TableHead>
                                            <TableHead className="text-slate-400 font-semibold text-right">Total</TableHead>
                                            <TableHead className="text-slate-400 font-semibold text-right">Rusher</TableHead>
                                            <TableHead className="text-slate-400 font-semibold text-right">Attacker</TableHead>
                                            <TableHead className="text-slate-400 font-semibold text-right">Defence</TableHead>
                                            <TableHead className="text-slate-400 font-semibold text-right">QB</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {playerDetail.matchWiseDetails.map((match, index) => {
                                            const calc = match?.calculatedValue || {}
                                            const matchData = match?.matchId || {}
                                            return (
                                                <TableRow
                                                    key={index}
                                                    className="hover:bg-slate-700/50 cursor-pointer transition-colors border-slate-700"
                                                    onClick={() => {
                                                        // Direct navigation to detailed match update/view
                                                        if (matchData?._id) {
                                                            navigate(`/dashboard/matchSummary/${matchData._id}`)
                                                        }
                                                    }}
                                                >
                                                    <TableCell className="text-slate-300">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-slate-500" />
                                                            {matchData.date ? new Date(matchData.date).toLocaleDateString() : "N/A"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-white">
                                                        {matchData?.league?.leagueName || "N/A"}
                                                    </TableCell>
                                                    <TableCell className="text-slate-300">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-slate-500" />
                                                            {matchData.location || "N/A"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs font-medium border border-slate-600">
                                                            {matchData.matchType || "N/A"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-orange-400 text-lg">
                                                        {calc.totalPointsScored ?? 0}
                                                    </TableCell>
                                                    <TableCell className="text-right text-blue-400 font-medium">
                                                        {calc.rusherPointsScored ?? 0}
                                                    </TableCell>
                                                    <TableCell className="text-right text-red-400 font-medium">
                                                        {calc.attackerPointsScored ?? 0}
                                                    </TableCell>
                                                    <TableCell className="text-right text-green-400 font-medium">
                                                        {calc.defencePointsScored ?? 0}
                                                    </TableCell>
                                                    <TableCell className="text-right text-purple-400 font-medium">
                                                        {calc.qbPointsScored ?? 0}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden divide-y divide-slate-700">
                                {playerDetail.matchWiseDetails.map((match, index) => {
                                    const calc = match?.calculatedValue || {}
                                    const matchData = match?.matchId || {}
                                    return (
                                        <div
                                            key={index}
                                            className="p-4 hover:bg-slate-700/30 transition-colors cursor-pointer"
                                            onClick={() => {
                                                if (matchData?._id) {
                                                    navigate(`/dashboard/matchSummary/${matchData._id}`)
                                                }
                                            }}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-white mb-1">{matchData?.league?.leagueName || "N/A"}</h3>
                                                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {matchData.date ? new Date(matchData.date).toLocaleDateString() : "N/A"}
                                                            </div>
                                                            {matchData.location && (
                                                                <>
                                                                    <span>•</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {matchData.location}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        {matchData.matchType && (
                                                            <span className="inline-block mt-2 px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs font-medium border border-slate-600">
                                                                {matchData.matchType}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-bold text-orange-400">{calc.totalPointsScored ?? 0}</div>
                                                        <div className="text-xs text-slate-500">Total</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-700">
                                                    <div className="text-center">
                                                        <div className="text-sm font-semibold text-blue-400">{calc.rusherPointsScored ?? 0}</div>
                                                        <div className="text-xs text-slate-500">Rusher</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-sm font-semibold text-red-400">{calc.attackerPointsScored ?? 0}</div>
                                                        <div className="text-xs text-slate-500">Attacker</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-sm font-semibold text-green-400">{calc.defencePointsScored ?? 0}</div>
                                                        <div className="text-xs text-slate-500">Defence</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-sm font-semibold text-purple-400">{calc.qbPointsScored ?? 0}</div>
                                                        <div className="text-xs text-slate-500">QB</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PlayerProfile