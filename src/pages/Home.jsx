import MatchModals from '@/common/MatchModals';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/layouts/Header/Header';

import { getAllLeagues, viewMatchesByLeague } from '@/services/api';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
const baseURL = import.meta.env.VITE_BASE_URL;
function Home() {
    const [viewMatchData, setViewMatchData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [league, setLeague] = useState('all')
    const navigate = useNavigate();
    const [leaguesData, setLeaguesData] = useState([])
    const userType = localStorage.getItem('userType')
    console.log(userType)

    const fetchLeagues = async () => {
        try {
            const response = await getAllLeagues()
            setLeaguesData(response.leagues)
        } catch (error) {
            console.log(error)
        }
    }

    const handleLeagueChange = (e) => {
        setLeague(e)
        handleViewMatches(e)
    }

    const handleViewMatches = async (leagueId) => {
        try {
            const response = await viewMatchesByLeague(leagueId)

            if (response.status === 'SUCCESS') {
                setViewMatchData(response.matchesList)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (userType) {
            navigate('/dashboard')
        }
        fetchLeagues()
    }, []);



    useEffect(() => {
        handleViewMatches(league)
    }, [league]);
    return (
        <><Header />
            <div>
                <section className="container mx-auto py-6 font-mono">
                    <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-orange-600 mb-4">
                        Matches List
                    </h2>
                    <div className="h-16 my-5 flex justify-end items-center px-10">
                        <Select name="league" id="league" className="h-12 px-4" onValueChange={handleLeagueChange} defaultValue={'all'} value={league}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a League" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Leagues</SelectLabel>
                                    < SelectItem value={'all'}>All</SelectItem>
                                    {
                                        leaguesData.length > 0 && leaguesData.map((league) => {
                                            return < SelectItem value={league._id} key={league._id}>{league.leagueName}</SelectItem>
                                        })
                                    }
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full mb-8 overflow-hidden rounded-lg my-10">
                        <Table className='shadow-xl '>
                            <TableCaption> List of matches of selected League.</TableCaption>
                            <TableHeader>
                                <TableRow className="bg-orange-600 hover:bg-orange-600">
                                    <TableHead className='text-white'>S.No</TableHead>
                                    <TableHead className='text-white'>Team 1</TableHead>
                                    <TableHead className='text-white'>Scores</TableHead>
                                    <TableHead className='text-white'>Team 2</TableHead>
                                    <TableHead className="text-center text-white">Date</TableHead>
                                    <TableHead className="text-center text-white">League</TableHead>
                                    <TableHead className="text-center text-white">Location</TableHead>
                                    <TableHead className="text-center text-white">Winner</TableHead>
                                    <TableHead className="text-center text-white"></TableHead>
                                    <TableHead className="text-center text-white">View</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    viewMatchData?.length > 0 && (
                                        viewMatchData?.map((item, index) => (
                                            <TableRow key={index} >
                                                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                                                <TableCell className="text-center"><img src={`${baseURL}/uploads/${item?.team1?.teamImage.split("\\")[1]}`} alt={`${item?.team1?.teamName}`}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }} className="w-10 h-10 rounded-full mx-auto" />
                                                    <p>
                                                        {item?.team1?.teamName}
                                                    </p>
                                                </TableCell>
                                                {
                                                    item?.winningTeam?.winningTeamId ?
                                                        <TableCell className="bg-gray-50  text-center text-md">{item?.team1?.goalsScoredByTeam} - {item?.team2?.goalsScoredByTeam}</TableCell> : <TableCell className=" text-center bg-gray-50">-</TableCell>
                                                }
                                                <TableCell>
                                                    <img src={`${baseURL}/uploads/${item?.team2?.teamImage?.split("\\")[1]}`} alt={`${item?.team2?.teamName}`}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }}
                                                        className="w-10 h-10 rounded-full mx-auto" />
                                                    <p className="ml-2 text-center">
                                                        {item?.team2?.teamName}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {moment(item?.date).format("DD/MM/YYYY")}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item?.league?.leagueName}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item?.location}
                                                </TableCell>
                                                <TableCell className="text-center">{item?.winningTeamName ? `${item.winningTeamName}` : '-'}</TableCell>
                                                <TableCell className="text-center">{item.matchType}</TableCell>
                                                <TableCell className="text-center"><MatchModals viewDetails={{ item, index }} /></TableCell>
                                            </TableRow>
                                        )))
                                }
                            </TableBody>
                        </Table>
                    </div>
                    {/* Modals Starts Here */}

                    <dialog id="my_modal_3" className="modal">
                        <div className="modal-box">
                            <form method="dialog">
                                {/* if there is a button in form, it will close the modal */}
                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                                    ✕
                                </button>
                            </form>
                            <h3 className="font-bold text-lg">Hello!</h3>
                            <p className="py-4">
                                Press ESC key or click on ✕ button to close
                            </p>
                        </div>
                    </dialog>
                    {/* Modals Ends Here */}
                </section >
            </div >
        </>
    );
}

export default Home