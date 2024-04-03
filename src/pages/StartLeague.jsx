
import { MdNotStarted } from "react-icons/md";
import { MdOutlineCreate } from "react-icons/md";
import { IoMdAddCircle } from "react-icons/io";
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify'
import { getAllLeagues, updateFixture, viewLeagueFixture } from '../services/api';
import Swal from 'sweetalert2';
import { CiFlag1 } from "react-icons/ci";
import { GiBabyfootPlayers } from "react-icons/gi";
import { Tabs } from 'antd';
import StartRegularRounds from '../components/StartLeague/StartRegularRounds';
import CreateGroups from '../components/StartLeague/CreateGroups';
import AddTeams from '../components/StartLeague/AddTeams';
import Creatematches from "../components/StartLeague/Creatematches";
import QuaterFinals from "../components/StartLeague/QuaterFinals";
import SemiFinals from "../components/StartLeague/SemiFinals";
import Finals from "../components/StartLeague/Finals";

//-------------------------------------------------------------------------------------------------------------

const items = [
    {
        title: "Start Regular Rounds",
        status: 'process',
        icon: <MdNotStarted />
    }, {
        title: "Create Groups",
        status: "wait",
        icon: <MdOutlineCreate />
    }, {
        title: "Add teams",
        status: "wait",
        icon: <IoMdAddCircle />
    },
    {
        title: "Start Matches",
        status: 'wait',
        icon: <CiFlag1 />
    },
    {
        title: "Start QuaterFinals",
        status: 'wait',
        icon: <GiBabyfootPlayers />
    }
]



