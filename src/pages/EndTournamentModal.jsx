import { useState, useEffect } from 'react';
import { X, Trophy, Medal, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EndTournamentModal = ({
    isOpen,
    onClose,
    onSuccess,
    tournamentId,
    matches
}) => {
    console.log("EndTournamentModal Rendered. Open:", isOpen, "Matches:", matches?.length);
    const [selectedChampion, setSelectedChampion] = useState('');
    const [finalists, setFinalists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestedWinner, setSuggestedWinner] = useState(null);

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (isOpen && matches.length > 0) {
            // Assuming the last match in the list is the Final
            const finalMatch = matches[matches.length - 1]; // Or find by stage='final' if safer

            if (finalMatch && finalMatch.homeTeam && finalMatch.awayTeam) {
                const home = finalMatch.homeTeam;
                const away = finalMatch.awayTeam;

                const teams = [
                    { id: home._id, name: home.team.teamName, logo: home.team.teamImage },
                    { id: away._id, name: away.team.teamName, logo: away.team.teamImage }
                ];
                setFinalists(teams);

                // Auto-suggest winner based on score
                if (finalMatch.status === 'completed') {
                    if (finalMatch.homeScore > finalMatch.awayScore) {
                        setSuggestedWinner(home._id);
                        setSelectedChampion(home._id);
                    } else if (finalMatch.awayScore > finalMatch.homeScore) {
                        setSuggestedWinner(away._id);
                        setSelectedChampion(away._id);
                    }
                }
            }
        }
    }, [isOpen, matches]);

    const handleConfirm = async () => {
        if (!selectedChampion) {
            toast.error('Please select the Champion');
            return;
        }

        const runnerUp = finalists.find(t => t.id !== selectedChampion)?.id;
        if (!runnerUp) {
            toast.error('Could not identify Runner-Up');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE}/api/v2/tournaments/${tournamentId}/end`,
                {
                    championId: selectedChampion,
                    runnerUpId: runnerUp
                },
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('Tournament Completed! Champion crowned! 🏆');
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            console.error('Error ending tournament:', error);
            toast.error('Failed to end tournament');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-lg w-full overflow-hidden flex flex-col shadow-2xl shadow-purple-900/20">

                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                            Crown the Champion
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Confirm the final result to end the tournament.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {suggestedWinner && (selectedChampion !== suggestedWinner) && (
                        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 flex gap-3 items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-200">
                                <strong>Manual Override:</strong> The score suggests a different winner. Confirm this is intentional.
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {finalists.map((team) => {
                            const isSelected = selectedChampion === team.id;
                            const isSuggested = suggestedWinner === team.id;

                            return (
                                <div
                                    key={team.id}
                                    onClick={() => setSelectedChampion(team.id)}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${isSelected
                                        ? 'bg-yellow-500/10 border-yellow-500'
                                        : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                                        }`}
                                >
                                    {isSuggested && !isSelected && (
                                        <div className="absolute top-2 right-2 text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                                            Winner by Score
                                        </div>
                                    )}

                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center p-1 ${isSelected ? 'bg-yellow-500' : 'bg-slate-600'}`}>
                                        {team.logo ? (
                                            <img src={team.logo} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-white">{team.name[0]}</span>
                                        )}
                                    </div>

                                    <div className="text-center">
                                        <h3 className={`font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{team.name}</h3>
                                        <div className={`text-xs mt-1 font-medium px-2 py-0.5 rounded-full inline-block ${isSelected ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400'
                                            }`}>
                                            {isSelected ? 'Champion 🥇' : 'Runner Up 🥈'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || !selectedChampion}
                        className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Finalizing...' : (
                            <>
                                <Medal className="w-4 h-4" />
                                End Tournament
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EndTournamentModal;
