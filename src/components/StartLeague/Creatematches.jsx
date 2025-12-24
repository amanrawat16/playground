import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Save, Shuffle, Trash2, Flag } from "lucide-react";
import { startQuaterFinals, saveRegularRoundMatches } from "../../services/api";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-dark.css";

// Helper to generate Round Robin schedule
const generateRoundRobin = (groups, rounds = 1) => {
    let matches = [];

    // Ensure rounds is at least 1
    const totalRounds = Math.max(1, parseInt(rounds) || 1);

    groups.forEach(group => {
        const teams = group.teams.map(t => t.team); // Extract team objects
        if (teams.length < 2) return;

        // Round Robin Logic
        for (let r = 0; r < totalRounds; r++) {
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    // For even rounds (0, 2, ...), Team A vs Team B
                    // For odd rounds (1, 3, ...), Team B vs Team A (Home/Away swap)
                    const isEvenRound = r % 2 === 0;

                    matches.push({
                        team1: isEvenRound ? teams[i]._id : teams[j]._id,
                        team2: isEvenRound ? teams[j]._id : teams[i]._id,
                        team1Name: isEvenRound ? teams[i].teamName : teams[j].teamName,
                        team2Name: isEvenRound ? teams[j].teamName : teams[i].teamName,
                        date: '',
                        time: '',
                        location: '',
                        groupName: `${group.groupName} - Round ${r + 1}`
                    });
                }
            }
        }
    });

    return matches;
};