function StartLeague() {
    const [steps, setSteps] = useState(items)
    const [current, setCurrent] = useState(0)
    const [leagues, setLeagues] = useState([])
    const [LeagueTeams, setLeagueTeams] = useState([])
    const [leagueId, setLeagueId] = useState('')
    const [approvedTeams, setApprovedTeams] = useState([])
    const [unapprovedTeams, setUnapprovedTeams] = useState([])
    const [isRegularRoundStarted, setIsRegularRoundStarted] = useState(false)
    const [fixtureId, setLeagueFixtureId] = useState('')
    const [fixtureGroups, setFixtureGroups] = useState([])
    const [leagueName, setLeagueName] = useState('')
    const [activekey, setActiveKey] = useState('1')
    const [isCreateGroupsDisabled, setIsCreateGroupsDisabled] = useState(false)
    const [isAddTeamsStarted, setIsAddTeamsStarted] = useState(false)
    const [quaterFinalsStarted, setIsQuaterFinalStarted] = useState(false)
    const [quaterFinalMatches, setQuaterFinalMatches] = useState([])
    const [semiFinalTeams, setSemiFinalTeams] = useState([])
    const [semiFinalsStarted, setIsSemiFinalsStarted] = useState(false)
    const [finalTeams, setFinalTeams] = useState([])
    const [isFinalsStarted, setIsFinalsStarted] = useState(false)
    const handleNextComponent = () => {
        const next = Number(activekey) + 1
        const newNext = `${next}`
        handleKeyChange(newNext)
        setCurrent((prev) => prev + 1)
    }



    const fetchLeagues = async () => {
        try {
            const response = await getAllLeagues()
            setLeagues(response.leagues)
            fetchLeagueFixture(response.leagues[0]._id)
            setLeagueId(response.leagues[0]._id)
        } catch (error) {
            console.log(error)
        }
    }

    const handleLeagueChange = (e) => {
        const leagueId = e.target.value;
        if (leagueId === '') {
            setLeagueTeams([])
            return;
        }

        setLeagueId(leagueId)
        const league = leagues.filter((league) => league._id === leagueId)
        setLeagueName(league[0].leagueName)
        fetchLeagueFixture(leagueId)

    }



    const fetchLeagueFixture = async (leagueId) => {
        if (leagueId === '') {
            return;
        }
        try {
            const response = await viewLeagueFixture(leagueId)
            if (response.status === 'SUCCESS') {
                console.log(response.leagueFixture)
                setFixtureGroups(response?.leagueFixture.groups)
                const teams = response?.leagueFixture?.teams
                const UnapprovedLeagueTeams = teams.filter((team) => team.status === 'Not Approved')
                const ApprovedLeagueTeams = teams.filter((team) => team.status === 'Approved')
                setLeagueFixtureId(response?.leagueFixture._id)
                setApprovedTeams(ApprovedLeagueTeams)
                setUnapprovedTeams(UnapprovedLeagueTeams)
                setLeagueTeams(teams)
                setCurrent(response?.leagueFixture.current)
                modifyStepsItem(response?.leagueFixture.current)
                setIsRegularRoundStarted(response?.leagueFixture?.regularRoundStarted)
                modifyStepsItem(response?.leagueFixture.current)
                setIsCreateGroupsDisabled(response?.leagueFixture.createGroupsStarted)
                setIsAddTeamsStarted(response?.leagueFixture?.addteamsStarted)
                setIsQuaterFinalStarted(response?.leagueFixture?.quaterFinalsStarted)
                setQuaterFinalMatches(response?.leagueFixture.quaterFinalMatches)
                setSemiFinalTeams(response?.leagueFixture?.semiFinalTeams)
                setIsSemiFinalsStarted(response?.leagueFixture?.semiFinalMatchesStarted)
                setFinalTeams(response?.leagueFixture.finalTeams)
                setIsFinalsStarted(response?.leagueFixture?.finalsStarted)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleAddGroups = (current) => {
        setCurrent(current)
        modifyStepsItem(current)
    }

    const modifyStepsItem = (i) => {
        const modifiedSteps = items.map((step, index) => {
            if (index < i) {
                return { ...step, status: "finish" }
            }
            return step
        })
        setSteps(modifiedSteps)
    }

    const handleApproveTeam = (i) => {
        const team = LeagueTeams[i]
        const updatedTeams = LeagueTeams.map((team, index) => {
            if (index === i) {
                return { ...team, status: "Approved" }
            }
            return team;
        })
        setLeagueTeams(updatedTeams)
        setApprovedTeams([...approvedTeams, { ...team, status: "Approved" }])
    };

    const handleUnapproveTeam = (i) => {
        console.log(i)
        const updateTeam = LeagueTeams[i]
        const modifyUpdatedTeam = { ...updateTeam, status: "Not Approved" }
        setApprovedTeams(approvedTeams.filter((team) => team._id !== updateTeam._id))
        setUnapprovedTeams([...unapprovedTeams, modifyUpdatedTeam])
        const updatedTeamStatus = LeagueTeams.map((team) => {
            if (team._id === updateTeam._id) {
                return { ...team, status: "Not Approved" };
            }
            return team;
        });
        setLeagueTeams(updatedTeamStatus);
    };

    const handleStartRegularRounds = () => {
        try {
            Swal.fire({
                title: "Start Regular Rounds?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Start"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await updateFixture(leagueId, { teams: LeagueTeams, regularRoundStarted: true, current: 1 })
                    if (response.status === 'SUCCESS') {
                        toast.success("Regular Rounds Started")
                        setIsRegularRoundStarted(response.leagueFixture.regularRoundStarted)
                        handleNextComponent()
                    }
                }
            });
        } catch (error) {
            console.error(error)
        }

    }

    const handleUpdateFixtureData = async (Data) => {
        try {
            const response = await updateFixture(leagueId, Data)
            console.log(response)
            if (response.status === "SUCCESS") {
                setFixtureGroups(response?.leagueFixture.groups)
                handleNextComponent()
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleKeyChange = (key) => {
        setActiveKey(key)
    }

    const tabs = [
        {
            key: '1',
            label: 'Start Regular Rounds',
            children: <StartRegularRounds handleNextComponent={handleNextComponent} approvedTeams={approvedTeams} setApprovedTeams={setApprovedTeams} handleUnapproveTeam={handleUnapproveTeam} isRegularRoundStarted={isRegularRoundStarted} setIsRegularRoundStarted={setIsRegularRoundStarted} handleStartRegularRounds={handleStartRegularRounds} />,
        },
        {
            key: '2',
            label: 'Create Groups',
            children: <CreateGroups handleNextComponent={handleNextComponent} approvedTeams={approvedTeams} fixtureId={fixtureId} handleAddGroups={handleAddGroups} setFixtureGroups={setFixtureGroups} isCreateGroupsDisabled={isCreateGroupsDisabled} setIsCreateGroupsDisabled={setIsCreateGroupsDisabled} />,
        },
        {
            key: '3',
            label: 'Add Teams',
            children: <AddTeams handleNextComponent={handleNextComponent} fixtureGroups={fixtureGroups} approvedTeams={approvedTeams} handleUpdateFixtureData={handleUpdateFixtureData} isAddTeamsStarted={isAddTeamsStarted} setIsAddTeamsStarted={setIsAddTeamsStarted} />,
        }, {
            key: '4',
            label: "Create Matches",
            children: <Creatematches handleNextComponent={handleNextComponent} fixtureGroups={fixtureGroups} approvedTeams={approvedTeams} leagueName={leagueName} fixtureId={fixtureId} leagueId={leagueId} quaterFinalsStarted={quaterFinalsStarted} setIsQuaterFinalStarted={setIsQuaterFinalStarted} fetchLeagueFixture={fetchLeagueFixture} />
        },
        {
            key: '5',
            label: "Quater Finals",
            children: <QuaterFinals approvedTeams={approvedTeams} leagueId={leagueId} setQuaterFinalMatches={setQuaterFinalMatches} quaterFinalsStarted={quaterFinalsStarted} />
        }, {
            key: "6",
            label: "Semi Finals",
            children: <SemiFinals approvedTeams={approvedTeams} semiFinalTeams={semiFinalTeams} setSemiFinalTeams={setSemiFinalTeams} leagueId={leagueId} semiFinalsStarted={semiFinalsStarted} setIsSemiFinalsStarted={setIsSemiFinalsStarted} />
        }, {
            key: "7",
            label: "Finals",
            children: <Finals leagueId={leagueId} finalTeams={finalTeams} isFinalsStarted={isFinalsStarted} setIsFinalsStarted={setIsFinalsStarted} />
        }
    ];


    useEffect(() => {
        fetchLeagues()
    }, [])
    return (
        <div className="w-full h-full flex flex-col items-center">
            <div className="md:w-1/2 w-full mx-auto  p-12">
                <h1 className="text-center text-4xl mb-5 font-extrabold ">Start League</h1>
                <div >
                    <select name="league" id="league" className='w-1/3 border-2 h-12 border-gray-400 rounded' onChange={handleLeagueChange} value={leagueId}>
                        {
                            leagues.length > 0 ? leagues.map((league) => {
                                return <option value={league._id} key={league._id}>{league.leagueName}</option>
                            }) : null
                        }
                    </select>
                </div>
                <div className="w-full  py-4">
                    <h1 className="text-center text-xl mb-5 font-bold">Approve Teams</h1>
                    {
                        LeagueTeams.length > 0 ?
                            <div className="w-full h-full border  rounded-lg shadow-md flex flex-col py-4">
                                <table className="w-full h-full ">
                                    <thead className="h-10">
                                        <tr>
                                            <th>Teams</th>
                                            <th>Status</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody className="h-10">
                                        {
                                            LeagueTeams.map((team, index) => {
                                                return <tr key={team._id} className='h-12 '>
                                                    <td className="text-center w-2/5">{team.team.teamName}</td>
                                                    <td className={`text-center w-1/5 ${team.status === 'Not Approved' ? 'text-red-600' : 'text-green-600'}`}>{team.status}</td>

                                                    <td className=' text-center'>
                                                        {
                                                            team.status === 'Not Approved' ?
                                                                <button className="px-3 py-1 text-white bg-green-600 rounded-md hover:bg-green-800 text-sm disabled:bg-gray-300" disabled={isRegularRoundStarted} onClick={() => handleApproveTeam(index)}>Approve</button>
                                                                :
                                                                <button className="px-3 py-1 text-white bg-red-600 rounded-md hover:bg-red-800 text-sm disabled:bg-gray-300" disabled={isRegularRoundStarted} onClick={() => handleUnapproveTeam(index)}>Unapprove</button>
                                                        }
                                                    </td>
                                                </tr>
                                            })
                                        }
                                    </tbody>
                                </table>

                            </div>
                            :
                            <div className="w-full h-48 border  rounded-lg shadow-md flex justify-center items-center py-4">
                                <h1 className='text-2xl'>No teams to display</h1>
                            </div>
                    }
                </div>
                <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
            {
                approvedTeams.length > 0 ?
                    <div className='w-full px-10'>
                        <Tabs
                            defaultActiveKey={activekey}
                            size={"large"}
                            style={{
                                marginBottom: 32,
                            }}
                            onChange={handleKeyChange}
                            items={tabs}
                        />
                    </div> : null
            }
        </div >
    )
}

export default StartLeague







