import { useState, useEffect } from 'react';
import { X, Shuffle, Save, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const KnockoutGeneratorModal = ({
    isOpen,
    onClose,
    onSuccess,
    tournamentId,
    stage,
    standings,
    tournamentConfig
}) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [qualifiedTeams, setQualifiedTeams] = useState([]);

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (isOpen) {
            fetchQualifiedTeams();
        }
    }, [isOpen]);

    const fetchQualifiedTeams = async () => {
        // If standings logic is preferred for seeding, use it
        if (standings && stage === 'quarter_final') {
            let flatStandings = [];
            if (Array.isArray(standings)) {
                standings.forEach(group => {
                    if (group.standings) flatStandings.push(...group.standings);
                });
                flatStandings.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
            } else if (standings?.standings) {
                flatStandings = standings.standings;
            }

            if (flatStandings.length > 0) {
                const teamsToAdvance = 8;
                const topTeams = flatStandings.slice(0, teamsToAdvance).map(s => {
                    // Ensure we return the tournament team object which has the same structure as the backend response
                    return s.tournamentTeam && typeof s.tournamentTeam === 'object' ? s.tournamentTeam : s;
                });
                setQualifiedTeams(topTeams);
                generateInitialMatches(topTeams);
                return;
            }
        }

        // Otherwise fetch from backend based on progression flags
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/api/v2/tournaments/${tournamentId}/teams`, {
                headers: { 'api_key': 'THE123FIELD' }
            });

            if (response.data.status === 'SUCCESS') {
                console.log("Team Fetch Response:", response.data);
                let teams = [];
                // Filter based on stage
                if (stage === 'quarter_final') {
                    teams = response.data.teams.filter(t => {
                        console.log(`Team ${t.team?.teamName || t._id} progression:`, t.progression);
                        return t.progression?.inQuarterFinals;
                    });
                } else if (stage === 'semi_final') {
                    teams = response.data.teams.filter(t => t.progression?.inSemiFinals);
                } else if (stage === 'final') {
                    teams = response.data.teams.filter(t => t.progression?.inFinals);
                }

                console.log("Filtered Teams for Stage " + stage + ":", teams);

                // Fallback for simple testing if flags not set but we want to just show all
                if (teams.length === 0 && stage === 'quarter_final') {
                    console.log("Fallback: Showing all approved teams");
                    teams = response.data.teams.filter(t => t.status === 'approved');
                }

                setQualifiedTeams(teams);
                generateInitialMatches(teams);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error('Failed to load qualified teams');
        } finally {
            setLoading(false);
        }
    };

    const generateInitialMatches = (teams) => {
        const count = teams.length;
        const matchCount = count / 2;
        const newMatches = [];

        for (let i = 0; i < matchCount; i++) {
            newMatches.push({
                matchId: i + 1,
                homeTeam: teams[i]?._id || '',
                awayTeam: teams[count - 1 - i]?._id || ''
            });
        }
        setMatches(newMatches);
    };

    const handleTeamChange = (matchIndex, side, teamId) => {
        const newMatches = [...matches];
        newMatches[matchIndex][side] = teamId;
        setMatches(newMatches);
    };

    const handleGenerate = async () => {
        // Validation: Check for duplicates or empty
        const allSelected = matches.flatMap(m => [m.homeTeam, m.awayTeam]);
        if (allSelected.some(id => !id)) {
            toast.error("Please fill all team slots");
            return;
        }
        const unique = new Set(allSelected);
        if (unique.size !== allSelected.length) {
            toast.error("Duplicate teams selected! Each team can only play once.");
            return;
        }

        setLoading(true);
        try {
            const formattedMatches = matches.map(m => ({
                homeTeam: m.homeTeam,
                awayTeam: m.awayTeam
            }));

            const response = await axios.post(
                `${API_BASE}/api/v2/tournaments/${tournamentId}/generate-matches/knockout`,
                {
                    stage: stage,
                    manualMatches: formattedMatches // Send our custom list
                },
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('Fixtures generated successfully!');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error generating fixtures:', error);
            toast.error(error.response?.data?.error || 'Failed to generate');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getTeamName = (id) => {
        const tournamentTeam = qualifiedTeams.find(t => t._id === id);
        return tournamentTeam?.team?.teamName || tournamentTeam?.team?.name || 'Select Team';
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Shuffle className="w-5 h-5 text-orange-400" />
                            Generate {stage.replace('_', ' ')} Fixtures
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Review and edit matchups before generating.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-300">
                            <strong>Note:</strong> Proposed pairings are based on current standings ranking (1st vs Last).
                            You can manually adjust them below. Once saved, these matches will be final.
                        </div>
                    </div>

                    <div className="space-y-4">
                        {matches.map((match, idx) => (
                            <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex items-center justify-between gap-4">
                                <span className="text-slate-500 font-bold w-6">#{idx + 1}</span>

                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 mb-1 block uppercase font-bold">Home</label>
                                    <select
                                        value={match.homeTeam}
                                        onChange={(e) => handleTeamChange(idx, 'homeTeam', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none"
                                    >
                                        <option value="" className="bg-slate-800 text-white">Select Team</option>
                                        {qualifiedTeams.map(t => (
                                            <option key={t._id} value={t._id} className="bg-slate-800 text-white">{t.team?.teamName || t.team?.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="font-bold text-slate-600">VS</div>

                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 mb-1 block uppercase font-bold">Away</label>
                                    <select
                                        value={match.awayTeam}
                                        onChange={(e) => handleTeamChange(idx, 'awayTeam', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none"
                                    >
                                        <option value="" className="bg-slate-800 text-white">Select Team</option>
                                        {qualifiedTeams.map(t => (
                                            <option key={t._id} value={t._id} className="bg-slate-800 text-white">{t.team?.teamName || t.team?.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                        {loading ? 'Generating...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Confirm & Generate Matches
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KnockoutGeneratorModal;
