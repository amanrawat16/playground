import React, { useState, useEffect } from "react";
import { getAllLeagues, getTournamentsByLeague, getTournamentMatches } from "../../../services/api";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import {
    Calendar, MapPin, Search, Filter, Trophy, ArrowRight,
    Edit, AlertCircle, Users, CheckCircle, Clock
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const baseURL = import.meta.env.VITE_BASE_URL;

const ViewMatchesV2 = () => {
    const navigate = useNavigate();
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loadingLeagues, setLoadingLeagues] = useState(true);
    const [loadingTournaments, setLoadingTournaments] = useState(false);
    const [loadingMatches, setLoadingMatches] = useState(false);

    // Initial Load: Get Leagues
    useEffect(() => {
        const fetchLeagues = async () => {
            try {
                const response = await getAllLeagues();
                if (response.status === "SUCCESS") {
                    setLeagues(response.leagues);
                }
            } catch (error) {
                console.error("Error fetching leagues:", error);
            } finally {
                setLoadingLeagues(false);
            }
        };
        fetchLeagues();
    }, []);

    // League Selected: Get Tournaments
    useEffect(() => {
        if (!selectedLeague) {
            setTournaments([]);
            setSelectedTournament(null);
            setMatches([]);
            return;
        }

        const fetchTournaments = async () => {
            setLoadingTournaments(true);
            try {
                const response = await getTournamentsByLeague(selectedLeague);
                if (response.status === "SUCCESS") {
                    setTournaments(response.tournaments);
                }
            } catch (error) {
                console.error("Error fetching tournaments:", error);
            } finally {
                setLoadingTournaments(false);
            }
        };
        fetchTournaments();
    }, [selectedLeague]);

    // Tournament Selected: Get Matches
    useEffect(() => {
        if (!selectedTournament) {
            setMatches([]);
            return;
        }

        const fetchMatches = async () => {
            setLoadingMatches(true);
            try {
                const response = await getTournamentMatches(selectedTournament);
                // V2 matches are usually under 'matches' key
                if (response?.matches) {
                    setMatches(response.matches);
                }
            } catch (error) {
                console.error("Error loading matches:", error);
            } finally {
                setLoadingMatches(false);
            }
        };
        fetchMatches();
    }, [selectedTournament]);

    // Helper: Get Team Image
    const getTeamImageUrl = (teamImage) => {
        if (!teamImage) return 'https://placehold.co/100x100?text=Logo'; // Fallback
        if (teamImage.startsWith('http')) return teamImage;

        // Handle path issues
        const filename = teamImage.split(/[/\\]/).pop();
        return `${baseURL}/uploads/${filename}`;
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                            Matches Hub
                        </h1>
                        <p className="text-slate-400 mt-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Manage and view detailed match schedules
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        {/* League Selector */}
                        <Select onValueChange={setSelectedLeague} disabled={loadingLeagues}>
                            <SelectTrigger className="w-full sm:w-[200px] bg-slate-900 border-slate-700 text-white">
                                <SelectValue placeholder={loadingLeagues ? "Loading..." : "Select League"} />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                {leagues?.map(l => (
                                    <SelectItem key={l._id} value={l._id}>{l.leagueName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Tournament Selector */}
                        <Select
                            onValueChange={setSelectedTournament}
                            disabled={!selectedLeague || loadingTournaments}
                            value={selectedTournament || ''}
                        >
                            <SelectTrigger className="w-full sm:w-[240px] bg-slate-900 border-slate-700 text-white">
                                <SelectValue placeholder={loadingTournaments ? "Loading..." : (tournaments?.length === 0 ? "No Tournaments" : "Select Tournament")} />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                {tournaments?.map(t => (
                                    <SelectItem key={t._id} value={t._id}>
                                        {t.name || `Tournament ${moment(t.startDate).format('MMM YYYY')}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Content Area */}
                {loadingMatches ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Loading matches...</p>
                    </div>
                ) : !selectedTournament ? (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 border-dashed p-12 text-center text-slate-500">
                        <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-slate-300">Select a Tournament</h3>
                        <p>Please select a league and tournament to view the match schedule.</p>
                    </div>
                ) : matches?.length === 0 ? (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center text-slate-500">
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-slate-300">No Matches Found</h3>
                        <p>There are no matches scheduled for this tournament yet.</p>
                    </div>
                ) : (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                        <Table>
                            <TableHeader className="bg-slate-900/50">
                                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                                    <TableHead className="text-slate-400">Date & Time</TableHead>
                                    <TableHead className="text-slate-400 w-[40%]">Matchup</TableHead>
                                    <TableHead className="text-slate-400 text-center">Score</TableHead>
                                    <TableHead className="text-slate-400">Location</TableHead>
                                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {matches?.map((match) => {
                                    const isCompleted = match.status === 'completed';
                                    const isLive = match.status === 'live';

                                    return (
                                        <TableRow key={match._id} className="border-slate-700 hover:bg-slate-700/30 transition-colors">
                                            {/* Date */}
                                            <TableCell className="font-medium text-slate-300">
                                                <div className="flex flex-col">
                                                    <span className="text-white">{moment(match.scheduledAt || match.date).format("MMM DD, YYYY")}</span>
                                                    <span className="text-xs text-slate-500">{match.scheduledTime || moment(match.scheduledAt || match.date).format("h:mm A")}</span>
                                                </div>
                                            </TableCell>

                                            {/* Matchup */}
                                            <TableCell>
                                                <div className="flex items-center justify-between gap-4 max-w-md">
                                                    {/* Home Team */}
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="flex-shrink-0 relative">
                                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-600 bg-slate-800">
                                                                <img src={getTeamImageUrl(match.homeTeam?.team?.teamImage)} alt="Home" className="w-full h-full object-cover" />
                                                            </div>
                                                        </div>
                                                        <span className="font-semibold text-white truncate" title={match.homeTeam?.team?.teamName}>
                                                            {match.homeTeam?.team?.teamName || "TBD"}
                                                        </span>
                                                    </div>

                                                    <span className="text-slate-600 font-bold text-xs uppercase px-2">VS</span>

                                                    {/* Away Team */}
                                                    <div className="flex items-center gap-3 flex-1 flex-row-reverse text-right">
                                                        <div className="flex-shrink-0 relative">
                                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-600 bg-slate-800">
                                                                <img src={getTeamImageUrl(match.awayTeam?.team?.teamImage)} alt="Away" className="w-full h-full object-cover" />
                                                            </div>
                                                        </div>
                                                        <span className="font-semibold text-white truncate" title={match.awayTeam?.team?.teamName}>
                                                            {match.awayTeam?.team?.teamName || "TBD"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Score */}
                                            <TableCell className="text-center">
                                                {isCompleted || isLive ? (
                                                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-slate-900 border border-slate-700 font-mono font-bold text-lg text-white gap-2">
                                                        <span className={match.homeScore > match.awayScore ? "text-orange-400" : ""}>{match.homeScore}</span>
                                                        <span className="text-slate-600">:</span>
                                                        <span className={match.awayScore > match.homeScore ? "text-blue-400" : ""}>{match.awayScore}</span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-500">
                                                        Upcoming
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Location */}
                                            <TableCell className="text-slate-400">
                                                <div className="flex items-center gap-2 max-w-[150px] truncate" title={match.location}>
                                                    <MapPin className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                                    <span className="truncate">{match.location || "Location TBD"}</span>
                                                </div>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="bg-slate-700/50 hover:bg-orange-600 hover:text-white text-slate-300 transition-colors"
                                                        onClick={() => navigate(`/dashboard/match/${match._id}/updateMatchSummary`, { state: { ...match, v2: true } })}
                                                    >
                                                        <Edit className="w-4 h-4 mr-1" /> Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="bg-slate-700/50 hover:bg-blue-600 hover:text-white text-slate-300 transition-colors"
                                                        onClick={() => navigate(`/dashboard/playerSummary`, { state: match })}
                                                    >
                                                        <Users className="w-4 h-4 mr-1" /> Stats
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewMatchesV2;
