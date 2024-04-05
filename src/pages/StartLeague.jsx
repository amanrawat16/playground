
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
import { BeatLoader } from 'react-spinners'
import AntDTable from "../components/AntDTable/AntDTable";
import { CiSearch } from "react-icons/ci";

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
    const [tableTeams, setTableTeams] = useState([])
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
    const [quaterFinalMatchesStarted, setQuaterFinalMatchesStarted] = useState(false)
    const [semiFinalTeams, setSemiFinalTeams] = useState([])
    const [semiFinalsStarted, setIsSemiFinalsStarted] = useState(false)
    const [finalTeams, setFinalTeams] = useState([])
    const [isFinalsStarted, setIsFinalsStarted] = useState(false)
    const [winnerTeam, setWinnerTeam] = useState('')

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
        setLeagueTeams([])
        setTableTeams([])
        try {
            const response = await viewLeagueFixture(leagueId)
            if (response.status === 'SUCCESS') {
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
                setWinnerTeam(response?.leagueFixture?.Winner)
                setTableTeams(teams)
                setQuaterFinalMatchesStarted(response?.leagueFixture?.quaterFinalMatchesStarted)
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

        const updatedTeams = tableTeams.map((team, index) => {
            if (index === i) {
                return { ...team, status: "Approved" }
            }
            return team;
        })
        setLeagueTeams(updatedTeams)
        setTableTeams(updatedTeams)
        setApprovedTeams([...approvedTeams, { ...team, status: "Approved" }])
    };

    const handleUnapproveTeam = (i) => {

        const team = LeagueTeams[i]

        const teamIndex = LeagueTeams.findIndex(el => el._id === team._id)
        const updateTeam = LeagueTeams[teamIndex]
        setApprovedTeams(approvedTeams.filter((team) => team._id !== updateTeam._id))
        const updatedTeamStatus = LeagueTeams.map((team) => {
            if (team._id === updateTeam._id) {
                return { ...team, status: "Not Approved" };
            }
            return team;
        });
        setLeagueTeams(updatedTeamStatus);
        setTableTeams(updatedTeamStatus)
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
            children: <StartRegularRounds handleNextComponent={handleNextComponent} approvedTeams={approvedTeams} setApprovedTeams={setApprovedTeams} handleUnapproveTeam={handleUnapproveTeam} isRegularRoundStarted={isRegularRoundStarted} setIsRegularRoundStarted={setIsRegularRoundStarted} handleStartRegularRounds={handleStartRegularRounds} LeagueTeams={LeagueTeams} />,
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
            children: <QuaterFinals approvedTeams={approvedTeams} leagueId={leagueId} setQuaterFinalMatches={setQuaterFinalMatches} semiFinalsStarted={semiFinalsStarted} setIsSemiFinalsStarted={setIsSemiFinalsStarted} quaterFinalMatchesStarted={quaterFinalMatchesStarted} setQuaterFinalMatchesStarted={setQuaterFinalMatchesStarted} />
        }, {
            key: "6",
            label: "Semi Finals",
            children: <SemiFinals approvedTeams={approvedTeams} semiFinalTeams={semiFinalTeams} setSemiFinalTeams={setSemiFinalTeams} leagueId={leagueId} semiFinalsStarted={semiFinalsStarted} setIsSemiFinalsStarted={setIsSemiFinalsStarted} />
        }, {
            key: "7",
            label: "Finals",
            children: <Finals leagueId={leagueId} finalTeams={finalTeams} isFinalsStarted={isFinalsStarted} setIsFinalsStarted={setIsFinalsStarted} winnerTeam={winnerTeam} />
        }
    ];

    const handleSearchTeam = (e) => {
        let team = e.target.value;
        team = team.trim()
        if (team === '') {
            if (LeagueTeams.length === tableTeams.length) {
                return;
            }
            setTableTeams(LeagueTeams)
            return;
        }
        const filteredData = LeagueTeams.filter(item =>
            item.team.teamName.toLowerCase().includes(team.toLowerCase())
        );
        setTableTeams(filteredData)
    }


    useEffect(() => {
        fetchLeagues()
    }, [])
    return (
        <div className="w-full h-full flex flex-col items-center">
            <h1 className="text-center text-4xl mb-5 font-bold my-10">Start League</h1>
            <div className="md:w-2/3 sm:w-5/6 mx-auto  border rounded-lg shadow-lg px-12 py-5 mb-10">

                <div className="flex justify-between">
                    <div className="w-1/3">
                        <label htmlFor="league" className="text-sm font-medium">Select League</label>
                        <select name="league" id="league" className='w-full border h-10 border-gray-300 rounded' onChange={handleLeagueChange} value={leagueId}>
                            {
                                leagues.length > 0 ? leagues.map((league) => {
                                    return <option value={league._id} key={league._id}>{league.leagueName}</option>
                                }) : null
                            }
                        </select>

                    </div>
                    <div className="w-1/3 flex items-end relative">
                        {
                            LeagueTeams.length > 0 && <>
                                <input type="text" className="w-full border h-10 rounded border-gray-300 px-2" name="team" placeholder="Search team" onChange={handleSearchTeam} />
                                <CiSearch className=" absolute right-2 top-[60%] text-gray-400 font-bold" />
                            </>
                        }
                    </div>
                </div>
                <div className="w-full  py-4">

                    {
                        LeagueTeams.length > 0 ?
                            <>
                                <h1 className="text-center text-xl mb-5 font-bold">Approve Teams</h1>
                                <AntDTable data={tableTeams} handleApproveTeam={handleApproveTeam} handleUnapproveTeam={handleUnapproveTeam} isRegularRoundStarted={isRegularRoundStarted} />
                            </>
                            :
                            <div className="w-full h-48   rounded-lg  flex justify-center items-center py-4">
                                <BeatLoader color="#36d7b7" />
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
                approvedTeams.length > 0 &&
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
                </div>
            }
        </div >
    )
}

export default StartLeague







