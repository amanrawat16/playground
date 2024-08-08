import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPlayer } from '../../services/api'
import { useState } from 'react'
import AntDTable from '../../components/AntDTable/AntDTable'

function PlayerProfile() {
    const navigate = useNavigate()
    const { playerId } = useParams()
    const [playerDetail, setPlayerDetail] = useState({})

    const fetchPlayer = async () => {
        try {
            const response = await getPlayer(playerId)
            if (response.status === "SUCCESS") {
                setPlayerDetail(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const columns = [
        {
            title: 'League Name',
            dataIndex: ['matchId', 'league', 'leagueName'],
            key: 'leagueName',
            align: 'center',
        },
        {
            title: 'Location',
            dataIndex: ['matchId', 'location'],
            key: 'location',
            align: 'center',
        },
        {
            title: 'Match Type',
            dataIndex: ['matchId', 'matchType'],
            key: 'matchType',
            align: 'center',
        },
        {
            title: 'Total Points Scored',
            dataIndex: ['calculatedValue', 'totalPointsScored'],
            key: 'totalPointsScored',
            align: 'center',
        },
        {
            title: 'Rusher Points Scored',
            dataIndex: ['calculatedValue', 'rusherPointsScored'],
            key: 'rusherPointsScored',
            align: 'center',
        },
        {
            title: 'Attacker Points Scored',
            dataIndex: ['calculatedValue', 'attackerPointsScored'],
            key: 'attackerPointsScored',
            align: 'center',
        },
        {
            title: 'Defence Points Scored',
            dataIndex: ['calculatedValue', 'defencePointsScored'],
            key: 'defencePointsScored',
            align: 'center',
        },
        {
            title: 'QB Points Scored',
            dataIndex: ['calculatedValue', 'qbPointsScored'],
            key: 'qbPointsScored',
            align: 'center',
        },
        {
            title: 'Date',
            dataIndex: ['matchId', 'date'],
            key: 'date',
            align: 'center',
            render: text => new Date(text).toLocaleDateString(),
        },
    ];

    useEffect(() => {
        fetchPlayer()
    }, [playerId])
    return (
        <div className='w-full  p-10 '>
            <div className='w-full rounded-md py-10 '>
                <div className='w-full flex shadow-md rounded-lg text-gray-500'>
                    <div className='w-1/3 flex items-center justify-center'>
                        {
                            playerDetail?.playerName &&
                            <div className='w-32 h-32 rounded-full flex justify-center items-center bg-red-400'>
                                <h1 className='text-6xl text-white'>
                                    {
                                        playerDetail?.playerName?.split(" ").map(name => name[0].toUpperCase()).join("")
                                    }
                                </h1>
                            </div>
                        }
                    </div>
                    <div className='w-2/3 flex flex-col py-10  justify-around h-full '>
                        <h1 className=' text-3xl px-10'>{
                            playerDetail?.playerName?.split(" ").map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(" ")}</h1>
                        <div className=' flex justify-between flex-wrap px-4 mt-10'>

                            <p className='text-center inline'> {
                                playerDetail?.email
                            }</p>
                            <p className='text-center inline'>
                                Jersey No. - {
                                    playerDetail?.jerseyNumber && < span className=' font-bold'>{playerDetail?.jerseyNumber}</span>
                                }
                            </p>
                            <p className='text-center  inline'>
                                Position - <span className=' font-bold'>{
                                    playerDetail?.position
                                }</span>
                            </p>
                            <p className='text-center inline'>
                                Role - <span className=' font-bold'>{
                                    playerDetail?.role}</span>

                            </p>
                        </div>
                    </div>
                </div>
                <div className='w-full'>
                    <h1 className='text-center text-2xl py-10 text-gray-500'>Player Stats</h1>
                    <AntDTable data={playerDetail.matchWiseDetails} columns={columns} onRowClick={
                        (record) => {
                            navigate(`/dashboard/matches/viewMatches`, { state: { leagueId: record.matchId.league._id } });
                        }
                    } />
                </div>
            </div>
        </div >
    )
}

export default PlayerProfile