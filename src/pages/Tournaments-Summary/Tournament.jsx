import React, { useEffect, useState } from "react";
import { getAllLeagues, getMatchesDataLeagueWise } from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import ReactLoader from "../../common/ReactLoader";
import LeagueWiseTournamentSummary from "./LeagueWiseTournamentSummary";
import MatchWiseTournamentSummary from "./MatchWiseTournamentSummary";
import { useLocation } from "react-router-dom";
import LeagueTeamWiseTournamentSummary from "./LeagueTeamWiseTournamentSummary";
import LeagueMatchSummary from "./LeagueMatchSummary";
// -------------------------------------------------------------------------------------
const Tournament = () => {
  const { pathname } = useLocation();

  const [leaguesList, setLeaguesList] = useState([]);
  const [matchesList, setMatchesList] = useState([]);
  const [matchesListLeagueWise, setmatchesListLeagueWise] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedMatch, setSelectedMatch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matchWiseAnalysisData, setMatchWiseAnalysisData] = useState([]);
  const [leagueWiseAnalysisData, setLeagueWiseAnalysisData] = useState([]);

  const [matchWiseDetails, setMatchWiseDetails] = useState([]);
  // ------------------------------------------------------------------------------------------------

  // Used to fetch the leagues list
  const fetchLeagues = async () => {
    try {
      setIsLoading(true);
      const data = await getAllLeagues();

      if (data) setIsLoading(false);

      // Modified Leagues data based on react-select format.
      const modifiedLeaguesList =
        Array.isArray(data?.leagues) &&
        data?.leagues?.length > 0 &&
        data?.leagues?.map((league) => {
          return {
            label: league?.leagueName,
            value: league?._id,
          };
        });
      setLeaguesList(modifiedLeaguesList);
    } catch (error) {
      setIsLoading(false);
      console.log("Getting an error while fetching leagues list: ", error);
    }
  };

  // Used to fetch the matches list based on selected league
  const fetchMatchesListLeagueWise = async () => {
    try {
      setIsLoading(true);
      const data = await getMatchesDataLeagueWise(selectedLeague);
      if (data) {
        toast.success("Details Fetched Successfully");
        setIsLoading(false);

        // Modified Matches data based on react-select format.
        const modifiedMatchesList =
          Array.isArray(data?.matchesLeagueWise) &&
          data?.matchesLeagueWise?.length > 0 &&
          data?.matchesLeagueWise?.map((match) => {
            return {
              label:
                // match?._id +
                // " - " +
                match?.team1?.teamName + " v/s " + match?.team2?.teamName,
              value: match?._id,
            };
          });
        setMatchesList(modifiedMatchesList);
      }

      const fetchedData = [...data.matchesLeagueWise];

      const result =
        Array.isArray(fetchedData) &&
        fetchedData?.length > 0 &&
        fetchedData.map((match) => {
          return {
            ...match,
            teamFirstPlayers: match?.team1?.players.map((player) => {
              return {
                ...player,
                teamId: match?.team1?._id,
                matchWiseDetails: player?.matchWiseDetails?.filter(
                  (ele) => ele?.matchId === match?._id
                ),
              };
            }),
            teamSecondPlayers: match?.team2?.players.map((player) => {
              return {
                ...player,
                teamId: match?.team2?._id,
                matchWiseDetails: player?.matchWiseDetails?.filter(
                  (ele) => ele?.matchId === match?._id
                ),
              };
            }),
          };
        });
      setmatchesListLeagueWise(result);
    } catch (error) {
      setIsLoading(false);
      console.log(
        "Getting an error while fetching matches list league wise: ",
        error
      );
    }
  };

  function findMaxRusherPoints(data) {
    let maxRusherPoints = 0;
    let bestPlayer = "";

    data.forEach((player) => {
      const rusherPoints = player?.bestRusher?.maxPoints;

      if (rusherPoints > maxRusherPoints) {
        maxRusherPoints = rusherPoints;
        bestPlayer = player?.bestRusher?.bestPlayer;
      }
    });

    return { maxRusherPoints, bestPlayer };
  }

  function findMaxDefenderPoints(data) {
    let maxDefenderPoints = 0;
    let bestPlayer = "";

    data.forEach((player) => {
      const defenderPoints = player?.bestDefender?.maxPoints;

      if (defenderPoints > maxDefenderPoints) {
        maxDefenderPoints = defenderPoints;
        bestPlayer = player?.bestDefender?.bestPlayer;
      }
    });

    return { maxDefenderPoints, bestPlayer };
  }

  function findMaxAttackerPoints(data) {
    let maxAttackerPoints = 0;
    let bestPlayer = "";

    data.forEach((player) => {
      const attackerPoints = player?.bestAttacker?.maxPoints;

      if (attackerPoints > maxAttackerPoints) {
        maxAttackerPoints = attackerPoints;
        bestPlayer = player?.bestAttacker?.bestPlayer;
      }
    });

    return { maxAttackerPoints, bestPlayer };
  }

  function findMaxQBPoints(data) {
    let maxQbPoints = 0;
    let bestPlayer = "";

    data.forEach((player) => {
      const qbPoints = player?.bestQB?.maxPoints;

      if (qbPoints > maxQbPoints) {
        maxQbPoints = qbPoints;
        bestPlayer = player?.bestQB?.bestPlayer;
      }
    });

    return { maxQbPoints, bestPlayer };
  }
  // -------------------------------------------------------------------------------------
  useEffect(() => {
    selectedLeague !== "" &&
      pathname !== "/dashboard/tournamentSummary/leagueTeamWise" &&
      pathname !== "/dashboard/tournamentSummary/leagueMatchSummary" &&
      fetchMatchesListLeagueWise();
  }, [selectedLeague]);

  // Calculations of Best in a Category
  useEffect(() => {
    console.log( matchesListLeagueWise)
    if (matchesListLeagueWise.length > 0) {
      const analysisData = matchesListLeagueWise.map((match) => {
        return [...match.teamFirstPlayers, ...match.teamSecondPlayers]?.map(
          (player) => {
            return {
              playerName: player?.playerName,
              scored: player?.matchWiseDetails?.[0]?.calculatedValue,
            };
          }
        );
      });

      // ---------------------------------------------------------------------------

      // Match Wise Calculation Start
      const findBestInCategory = (round, category) => {
        let bestPlayer;
        let maxPoints = -1;

        round.forEach((player) => {
          if (
            player.scored &&
            player.scored[category] &&
            player.scored[category] > maxPoints
          ) {
            maxPoints = player.scored[category];
            bestPlayer = player.playerName;
          }
        });

        // return bestPlayer + " - Points - " + maxPoints;
        return {
          bestPlayer,
          maxPoints,
        };
      };

      let resultData = [];
      for (let i = 0; i < analysisData.length; i++) {
        const roundResult = {
          bestRusher: findBestInCategory(analysisData[i], "rusherPointsScored"),
          bestAttacker: findBestInCategory(
            analysisData[i],
            "attackerPointsScored"
          ),
          bestDefender: findBestInCategory(
            analysisData[i],
            "defencePointsScored"
          ),
          bestQB: findBestInCategory(analysisData[i], "qbPointsScored"),
        };
        resultData = [...resultData, roundResult];
      }
      setMatchWiseAnalysisData([...resultData]);

      // Match Wise Calculation Finish

      // ---------------------------------------------------------------------------

      // League Wise Calculation Start



      const maxRusherPoints = findMaxRusherPoints(resultData);
      const maxDefenderPoints = findMaxDefenderPoints(resultData);
      const maxAttackerPoints = findMaxAttackerPoints(resultData);
      const maxQbPoints = findMaxQBPoints(resultData);

      setLeagueWiseAnalysisData([
        ...leagueWiseAnalysisData,
        maxRusherPoints,
        maxDefenderPoints,
        maxAttackerPoints,
        maxQbPoints,
      ]);
      // League Wise Calculation Finish
    }
  }, [matchesListLeagueWise]);

  useEffect(() => {
    if (selectedMatch && matchesListLeagueWise?.length > 0) {
      const selMatchObject = matchesListLeagueWise.filter(
        (match) => match?._id === selectedMatch
      );

      if (Object.keys(selMatchObject).length > 0)
        setMatchWiseDetails(selMatchObject);
    }
  }, [selectedMatch, matchesListLeagueWise]);

  useEffect(() => {
    fetchLeagues();
  }, []);
  // ============================================================================
  return (
    <>
      <section className="container mx-auto font-mono">
        <h1 className="text-3xl font-semibold text-center underline my-5">
          Tournament Summary
        </h1>

        <div>
          <div className="w-[70%] mx-auto mb-6 md:mb-5">
            <label
              className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
              htmlFor="grid-first-name"
            >
              Please select the League
            </label>

            <Select
              options={leaguesList}
              onChange={(val) => setSelectedLeague(val?.value)}
              placeholder="Please select the league"
            />
          </div>

          {(pathname === "/dashboard/tournamentSummary" ||
            pathname === "/dashboard/tournamentSummary/leagueWise") && (
              <LeagueWiseTournamentSummary
                leagueWiseSummany={matchWiseAnalysisData}
              />
            )}

          {pathname === "/dashboard/tournamentSummary/matchWise" && (
            <div>
              <div className="w-[70%] mx-auto mb-6 md:mb-5">
                <label
                  className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                  htmlFor="grid-first-name"
                >
                  Select Match
                </label>

                <Select
                  options={matchesList}
                  onChange={(val) => setSelectedMatch(val?.value)}
                  placeholder="Please select the match"
                />
              </div>
              <MatchWiseTournamentSummary
                selectedMatch={selectedMatch}
                matchWiseSummany={matchWiseDetails?.[0]}
              />
            </div>
          )}

          {pathname === "/dashboard/tournamentSummary/leagueTeamWise" && (
            <LeagueTeamWiseTournamentSummary
              selectedLeagueId={selectedLeague}
            />
          )}

          {/* {pathname === "/dashboard/tournamentSummary/leagueMatchSummary" && (
            <LeagueMatchSummary selectedLeagueId={selectedLeague} />
          )} */}
        </div>

        <ToastContainer position="bottom-right" autoClose={3000} />
      </section>
    </>
  );
};

export default Tournament;