const Creatematches = ({
    handleNextComponent,
    fixtureGroups,
    approvedTeams,
    leagueName,
    fixtureId,
    leagueId,
    quaterFinalsStarted,
    setIsQuaterFinalStarted,
    fetchLeagueFixture,
    existingMatches,
    matchesInRegularRound
}) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);

    // Extract all teams from fixture groups
    const allTeams = fixtureGroups?.flatMap(group =>
        group.teams?.map(t => t.team) || []
    ) || [];

    useEffect(() => {
        if (existingMatches && existingMatches.length > 0) {
            const loaded = existingMatches.map(m => ({
                ...m,
                date: m.date ? new Date(m.date).toISOString().split('T')[0] : '',
                time: m.time && m.time[0] ? m.time[0].startTime : '',
            }));
            setMatches(loaded);
        }
    }, [existingMatches]);

    const handleGenerateSchedule = () => {
        if (!fixtureGroups || fixtureGroups.length === 0) {
            toast.error("No groups found to generate matches from.");
            return;
        }

        const generated = generateRoundRobin(fixtureGroups, matchesInRegularRound);
        setMatches(generated);
        toast.info(`Generated ${generated.length} matches (${matchesInRegularRound} rounds). Please set dates and locations.`);
    };

    const handleMatchChange = (index, field, value) => {
        const newMatches = [...matches];
        newMatches[index][field] = value;
        setMatches(newMatches);
    };

    const handleDeleteMatch = (index) => {
        const newMatches = [...matches];
        newMatches.splice(index, 1);
        setMatches(newMatches);
    };

    const handleSaveSchedule = async () => {
        const invalid = matches.find(m => !m.date || !m.time || !m.location);
        if (invalid) {
            toast.warn("Please fill in Date, Time, and Location for all matches before saving.");
            return;
        }

        setLoading(true);
        try {
            // Transform matches to match backend schema (time as array with startTime/endTime)
            const transformedMatches = matches.map(match => ({
                ...match,
                time: [{
                    startTime: match.time,
                    endTime: match.time // Using same time for now, can be different if needed
                }]
            }));

            const response = await saveRegularRoundMatches(leagueId, fixtureId, transformedMatches);

            if (response.status === "SUCCESS") {
                toast.success("Schedule saved successfully!");
                handleNextComponent(); // Move to Quarter Finals view or just Refresh
                fetchLeagueFixture(leagueId);
            } else {
                toast.error(response.error || "Failed to save schedule");
            }

        } catch (error) {
            console.error(error);
            toast.error("Error saving schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuarterFinals = () => {
        Swal.fire({
            title: "Start Quarter Finals?",
            text: "This will conclude Regular Rounds.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Start!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await startQuaterFinals(leagueId);
                    if (response.status === "SUCCESS") {
                        toast.success("Quarter Finals Started");
                        setIsQuaterFinalStarted(true);
                        fetchLeagueFixture(leagueId);
                        handleNextComponent();
                    }
                } catch (error) {
                    toast.error("Error starting Quarter Finals");
                }
            }
        });
    };

    return (
        <div className="w-full max-w-6xl mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Regular Round Matches</h2>
                    <p className="text-sm text-slate-400">Rounds: {matchesInRegularRound}</p>
                </div>

                <div className="space-x-4">
                    {/* Only show Generate Schedule if no matches exist and quarter finals not started */}
                    {matches.length === 0 && !quaterFinalsStarted && (
                        <Button onClick={handleGenerateSchedule} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Shuffle className="w-4 h-4 mr-2" />
                            Generate Schedule
                        </Button>
                    )}

                    {/* Only show Save button if matches exist and quarter finals not started */}
                    {matches.length > 0 && !quaterFinalsStarted && (
                        <Button onClick={handleSaveSchedule} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? "Saving..." : "Approve & Save Schedule"}
                        </Button>
                    )}

                    {/* Only show Start Quarter Finals if matches are saved (existingMatches) and not yet started */}
                    {existingMatches && existingMatches.length > 0 && !quaterFinalsStarted && (
                        <Button onClick={handleStartQuarterFinals} variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400 bg-transparent">
                            Start Quarter Finals
                        </Button>
                    )}

                    {/* Show status badge if quarter finals started */}
                    {quaterFinalsStarted && (
                        <div className="flex items-center gap-2">
                            <span className="text-orange-500 font-bold bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/20">
                                Quarter Finals Started
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {matches.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {matches.map((match, index) => (
                        <div key={index} className="bg-[#1e293b] p-4 rounded-lg border border-slate-700 shadow-sm flex flex-col gap-3">
                            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                <span className="font-semibold text-slate-300">{match.groupName || 'Match'}</span>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteMatch(index)} className="text-red-400 hover:text-red-600 hover:bg-red-400/10 h-6 w-6 p-0">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {/* Team Selection */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs text-slate-400 mb-1 block">Team 1</Label>
                                        <select
                                            value={match.team1}
                                            onChange={(e) => {
                                                const selectedTeam = allTeams.find(t => t._id === e.target.value);
                                                handleMatchChange(index, 'team1', e.target.value);
                                                handleMatchChange(index, 'team1Name', selectedTeam?.teamName || '');
                                            }}
                                            className="w-full h-9 px-2 text-sm border border-slate-700 rounded bg-[#0f172a] text-slate-200 focus:border-orange-500 focus:outline-none"
                                        >
                                            {allTeams?.map((team) => (
                                                <option key={team._id} value={team._id} className="bg-[#1e293b] text-white">
                                                    {team.teamName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-400 mb-1 block">Team 2</Label>
                                        <select
                                            value={match.team2}
                                            onChange={(e) => {
                                                const selectedTeam = allTeams.find(t => t._id === e.target.value);
                                                handleMatchChange(index, 'team2', e.target.value);
                                                handleMatchChange(index, 'team2Name', selectedTeam?.teamName || '');
                                            }}
                                            className="w-full h-9 px-2 text-sm border border-slate-700 rounded bg-[#0f172a] text-slate-200 focus:border-orange-500 focus:outline-none"
                                        >
                                            {allTeams?.map((team) => (
                                                <option key={team._id} value={team._id} className="bg-[#1e293b] text-white">
                                                    {team.teamName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Date, Time, Location */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label className="text-xs text-slate-400 mb-1 block">Date</Label>
                                        <DatePicker
                                            selected={match.date ? new Date(match.date) : null}
                                            onChange={(date) => {
                                                const dateStr = date ? date.toISOString().split('T')[0] : '';
                                                handleMatchChange(index, 'date', dateStr);
                                            }}
                                            dateFormat="yyyy-MM-dd"
                                            placeholderText="Select date"
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-400 mb-1 block">Time</Label>
                                        <DatePicker
                                            selected={match.time ? new Date(`2000-01-01T${match.time}`) : null}
                                            onChange={(time) => {
                                                if (time) {
                                                    const hours = time.getHours().toString().padStart(2, '0');
                                                    const minutes = time.getMinutes().toString().padStart(2, '0');
                                                    handleMatchChange(index, 'time', `${hours}:${minutes}`);
                                                }
                                            }}
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="HH:mm"
                                            timeFormat="HH:mm"
                                            placeholderText="Select time"
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-400 mb-1 block">Location</Label>
                                        <Input
                                            placeholder="Stadium/Venue"
                                            value={match.location}
                                            onChange={(e) => handleMatchChange(index, 'location', e.target.value)}
                                            className="h-9 text-sm bg-[#0f172a] border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#1e293b] rounded-lg border border-dashed border-slate-700">
                    <p className="text-slate-400 mb-4">No matches scheduled yet.</p>
                    <p className="text-sm text-slate-500">Click "Generate Schedule" to create a Round Robin fixture from your groups.</p>
                </div>
            )}
        </div>
    );
};

export default Creatematches;