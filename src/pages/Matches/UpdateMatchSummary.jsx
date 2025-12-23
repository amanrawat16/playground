import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { updateMatch, updateMatchV2, getTournamentTeams } from "../../services/api";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft, Trophy, Users, Target, Loader2, Calendar, MapPin, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import moment from "moment";

const baseURL = import.meta.env.VITE_BASE_URL;

// Helper function to safely get team image URL
const getTeamImageUrl = (teamImage) => {
  if (!teamImage) {
    return 'https://placehold.co/100x100?text=Logo';
  }
  if (teamImage.startsWith('http')) return teamImage;
  const filename = teamImage.split(/[/\\]/).pop();
  return `${baseURL}/uploads/${filename}`;
};

const UpdateMatchSummary = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tournamentTeams, setTournamentTeams] = useState([]);
  const [replacementTeams, setReplacementTeams] = useState({ home: '', away: '' });

  useEffect(() => {
    // Determine tournament ID from state
    const tournamentId = state?.tournament?._id || state?.tournament;
    if (tournamentId && (!!state?.homeTeam || !!state?.v2)) {
      getTournamentTeams(tournamentId)
        .then(res => {
          if (res.status === 'SUCCESS') setTournamentTeams(res.teams);
        })
        .catch(err => console.error("Error fetching tournament teams:", err));
    }
  }, [state]);

  // Redirect if no state data
  useEffect(() => {
    if (!state) {
      toast.error("No match data found. Redirecting...");
      navigate("/dashboard/matches/viewMatches");
    }
  }, [state, navigate]);

  // Determine if V1 or V2
  const isV2 = !!state?.homeTeam || !!state?.v2;

  // Extract Teams
  const team1 = isV2 ? (state?.homeTeam?.team || state?.homeTeam) : state?.team1;
  const team2 = isV2 ? (state?.awayTeam?.team || state?.awayTeam) : state?.team2;

  // Extract initial values
  const initialTeam1Score = isV2 ? (state?.homeScore || 0) : (state?.team1stPoints?.score || 0);
  const initialTeam2Score = isV2 ? (state?.awayScore || 0) : (state?.team2ndPoints?.score || 0);

  // Metadata (V2 Only mostly, but handling gracefully)
  const initialDate = state?.scheduledAt || state?.date ? moment(state.scheduledAt || state.date).format("YYYY-MM-DD") : "";
  const initialTime = state?.scheduledTime ? state.scheduledTime : (state?.scheduledAt ? moment(state.scheduledAt).format("HH:mm") : "");
  const initialLocation = state?.location || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      team1stScore: initialTeam1Score,
      team2ndScore: initialTeam2Score,
      matchDate: initialDate,
      matchTime: initialTime,
      matchLocation: initialLocation
    },
  });

  const handleUpdate = async (data) => {
    setIsSubmitting(true);
    try {
      const matchId = state?._id;
      if (!matchId) {
        toast.error("Match ID not found");
        return;
      }

      const team1Score = Number(data.team1stScore);
      const team2Score = Number(data.team2ndScore);

      let response;

      if (isV2) {
        // V2 Update
        const payload = {
          homeScore: team1Score,
          awayScore: team2Score,
          status: "completed",
          scheduledAt: data.matchDate ? new Date(`${data.matchDate}T${data.matchTime || "00:00"}`) : undefined,
          scheduledTime: data.matchTime,
          location: data.matchLocation,
          ...(replacementTeams.home && { homeTeam: replacementTeams.home }),
          ...(replacementTeams.away && { awayTeam: replacementTeams.away })
        };
        response = await updateMatchV2(matchId, payload);
      } else {
        // Legacy V1 Logic
        const reqPayload = {
          team1: team1?._id,
          team2: team2?._id,
          winningTeam: { winningTeamId: "", winningTeamName: "", winningTeamScore: "" },
          losingTeam: { losingTeamId: "", losingTeamName: "", losingTeamScore: "" },
          isMatchDraw: false,
          team1stPoints: { teamId: "", teamName: "", points: null, score: team1Score },
          team2ndPoints: { teamId: "", teamName: "", points: null, score: team2Score }
        };

        if (team1Score > team2Score) {
          reqPayload.winningTeam = { winningTeamId: team1._id, winningTeamName: team1.teamName, winningTeamScore: team1Score };
          reqPayload.losingTeam = { losingTeamId: team2._id, losingTeamName: team2.teamName, losingTeamScore: team2Score };
          reqPayload.team1stPoints = { ...reqPayload.team1stPoints, teamId: team1._id, teamName: team1.teamName, points: 3 };
          reqPayload.team2ndPoints = { ...reqPayload.team2ndPoints, teamId: team2._id, teamName: team2.teamName, points: 0 };
        } else if (team2Score > team1Score) {
          reqPayload.winningTeam = { winningTeamId: team2._id, winningTeamName: team2.teamName, winningTeamScore: team2Score };
          reqPayload.losingTeam = { losingTeamId: team1._id, losingTeamName: team1.teamName, losingTeamScore: team1Score };
          reqPayload.team1stPoints = { ...reqPayload.team1stPoints, teamId: team1._id, teamName: team1.teamName, points: 0 };
          reqPayload.team2ndPoints = { ...reqPayload.team2ndPoints, teamId: team2._id, teamName: team2.teamName, points: 3 };
        } else {
          reqPayload.isMatchDraw = true;
          reqPayload.winningTeam = { winningTeamId: "Tie", winningTeamName: "Tie", winningTeamScore: "Tie" };
          reqPayload.losingTeam = { losingTeamId: "Tie", losingTeamName: "Tie", losingTeamScore: "Tie" };
          reqPayload.team1stPoints = { ...reqPayload.team1stPoints, teamId: team1._id, teamName: team1.teamName, points: 1 };
          reqPayload.team2ndPoints = { ...reqPayload.team2ndPoints, teamId: team2._id, teamName: team2.teamName, points: 1 };
        }

        response = await updateMatch(matchId, {
          ...reqPayload,
          winningTeamName: reqPayload.winningTeam.winningTeamName,
          losingTeamName: reqPayload.losingTeam.losingTeamName,
        });
      }

      if (response?.status === "SUCCESS") {
        toast.success("Match updated successfully!");
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error(response?.message || "Failed to update match");
      }
    } catch (error) {
      console.error("Error updating match:", error);
      toast.error(error?.response?.data?.error || "Error updating match. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!state) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-6 sm:py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <ToastContainer position="top-center" theme="dark" autoClose={3000} />

        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <div className="bg-slate-800/50 rounded-2xl shadow-xl border border-slate-700 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-900/40 rounded-lg border border-orange-500/30">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Update Match Result</h1>
                <p className="text-sm text-slate-400 mt-1">Enter final scores and details to complete the match</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 sm:p-8">
          <form onSubmit={handleSubmit(handleUpdate)} className="space-y-8">

            {/* Team Replacement UI (Only if V2 and not completed) */}
            {isV2 && state?.status !== 'completed' && (
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 mb-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-4 h-4 text-orange-400" />
                      <Label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Replace Home Team</Label>
                    </div>
                    <select
                      value={replacementTeams.home}
                      onChange={(e) => setReplacementTeams({ ...replacementTeams, home: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">Keep Original ({team1?.teamName || "Home"})</option>
                      {tournamentTeams.map(t => (
                        <option key={t._id} value={t._id}>{t.team.teamName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-4 h-4 text-blue-400" />
                      <Label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Replace Away Team</Label>
                    </div>
                    <select
                      value={replacementTeams.away}
                      onChange={(e) => setReplacementTeams({ ...replacementTeams, away: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Keep Original ({team2?.teamName || "Away"})</option>
                      {tournamentTeams.map(t => (
                        <option key={t._id} value={t._id}>{t.team.teamName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Teams Visual */}
            <div className="relative mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team 1 */}
                <div className="flex flex-col items-center p-6 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-orange-500/50 transition-colors">
                  <div className="w-24 h-24 mb-4 rounded-full p-1 bg-slate-800 border-2 border-slate-600 shadow-lg">
                    <img
                      src={getTeamImageUrl(team1?.teamImage)}
                      alt={team1?.teamName || 'Team 1'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 text-center truncate w-full" title={team1?.teamName}>
                    {team1?.teamName || 'Team 1'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="uppercase text-xs font-bold tracking-wider text-orange-500">Home Team</span>
                  </div>
                </div>

                {/* Team 2 */}
                <div className="flex flex-col items-center p-6 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors">
                  <div className="w-24 h-24 mb-4 rounded-full p-1 bg-slate-800 border-2 border-slate-600 shadow-lg">
                    <img
                      src={getTeamImageUrl(team2?.teamImage)}
                      alt={team2?.teamName || 'Team 2'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 text-center truncate w-full" title={team2?.teamName}>
                    {team2?.teamName || 'Team 2'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="uppercase text-xs font-bold tracking-wider text-blue-500">Away Team</span>
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="bg-slate-900 text-orange-500 border-2 border-slate-700 rounded-full w-12 h-12 flex items-center justify-center font-black shadow-xl z-10">
                  VS
                </div>
              </div>
            </div>

            {/* Score Inputs */}
            <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Score Calculation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="team1stScore" className="text-base font-semibold text-slate-300">
                    {team1?.teamName || 'Home'} Score
                  </Label>
                  <Input
                    id="team1stScore"
                    type="number"
                    placeholder="0"
                    min={0}
                    {...register("team1stScore", { required: "Home score is required", min: 0 })}
                    className="bg-slate-900 border-slate-700 text-center text-3xl font-bold h-20 text-orange-400 focus:border-orange-500 focus:ring-orange-500/20"
                  />
                  {errors.team1stScore && <span className="text-red-500 text-sm">{errors.team1stScore.message}</span>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="team2ndScore" className="text-base font-semibold text-slate-300">
                    {team2?.teamName || 'Away'} Score
                  </Label>
                  <Input
                    id="team2ndScore"
                    type="number"
                    placeholder="0"
                    min={0}
                    {...register("team2ndScore", { required: "Away score is required", min: 0 })}
                    className="bg-slate-900 border-slate-700 text-center text-3xl font-bold h-20 text-blue-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  {errors.team2ndScore && <span className="text-red-500 text-sm">{errors.team2ndScore.message}</span>}
                </div>
              </div>
            </div>

            {/* Metadata Inputs */}
            {isV2 && (
              <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Match Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" /> Date
                    </Label>
                    <Input
                      type="date"
                      {...register("matchDate")}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" /> Time
                    </Label>
                    <Input
                      type="time"
                      {...register("matchTime")}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" /> Location
                    </Label>
                    <Input
                      type="text"
                      placeholder="Stadium / Venue"
                      {...register("matchLocation")}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-700">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-14 px-8 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-900/20 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Updating Match...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-3" />
                    Complete Match
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateMatchSummary;
