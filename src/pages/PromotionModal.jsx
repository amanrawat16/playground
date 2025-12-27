import { useState, useEffect } from 'react';
import { X, Trophy, CheckCircle2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PromotionModal = ({
    isOpen,
    onClose,
    onSuccess,
    tournamentId,
    standings,
    nextStage
}) => {
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    // Determine teams to advance based on stage
    const teamsToAdvance =
        nextStage === 'quarter_final' ? 8 :
            nextStage === 'semi_final' ? 4 :
                nextStage === 'final' ? 2 : 8;

    useEffect(() => {
        if (isOpen && standings) {
            let flatStandings = [];
            if (Array.isArray(standings)) {
                // Flatten teams from all groups
                standings.forEach(group => {
                    if (group.standings) {
                        flatStandings.push(...group.standings);
                    }
                });
                // Sort by points/GD if needed, but for now just flatten
                flatStandings.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
            } else if (standings?.standings) {
                flatStandings = standings.standings;
            }

            // Pre-select top N teams
            const topTeams = flatStandings.slice(0, teamsToAdvance).map(s => {
                return typeof s.tournamentTeam === 'object' ? s.tournamentTeam._id : s.tournamentTeam;
            });
            setSelectedTeams(topTeams);
        }
    }, [isOpen, standings, teamsToAdvance]);

    const handleToggleTeam = (teamId) => {
        setSelectedTeams(prev => {
            if (prev.includes(teamId)) {
                return prev.filter(id => id !== teamId);
            } else {
                return [...prev, teamId];
            }
        });
    };

    const handlePromote = async () => {
        if (selectedTeams.length === 0) {
            toast.error('Please select at least one team');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE}/api/v2/tournaments/${tournamentId}/promote-teams`,
                {
                    targetStage: nextStage,
                    teamIds: selectedTeams
                },
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success(`Teams promoted to ${nextStage.replace('_', ' ')} successfully!`);
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            console.error('Error promoting teams:', error);
            toast.error('Failed to promote teams');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-orange-400" />
                            Select Teams for {nextStage.replace('_', ' ')}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Choose the {teamsToAdvance} teams that will advance to the next round.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-300">
                            <strong>Note:</strong> We've pre-selected the top {teamsToAdvance} teams based on the standings.
                            You can maximize or minimize this list manually if needed (e.g., in case of disqualifications).
                        </div>
                    </div>

                    <div className="space-y-2">
                        {(() => {
                            let flatStandings = [];
                            if (Array.isArray(standings)) {
                                standings.forEach(group => {
                                    if (group.standings) flatStandings.push(...group.standings);
                                });
                                flatStandings.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
                            } else if (standings?.standings) {
                                flatStandings = standings.standings;
                            }

                            return flatStandings.map((standing) => {
                                const teamId = typeof standing.tournamentTeam === 'object' ? standing.tournamentTeam._id : standing.tournamentTeam;
                                const isSelected = selectedTeams.includes(teamId);
                                return (
                                    <div
                                        key={teamId}
                                        onClick={() => handleToggleTeam(teamId)}
                                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isSelected
                                            ? 'bg-orange-600/10 border-orange-500/50'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'
                                                }`}>
                                                {standing.position}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {standing.team?.logo ? (
                                                    <img src={standing.team.logo} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-slate-700 rounded-full" />
                                                )}
                                                <div>
                                                    <h3 className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                        {standing.team?.name || standing.team?.teamName}
                                                    </h3>
                                                    <div className="text-xs text-slate-500">
                                                        Played: {standing.played} • Pts: {standing.points}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected
                                            ? 'bg-orange-500 border-orange-500'
                                            : 'border-slate-600'
                                            }`}>
                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
                    <div className="mr-auto flex items-center text-sm text-slate-400">
                        Selected: <span className="font-bold text-white ml-2">{selectedTeams.length}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePromote}
                        disabled={selectedTeams.length === 0 || loading}
                        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Promoting...' : `Promote ${selectedTeams.length} Teams`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;
