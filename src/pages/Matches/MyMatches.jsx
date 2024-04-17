import { useEffect } from "react"
import { getMyMatches } from "../../services/api"
import { useState } from "react"
import AntDTable from "../../components/AntDTable/AntDTable"

function MyMatches() {

    const clubId = localStorage.getItem('_id')
    const [matchdata, setMatchdata] = useState({})
    const [upcomingMatches, setUpcominMatches] = useState([])
    const [todayMatches, setTodayMatches] = useState([])
    const [completedMatches, setcompletedMatches] = useState([])

    const fetchMyMatches = async () => {
        try {
            const response = await getMyMatches(clubId)
            if (response.status === "SUCCESS") {
                setUpcominMatches(response.data.upcomingMatches)
                setTodayMatches(response.data.todayMatches)
                setcompletedMatches(response.data.completedMatches)
                setMatchdata(response.data)
            }

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchMyMatches()
    }, [clubId])

    const columns = [
        { title: "Team 1", dataIndex: ["team1", 'teamName'], key: "_id", 'align': "center" },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            'align': "center",
            render: (text, record) => <div
            >
                {record?.winningTeam?.winningTeamId ?
                    <p >{
                        record?.winningTeam?.winningTeamId === record?.team1?.teamName ? `${record?.winningTeam.winningTeamScore}-${record?.losingTeam?.losingTeamScore}` : `${record?.losingTeam?.losingTeamScore}-${record?.winningTeam.winningTeamScore}`
                    }</p> : <p >-</p>}
            </div>
        },
        { title: "Team 2", dataIndex: ["team2", 'teamName'], key: "_id", 'align': "center" },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            'align': "center",
            render: (text, record) => <p>
                {record.date.split("T")[0]}
            </p>
        },
        {
            title: "Start Time",
            dataIndex: "time",
            key: "startTime",
            'align': "center",
            render: (text, record) => (
                <p>{record?.time[0]?.startTime}</p>
            )
        },
        {
            title: "End Time",
            dataIndex: "time",
            key: "endTime",
            'align': "center",
            render: (text, record) => (
                <p>{record?.time[0]?.endTime}</p>
            )
        },
        { title: "Location", dataIndex: "location", key: "_id", 'align': "center" },
        { title: "Match Type", dataIndex: "matchType", key: "_id", 'align': "center" },
        { title: "Winning Team", dataIndex: "winningTeamName", key: "_id", 'align': "center" },
        { title: "Losing Team", dataIndex: "losingTeamName", key: "_id", 'align': "center" },
    ];

    const handleFilterupcomingMatches = (e) => {
        let name = e.target.value;
        name = name.trim();
        if (!name) return
        const filteredMatches = matchdata.upcomingMatches.filter(match =>
            match.team1.teamName.toLowerCase().includes(name.toLowerCase()) ||
            match.team2.teamName.toLowerCase().includes(name.toLowerCase())
        );
        setUpcominMatches(filteredMatches);
    }


    const handleFiltertodayMatches = (e) => {
        let name = e.target.value;
        name = name.trim();
        if (!name) return
        const filteredMatches = matchdata.todayMatches.filter(match =>
            match.team1.teamName.toLowerCase().includes(name.toLowerCase()) ||
            match.team2.teamName.toLowerCase().includes(name.toLowerCase())
        );
        setTodayMatches(filteredMatches);
    }


    const handlefiltercompletedMatches = (e) => {
        let name = e.target.value;
        name = name.trim();
        if (!name) return
        const filteredMatches = matchdata.completedMatches.filter(match =>
            match.team1.teamName.toLowerCase().includes(name.toLowerCase()) ||
            match.team2.teamName.toLowerCase().includes(name.toLowerCase())
        );
        setcompletedMatches(filteredMatches);
    }
    return (
        <div className="w-full h-auto">
            <div>

            </div>
            <div className=" m-20">
                <h1 className="text-center text-3xl my-5 font-bold">Upcoming Matches</h1>
                {
                    upcomingMatches?.length > 0 ?
                        <div>
                            <div>
                                <input type="text" onChange={handleFilterupcomingMatches} className="border-2 h-10 px-2"
                                    placeholder="Search Team"/>
                            </div>
                            <AntDTable columns={columns} data={upcomingMatches} />
                        </div>
                        :
                        <div className="m-10">
                            <p className="text-center text-gray-500">

                                You have no Upcoming Matches...
                            </p>
                        </div>
                }
            </div>
            <div className=" m-20">
                <h1 className="text-center text-3xl my-5 font-bold">Your Matches today</h1>
                {
                    todayMatches?.length > 0 ?
                        <div>
                            <div>
                                <input type="text" onChange={handleFiltertodayMatches} className="border-2 h-10 px-2"
                                    placeholder="Search Team"/>
                            </div>
                            <AntDTable columns={columns} data={todayMatches} />
                        </div>
                        :
                        <div className="m-10">
                            <p className="text-center text-gray-500">
                                You have no matches scheduled for today...
                            </p>
                        </div>
                }
            </div>
            <div className=" m-20">
                <h1 className="text-center text-3xl my-5 font-bold">Previous Matches</h1>
                {
                    completedMatches?.length > 0 ?
                        <div >
                            <div className=" flex justify-end p-5">
                                <input type="text" onChange={handlefiltercompletedMatches}
                                    className="border-2 h-10 px-2"
                                    placeholder="Search Team"
                                />
                            </div>
                            <AntDTable columns={columns} data={completedMatches} />
                        </div>
                        :
                        <div className="m-10">
                            <p className="text-center text-gray-500">

                                You have no Previous matches...
                            </p>
                        </div>
                }
            </div>
        </div>
    )
}

export default MyMatches