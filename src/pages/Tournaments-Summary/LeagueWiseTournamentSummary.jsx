import { useEffect, useState } from "react";
import AntDTable from "../../components/AntDTable/AntDTable";
import { getPlayerPerformancesOfLeague } from "../../services/api";
import { useNavigate } from "react-router-dom";
// ------------------------------------------------------------------------------------------
const LeagueWiseTournamentSummary = ({ selectedLeague }) => {

  const navigate = useNavigate()
  const [PlayersData, setPlayersData] = useState({})
  const rushercolums = [
    {
      title: "Players",
      dataIndex: [`playerName`],
      key: "_id",
      "align": "center",
    },
    {
      title: "Points",
      dataIndex: [`totalRusherPoints`],
      key: "_id",
      "align": "center",
    }
  ]

  const attackercolums = [
    {
      title: "Players",
      dataIndex: [`playerName`],
      key: "_id",
      "align": "center",
    },
    {
      title: "Points",
      dataIndex: [`totalAttackerPoints`],
      key: "_id",
      "align": "center",
    }
  ]

  const defendercolums = [
    {
      title: "Players",
      dataIndex: [`playerName`],
      key: "_id",
      "align": "center",
    },
    {
      title: "Points",
      dataIndex: [`totalDefenderPoints`],
      key: "_id",
      "align": "center",
    }
  ]

  const qbcolums = [
    {
      title: "Players",
      dataIndex: [`playerName`],
      key: "_id",
      "align": "center",
    },
    {
      title: "Points",
      dataIndex: [`totalQbPoints`],
      key: "_id",
      "align": "center",
    }
  ]


  const fetchPlayerPerformances = async () => {
    try {
      const response = await getPlayerPerformancesOfLeague(selectedLeague)
      if (response.status === 'SUCCESS') {
        console.log(response.data)
        setPlayersData(response.data)
      }

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchPlayerPerformances()
  }, [selectedLeague])

  const handleRowClick = (record) => {
    console.log(record)
    navigate(`/dashboard/playerProfile/${record.playerId}`);
  };

  return (
    <>
      <div className="grid md:grid-cols-2 grid-cols-1">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="py-8">
            <div>
              <h2 className="text-2xl font-semibold leading-tight text-center">
                Rushers
              </h2>
              <AntDTable columns={rushercolums} data={PlayersData?.rusherSorted} onRowClick={(record) => {
                return {
                  onClick: handleRowClick(record), // Click row
                };
              }} />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-8">
          <div className="py-8">
            <div>
              <h2 className="text-2xl font-semibold leading-tight  text-center">
                Attackers
              </h2>
            </div>
            <AntDTable columns={attackercolums} data={PlayersData?.attackerSorted} onRowClick={(record,) => {
              return {
                onClick: handleRowClick(record) , // Click row
              };
            }} />
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-8">
          <div className="py-8">
            <div>
              <h2 className="text-2xl font-semibold leading-tight text-center">
                Defenders
              </h2>
            </div>
            <AntDTable columns={defendercolums} data={PlayersData?.defenderSorted} onRowClick={(record, ) => {
              return {
                onClick:  handleRowClick(record), // Click row
              };
            }} />
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-8">
          <div className="py-8">
            <div>
              <h2 className="text-2xl font-semibold leading-tight text-center">
                QBs
              </h2>
            </div>
            <AntDTable columns={qbcolums} data={PlayersData?.qbSorted} onRowClick={(record) => {
              return {
                onClick: handleRowClick(record), // Click row
              };
            }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LeagueWiseTournamentSummary;
