import React, { useEffect, useState } from "react";
import { getAllTeamsBasedOnLeague } from "../../services/api";
import Pagination from "../../common/Pagination";
import { Spin, Table } from "antd";
import AntDTable from "@/components/AntDTable/AntDTable";
// ---------------------------------------------------------------------------------------------
const baseURL = import.meta.env.VITE_BASE_URL;
const LeagueTeamWiseTournamentSummary = ({ selectedLeagueId }) => {
  // console.log("selectedLeagueId::::", selectedLeagueId);
  const [isLoading, setIsLoading] = useState(false);
  const [teamsList, setTeamsList] = useState([]);
  const [paginatedteamsList, setPaginatedteamsList] = useState([]);

  // Used to fetch the teams list based on league id
  const fetchTeamsListBasedOnLeague = async (selectedLeagueId) => {
    try {
      setIsLoading(true);
      const data = await getAllTeamsBasedOnLeague(selectedLeagueId);
      console.log(data)
      if (data) setIsLoading(false);
      setTeamsList(data?.teams);
    } catch (error) {
      setIsLoading(false);
      console.log("Getting an error while fetching teams list: ", error);
    }
  };

  useEffect(() => {
    if (teamsList?.length > 0) {
      // console.log("teamsList::: ", teamsList);
    }
  }, [teamsList]);

  useEffect(() => {
    if (paginatedteamsList?.length > 0) {
      // console.log("paginatedteamsList::: ", paginatedteamsList);
    }
  }, [paginatedteamsList]);

  useEffect(() => {
    if (selectedLeagueId) fetchTeamsListBasedOnLeague(selectedLeagueId);
  }, [selectedLeagueId]);

  const columns = [
    {
      title: 'Image',
      align: "center",
      dataIndex: 'teamImage',
      key: 'teamImage',
      render: (text, record) => (
        <img src={`${baseURL}/uploads/${record?.teamImage?.split("\\")[1]}`} alt={`${record?.teamImage || "teamImage"}`} className='h-10 w-10 rounded-full' onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }}
        />
      ),
    },
    {
      title: 'Team Name',
      align: "center",
      dataIndex: 'teamName',
      key: 'teamName',
    },
    {
      title: 'Points',
      align: "center",
      dataIndex: 'pointsScored',
      key: 'pointsScored',
    },
    {
      title: 'P',
      align: "center",
      dataIndex: 'totalMatchesPlayed',
      key: 'totalMatchesPlayed',
    },
    {
      title: 'W',
      align: "center",
      dataIndex: 'wonMatches',
      key: 'wonMatches',
    },
    {
      title: 'L',
      align: "center",
      dataIndex: 'lostMatches',
      key: 'lostMatches',
    },
    {
      title: 'T',
      align: "center",
      dataIndex: 'tieMatches',
      key: 'tieMatches',
    },
    {
      title: 'PF',
      align: "center",
      dataIndex: 'goalsScoredByTeam',
      key: 'goalsScoredByTeam',
    },
    {
      title: 'PA',
      align: "center",
      dataIndex: 'goalsScoredAgainstTeams',
      key: 'goalsScoredAgainstTeams',
    },
    {
      title: 'PD',
      align: "center",
      dataIndex: 'scoreDifference',
      key: 'scoreDifference',
      render: (_, record) => {
        console.log(record)
        return <div>{record.goalsScoredByTeam - record.goalsScoredAgainstTeams}</div>
      }
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-8 w-[90%]">
      <div className="py-8">
        <div>
          <h2 className="text-2xl font-semibold leading-tight text-center">
            Team Standings List
          </h2>
        </div>

        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          {isLoading ? (
            <Spin size="large" />
          ) : (
            <AntDTable
              data={teamsList} columns={columns} onRowClick
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueTeamWiseTournamentSummary;
