import React, { useEffect, useState, useMemo } from "react";
import { getAllLeagues, getTournamentsByLeague, getTournamentMatches } from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactLoader from "../../common/ReactLoader";
import LeagueWiseTournamentSummary from "./LeagueWiseTournamentSummary";
import MatchWiseTournamentSummary from "./MatchWiseTournamentSummary";
import { useLocation, useNavigate } from "react-router-dom";
import LeagueTeamWiseTournamentSummary from "./LeagueTeamWiseTournamentSummary";
import LeagueMatchSummary from "./LeagueMatchSummary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trophy, Search, Calendar, MapPin, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
// -------------------------------------------------------------------------------------
const Tournament = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [leaguesList, setLeaguesList] = useState([]);
  const [tournamentsList, setTournamentsList] = useState([]);
  const [matchesList, setMatchesList] = useState([]);
  const [matchesListLeagueWise, setmatchesListLeagueWise] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedMatch, setSelectedMatch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New state for match filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  // ------------------------------------------------------------------------------------------------

  // Used to fetch the leagues list
  const fetchLeagues = async () => {
    try {
      setIsLoading(true);
      const data = await getAllLeagues();

      if (data) setIsLoading(false);

      // Modified Leagues data based on react-select format.
      // SAFE CHECK: Ensure data.leagues is an array, default to [] if undefined/null/false
      const leaguesArray = Array.isArray(data?.leagues) ? data.leagues : [];
      const modifiedLeaguesList = leaguesArray.map((league) => {
        return {
          label: league?.leagueName,
          value: league?._id,
        };
      });
      setLeaguesList(modifiedLeaguesList);
    } catch (error) {
      setIsLoading(false);
      console.log("Getting an error while fetching leagues list: ", error);
      setLeaguesList([]); // Ensure it's empty array on error
    }
  };


  // Used to fetch tournaments based on selected league
  const fetchTournaments = async () => {
    if (!selectedLeague) {
      setTournamentsList([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getTournamentsByLeague(selectedLeague);

      const tournamentsArray = data && Array.isArray(data.tournaments) ? data.tournaments : [];

      if (tournamentsArray.length > 0) {
        const modifiedTournamentsList = tournamentsArray.map(tournament => ({
          label: tournament.name,
          value: tournament._id
        }));
        setTournamentsList(modifiedTournamentsList);

        // Auto-select first tournament if available
        if (modifiedTournamentsList.length > 0) {
          // setSelectedTournament(modifiedTournamentsList[0].value); 
          setSelectedTournament(""); // Force manual selection
        } else {
          setSelectedTournament("");
        }
      } else {
        setTournamentsList([]);
        setSelectedTournament("");
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("Error fetching tournaments: ", error);
      setTournamentsList([]); // Safety fallback
    }
  };

  // Used to fetch the matches list based on selected tournament
  const fetchMatchesListTournamentWise = async () => {
    if (!selectedTournament) {
      setMatchesList([]);
      setmatchesListLeagueWise([]);
      return;
    }

    try {
      setIsLoading(true);
      // Use V2 API to get matches for the tournament
      const data = await getTournamentMatches(selectedTournament);

      if (data && data.status === 'SUCCESS') {
        toast.success("Details Fetched Successfully");
        setIsLoading(false);

        const v2Matches = data.matches || [];

        // Modified Matches data based on react-select format.
        const modifiedMatchesList = v2Matches.map((match) => {
          return {
            label: (match?.homeTeam?.team?.teamName || "TBD") + " v/s " + (match?.awayTeam?.team?.teamName || "TBD"),
            value: match?._id,
          };
        });
        setMatchesList(modifiedMatchesList);

        // Map V2 matches to the structure expected by legacy analysis functions if needed
        // Note: MatchWiseTournamentSummary now handles V2 structure directly, 
        // but if we need 'teamFirstPlayers' etc here for legacy logic, we can mock it or fetch player stats aggregation
        // For now, passing raw matches might be enough if child components fetch their own stats

        // However, existing logic (lines 80+) did some heavy processing to attach players to matches.
        // MatchWiseTournamentSummary now fetches its own player stats via getMatchPlayerStats(matchId).
        // So we might not need to pre-populate players here.
        // But let's populate 'team1' and 'team2' structure just in case other parts rely on it.

        const result = v2Matches.map(match => ({
          ...match,
          team1: match.homeTeam?.team,
          team2: match.awayTeam?.team,
          date: match.scheduledAt,
          time: match.scheduledTime,
          matchType: match.stage,
          location: match.location,
          team1stPoints: {
            score: match.homeScore,
            points: match.pointsAwarded?.home || 0
          },
          team2ndPoints: {
            score: match.awayScore,
            points: match.pointsAwarded?.away || 0
          },
          league: selectedLeague // Preserve league ID context if needed
        }));

        setmatchesListLeagueWise(result);
      } else {
        setIsLoading(false);
        setMatchesList([]);
        setmatchesListLeagueWise([]);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(
        "Getting an error while fetching matches list tournament wise: ",
        error
      );
    }
  };

  useEffect(() => {
    fetchTournaments();
    setSelectedTournament("");
    setMatchesList([]);
    setmatchesListLeagueWise([]);
    setSelectedMatch("");
  }, [selectedLeague]);

  useEffect(() => {
    fetchMatchesListTournamentWise();
    setSelectedMatch("");
    setSearchQuery("");
    setStageFilter("all");
  }, [selectedTournament]);

  // Filter matches based on search and stage
  const filteredMatches = useMemo(() => {
    return matchesListLeagueWise.filter(match => {
      const homeTeamName = match.team1?.teamName || match.homeTeam?.team?.teamName || "";
      const awayTeamName = match.team2?.teamName || match.awayTeam?.team?.teamName || "";
      const matchLabel = `${homeTeamName} ${awayTeamName}`.toLowerCase();

      const matchesSearch = searchQuery === "" || matchLabel.includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === "all" || match.stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [matchesListLeagueWise, searchQuery, stageFilter]);

  // Get unique stages for the filter dropdown
  const availableStages = useMemo(() => {
    const stages = new Set(matchesListLeagueWise.map(m => m.stage).filter(Boolean));
    return Array.from(stages);
  }, [matchesListLeagueWise]);

  // Format stage name for display
  const formatStageName = (stage) => {
    if (!stage) return "Unknown";
    return stage.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };



  useEffect(() => {
    fetchLeagues();
  }, []);
  // ============================================================================
  return (
    <>
      <section className="min-h-screen bg-[#0f172a] py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Compact Header */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-orange-900/20 border border-orange-900/50 rounded-lg">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Tournament Summary
              </h1>
            </div>
          </div>

          <div>
            {/* Compact League Selection */}
            <div className="mb-4 max-w-xl">
              <div className="bg-[#1e293b] rounded-lg shadow-md border border-slate-700 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Label className="block text-sm font-semibold text-slate-300 whitespace-nowrap">
                    Select League <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setSelectedLeague(value)}
                    value={selectedLeague || undefined}
                    className="flex-1 sm:max-w-xs"
                  >
                    <SelectTrigger className="w-full h-10 bg-[#0f172a] text-slate-200 border-2 border-slate-700 focus:border-orange-500">
                      <SelectValue placeholder="Select a league" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                      {leaguesList.map((league) => (
                        <SelectItem key={league.value} value={league.value} className="focus:bg-slate-700 focus:text-white cursor-pointer">
                          {league.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>





            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="w-full md:w-1/3">
                <Label className="text-slate-400 mb-2 block">Select Tournament</Label>
                <Select
                  value={selectedTournament}
                  onValueChange={(val) => setSelectedTournament(val)}
                  disabled={!selectedLeague || tournamentsList.length === 0}
                >
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select Tournament" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {tournamentsList.map((tournament) => (
                      <SelectItem
                        key={tournament.value}
                        value={tournament.value}
                        className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                      >
                        {tournament.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Match Table for matchWise view */}
            {pathname === "/dashboard/tournamentSummary/matchWise" && selectedTournament && (
              <div className="mb-6">
                {/* Search and Filter Controls */}
                <div className="bg-[#1e293b] rounded-lg shadow-md border border-slate-700 p-4 mb-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Search by team name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-[#0f172a] border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    {/* Stage Filter */}
                    <div className="w-full md:w-48">
                      <Select value={stageFilter} onValueChange={setStageFilter}>
                        <SelectTrigger className="w-full bg-[#0f172a] border-slate-700 text-white">
                          <Filter className="w-4 h-4 mr-2 text-slate-400" />
                          <SelectValue placeholder="All Stages" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                          <SelectItem value="all" className="focus:bg-slate-700 cursor-pointer">All Stages</SelectItem>
                          {availableStages.map((stage) => (
                            <SelectItem key={stage} value={stage} className="focus:bg-slate-700 cursor-pointer">
                              {formatStageName(stage)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Matches Table */}
                <div className="bg-[#1e293b] rounded-lg shadow-md border border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#0f172a] border-b border-slate-700 hover:bg-[#0f172a]">
                          <TableHead className="text-slate-300 font-semibold py-4">Teams</TableHead>
                          <TableHead className="text-slate-300 font-semibold py-4">Stage</TableHead>
                          <TableHead className="text-slate-300 font-semibold py-4">Status</TableHead>
                          <TableHead className="text-slate-300 font-semibold py-4">Score</TableHead>
                          <TableHead className="text-slate-300 font-semibold py-4">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMatches.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                              {matchesListLeagueWise.length === 0
                                ? "No matches found for this tournament"
                                : "No matches match your search criteria"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredMatches.map((match) => {
                            const homeTeamName = match.team1?.teamName || match.homeTeam?.team?.teamName || "TBD";
                            const awayTeamName = match.team2?.teamName || match.awayTeam?.team?.teamName || "TBD";
                            const isSelected = selectedMatch === match._id;

                            return (
                              <TableRow
                                key={match._id}
                                onClick={() => navigate(`/dashboard/matchSummary/${match._id}`)}
                                className={`cursor-pointer transition-all duration-200 border-b border-slate-700
                                  ${isSelected
                                    ? "bg-orange-900/30 border-l-4 border-l-orange-500"
                                    : "hover:bg-slate-800/50"}`}
                              >
                                <TableCell className="py-4">
                                  <div className="flex items-center gap-2">
                                    {isSelected && (
                                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                    )}
                                    <span className="font-medium text-white">
                                      {homeTeamName}
                                    </span>
                                    <span className="text-slate-500 text-sm">vs</span>
                                    <span className="font-medium text-white">
                                      {awayTeamName}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-700 text-slate-300">
                                    {formatStageName(match.stage)}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full
                                    ${match.status === "completed"
                                      ? "bg-green-900/30 text-green-400 border border-green-700"
                                      : match.status === "live"
                                        ? "bg-red-900/30 text-red-400 border border-red-700"
                                        : "bg-blue-900/30 text-blue-400 border border-blue-700"}`}>
                                    {match.status?.charAt(0).toUpperCase() + match.status?.slice(1) || "Scheduled"}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4">
                                  {match.status === "completed" ? (
                                    <span className="font-bold text-white">
                                      {match.homeScore ?? 0} - {match.awayScore ?? 0}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(match.scheduledAt || match.date)}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Match Count */}
                  <div className="px-4 py-3 border-t border-slate-700 bg-[#0f172a]">
                    <p className="text-sm text-slate-400">
                      Showing {filteredMatches.length} of {matchesListLeagueWise.length} matches
                      {selectedMatch && " • Click on match summary below"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Match Summary is now shown on a separate page via /dashboard/matchSummary/:matchId */}

            {pathname === "/dashboard/tournamentSummary/leagueWise" && (
              <LeagueWiseTournamentSummary selectedLeague={selectedTournament} />
            )}
            {pathname === "/dashboard/tournamentSummary/leagueTeamWise" && (
              <LeagueTeamWiseTournamentSummary selectedLeagueId={selectedTournament} />
            )}
          </div>
        </div>

        <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
      </section>
    </>
  );
};

export default Tournament;
