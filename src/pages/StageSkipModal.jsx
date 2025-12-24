import { useState } from 'react';
import { X, AlertTriangle, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const StageSkipModal = ({ isOpen, onClose, onSuccess, tournamentId, currentStage, standings }) => {
    const [targetStage, setTargetStage] = useState('');
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    // Define available stages to skip to
    const getAvailableStages = () => {
        const stageOrder = ['regular_rounds', 'quarter_finals', 'semi_finals', 'finals'];
        const currentIndex = stageOrder.indexOf(currentStage);

        return [
            { value: 'quarter_final', label: 'Quarter Finals', teams: 8 },
            { value: 'semi_final', label: 'Semi Finals', teams: 4 },
            { value: 'final', label: 'Finals', teams: 2 }
        ].filter((stage, index) => {
            const stageIndex = stageOrder.indexOf(stage.value.endsWith('s') ? stage.value : stage.value + 's');
            return stageIndex > currentIndex;
        });
    };

    const handleTeamToggle = (teamId) => {
        setSelectedTeams(prev => {
            if (prev.includes(teamId)) {
                return prev.filter(id => id !== teamId);
            }

            // Get max teams for selected stage
            const maxTeams = getAvailableStages().find(s => s.value === targetStage)?.teams || 0;

            if (prev.length >= maxTeams) {
                toast.warning(`You can only select ${maxTeams} teams for ${targetStage.replace('_', ' ')}`);
                return prev;
            }

            return [...prev, teamId];
        });
    };

    const handleSkip = async () => {
        if (!targetStage) {
            toast.error('Please select a target stage');
            return;
        }

        const expectedTeams = getAvailableStages().find(s => s.value === targetStage)?.teams || 0;
        if (selectedTeams.length !== expectedTeams) {
            toast.error(`Please select exactly ${expectedTeams} teams`);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE}/api/v2/tournaments/${tournamentId}/skip-stage`,
                {
                    fromStage: currentStage,
                    toStage: targetStage,
                    teamIds: selectedTeams
                },
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success(`Successfully skipped to ${targetStage.replace('_', ' ')}`);
                onSuccess(targetStage);
                onClose();
            }
        } catch (error) {
            console.error('Error skipping stage:', error);
            toast.error('Failed to skip stage');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const availableStages = getAvailableStages();
    const maxTeamsForStage = availableStages.find(s => s.value === targetStage)?.teams || 0;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            Skip Stage
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Jump directly to a later stage by selecting teams
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Warning Alert */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-yellow-300 font-medium">Warning: Skipping Stages</p>
                                <p className="text-yellow-200/80 text-sm mt-1">
                                    Skipping stages will bypass intermediate rounds. The skipped stages will be marked in the tournament history, and you'll need to manually select which teams advance.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stage Selection */}
                    <div className="mb-6">
                        <label className="block text-sm text-slate-400 mb-2">Select Target Stage</label>
                        <div className="relative">
                            <select
                                value={targetStage}
                                onChange={(e) => {
                                    setTargetStage(e.target.value);
                                    setSelectedTeams([]);
                                }}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white appearance-none focus:outline-none focus:border-orange-500"
                            >
                                <option value="">Choose a stage to skip to...</option>
                                {availableStages.map(stage => (
                                    <option key={stage.value} value={stage.value}>
                                        {stage.label} ({stage.teams} teams)
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Team Selection */}
                    {targetStage && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm text-slate-400">
                                    Select {maxTeamsForStage} Teams to Advance
                                </label>
                                <span className="text-sm font-medium text-orange-400">
                                    {selectedTeams.length} / {maxTeamsForStage} selected
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                {(() => {
                                    let teamsPool = [];
                                    if (Array.isArray(standings)) {
                                        // Flatten teams from all groups
                                        standings.forEach(group => {
                                            if (group.standings) {
                                                teamsPool.push(...group.standings);
                                            }
                                        });
                                    } else if (standings?.standings) {
                                        teamsPool = standings.standings;
                                    }

                                    return teamsPool.map((team) => {
                                        const isSelected = selectedTeams.includes(team.tournamentTeam);

                                        return (
                                            <button
                                                key={team.tournamentTeam}
                                                onClick={() => handleTeamToggle(team.tournamentTeam)}
                                                className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                    ? 'border-orange-500 bg-orange-500/10'
                                                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected
                                                        ? 'border-orange-500 bg-orange-500'
                                                        : 'border-slate-600'
                                                        }`}>
                                                        {isSelected && (
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>

                                                    {team.team?.logo && (
                                                        <img src={team.team.logo} className="w-8 h-8 rounded" alt="" />
                                                    )}

                                                    <div className="flex-1">
                                                        <h4 className="text-white font-medium">{team.team?.name}</h4>
                                                        <div className="flex gap-3 text-xs text-slate-400 mt-1">
                                                            <span>Pos: {team.position}</span>
                                                            <span>Pts: {team.points}</span>
                                                            <span>GD: {team.goalDifference}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSkip}
                        disabled={!targetStage || selectedTeams.length !== maxTeamsForStage || loading}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium"
                    >
                        {loading ? 'Skipping...' : `Skip to ${targetStage.replace('_', ' ')}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StageSkipModal;
