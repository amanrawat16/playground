import AntDTable from "@/components/AntDTable/AntDTable";
import Header from "@/layouts/Header/Header";
import { baseURL, getAllLeagues, getAllTeamsBasedOnLeague } from "@/services/api";
import { Spin } from "antd";
import { useEffect, useState } from "react";
import Select from "react-select";

function Summary() {
    const [isLoading, setIsLoading] = useState(false);
    const [teamsList, setTeamsList] = useState([]);
    const [paginatedteamsList, setPaginatedteamsList] = useState([]);
    const [leaguesList, setLeaguesList] = useState([]);
    const [selectedLeagueId, setSelectedLeague] = useState('')

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
        if (selectedLeagueId) fetchTeamsListBasedOnLeague(selectedLeagueId);
    }, [selectedLeagueId]);

    useEffect(()=>{
        fetchLeagues()
    },[])

    const columns = [
        {
            title: 'Image',
            align: "center",
            dataIndex: 'teamImage',
            key: 'teamImage',
            render: (text, record) => (
                <img src={`${baseURL}/uploads/${record?.teamImage.split('\\').pop().split('/').pop()}`} alt={`${record?.teamImage || "teamImage"}`} className='h-10 w-10 rounded-full' onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }}
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
        <>
            <Header />
            <section className="container mx-auto font-mono">
                <h1 className="text-3xl font-semibold text-center underline my-5 text-orange-600">
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
                    <div className="container mx-auto px-4 sm:px-8 w-[90%]">
                        <div className="py-8">
                            <div>
                                <h2 className="text-2xl font-semibold leading-tight text-orange-600 text-center">
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
                </div>
            </section>
        </>
    );
}

export default Summary;