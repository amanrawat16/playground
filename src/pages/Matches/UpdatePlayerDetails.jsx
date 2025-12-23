import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { updatePlayerDetails, savePlayerPerformanceV2, getMatchPerformancesV2 } from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft, User, Shield, Zap, Target, Loader2, CheckCircle, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UpdatePlayerDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { playerId, matchId } = useParams(); // Should be getting these from URL for better deep linking, but state is primary

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // V2 Detection
  const isV2 = state?.isV2 || !!state?.v2TeamId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      pointsSacks: 0,
      pointsSafety: 0,
      pointsfirstDown: 0,
      interception: 0,
      assist: 0,
      extraPoint1: 0,
      extraPoint2: 0,
      returnVal: 0,
      pickSix: 0,
      touchdown: 0,
    }
  });

  // Fetch existing stats if V2
  useEffect(() => {
    const fetchV2Stats = async () => {
      if (isV2 && state?.matchId && state?.player?._id) {
        setIsLoading(true);
        try {
          // Fetch all performances for the match
          const response = await getMatchPerformancesV2(state.matchId);
          if (response?.performances) {
            const playerStats = response.performances.find(p => p.player?._id === state.player._id || p.player === state.player._id);
            if (playerStats && playerStats.stats) {
              setValue("pointsSacks", playerStats.stats.sacks || 0);
              setValue("pointsSafety", playerStats.stats.safeties || 0);
              setValue("pointsfirstDown", playerStats.stats.firstDowns || 0);
              setValue("interception", playerStats.stats.interceptions || 0);
              setValue("assist", playerStats.stats.assists || 0);
              setValue("extraPoint1", playerStats.stats.extraPoints1 || 0);
              setValue("extraPoint2", playerStats.stats.extraPoints2 || 0);
              setValue("returnVal", playerStats.stats.returns || 0);
              setValue("pickSix", playerStats.stats.pickSixes || 0);
              setValue("touchdown", playerStats.stats.touchdowns || 0);
            }
          }
        } catch (error) {
          console.error("Error fetching player stats:", error);
          toast.error("Failed to load existing stats");
        } finally {
          setIsLoading(false);
        }
      } else if (!isV2 && state?.matchWiseDetails) {
        // V1 Pre-fill logic (legacy)
        const details = state?.matchWiseDetails?.find((e) => e.matchId === state.matchId);
        if (details) {
          setValue("pointsSacks", details.pointsSacks || 0);
          setValue("pointsSafety", details.pointsSafety || 0);
          setValue("pointsfirstDown", details.pointsfirstDown || 0);
          setValue("interception", details.interception || 0);
          setValue("assist", details.assist || 0);
          setValue("extraPoint1", details.extraPoint1 || 0);
          setValue("extraPoint2", details.extraPoint2 || 0);
          setValue("returnVal", details.returnVal || 0);
          setValue("pickSix", details.pickSix || 0);
          setValue("touchdown", details.touchdown || 0);
        }
      }
    };

    fetchV2Stats();
  }, [isV2, state, setValue]);


  const handleUpdate = async (data) => {
    setIsSubmitting(true);
    try {
      if (isV2) {
        // V2 Update
        const payload = {
          playerId: state?.player?._id,
          teamId: state?.v2TeamId,
          stats: {
            sacks: Number(data.pointsSacks),
            safeties: Number(data.pointsSafety),
            firstDowns: Number(data.pointsfirstDown),
            interceptions: Number(data.interception),
            assists: Number(data.assist),
            extraPoints1: Number(data.extraPoint1),
            extraPoints2: Number(data.extraPoint2),
            returns: Number(data.returnVal),
            pickSixes: Number(data.pickSix),
            touchdowns: Number(data.touchdown)
          }
        };
        const response = await savePlayerPerformanceV2(state.matchId, payload);
        if (response.status === "SUCCESS") {
          toast.success("V2 Player stats saved!");
          setTimeout(() => navigate(-1), 1500);
        }
      } else {
        // V1 Update (Legacy)
        const pId = state?.playerId || state?.player?._id;
        const mId = state?.matchId;
        const lId = state?.leagueId;
        const response = await updatePlayerDetails(pId, mId, { ...data, matchId: mId, leagueId: lId });
        if (response.status === 'SUCCESS') {
          toast.success("Player details updated successfully!");
          setTimeout(() => navigate(-1), 1500);
        }
      }
    } catch (error) {
      console.error("Error updating details:", error);
      toast.error(error?.response?.data?.error || "Failed to update details");
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
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold border-4 border-slate-800 shadow-xl">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{state?.player?.playerName || "Player Name"}</h1>
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                  <Activity className="w-4 h-4 text-orange-400" />
                  <span>Update Performance Stats</span>
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 text-blue-400 bg-blue-400/10 px-4 py-2 rounded-full text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading existing stats...
              </div>
            )}
          </div>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Defensive Stats */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-24 h-24 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-blue-400 mb-6 flex items-center gap-2 border-b border-slate-700 pb-2">
                <Shield className="w-5 h-5" /> Defense & Special
              </h3>

              <div className="space-y-4 relative z-10">
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-300">Sacks</Label>
                  <Input type="number" {...register("pointsSacks")} className="bg-slate-900 border-slate-700 h-12 text-lg font-medium focus:border-blue-500" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-300">Interceptions</Label>
                  <Input type="number" {...register("interception")} className="bg-slate-900 border-slate-700 h-12 text-lg font-medium focus:border-blue-500" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-300">Safeties</Label>
                  <Input type="number" {...register("pointsSafety")} className="bg-slate-900 border-slate-700 h-12 text-lg font-medium focus:border-blue-500" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-300">Pick Sixes</Label>
                  <Input type="number" {...register("pickSix")} className="bg-slate-900 border-slate-700 h-12 text-lg font-medium focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Offensive Stats */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-24 h-24 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-orange-400 mb-6 flex items-center gap-2 border-b border-slate-700 pb-2">
                <Zap className="w-5 h-5" /> Offense & Scoring
              </h3>

              <div className="space-y-4 relative z-10">
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-300">Touchdowns</Label>
                  <Input type="number" {...register("touchdown")} className="bg-slate-900 border-slate-700 h-12 text-lg font-medium focus:border-orange-500" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-300">First Downs</Label>
                  <Input type="number" {...register("pointsfirstDown")} className="bg-slate-900 border-slate-700 h-12 text-lg font-medium focus:border-orange-500" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-300">Assists</Label>
                  <Input type="number" {...register("assist")} className="bg-slate-900 border-slate-700 h-12 text-lg font-medium focus:border-orange-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-slate-300 text-xs uppercase">Extra Pt 1</Label>
                    <Input type="number" {...register("extraPoint1")} className="bg-slate-900 border-slate-700 h-12 text-lg font-medium focus:border-orange-500" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-slate-300 text-xs uppercase">Extra Pt 2</Label>
                    <Input type="number" {...register("extraPoint2")} className="bg-slate-900 border-slate-700 h-12 text-lg font-medium focus:border-orange-500" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-300">Returns</Label>
                  <Input type="number" {...register("returnVal")} className="bg-slate-900 border-slate-700 h-12 text-lg font-medium focus:border-orange-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-700">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="h-14 px-8 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-900/20 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-3" />
                  Save Leaderboard Stats
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePlayerDetails;
