import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTournamentMatches } from "../../services/api";
import MatchWiseTournamentSummary from "../Tournaments-Summary/MatchWiseTournamentSummary";
import { ArrowLeft, Trophy } from "lucide-react";

const MatchSummaryPage = () => {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const [matchData, setMatchData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // We'll construct the match summary object from what we have
    // The MatchWiseTournamentSummary component will fetch player stats using the matchId

    useEffect(() => {
        // For now, we pass the matchId directly to MatchWiseTournamentSummary
        // which will fetch the player stats itself
        setIsLoading(false);
    }, [matchId]);

    return (
        <div className="min-h-screen bg-[#0f172a] py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with Back Button */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-300" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-900/20 border border-orange-900/50 rounded-lg">
                            <Trophy className="w-6 h-6 text-orange-500" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">
                            Match Summary
                        </h1>
                    </div>
                </div>

                {/* Match Summary Component */}
                <MatchWiseTournamentSummary
                    selectedMatch={matchId}
                    matchWiseSummany={matchData}
                />
            </div>
        </div>
    );
};

export default MatchSummaryPage;
