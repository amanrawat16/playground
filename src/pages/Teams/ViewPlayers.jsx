import { useState } from "react";
import { useEffect } from "react";
import ReactSelect from "react-select";
import AntDTable from "../../components/AntDTable/AntDTable";
import { useNavigate } from "react-router-dom";
import { getAllLeagues, getTeamPlayers, getTeams, PlayerDetailUpdate } from "../../services/api";
import { FaChevronCircleRight, FaEdit } from "react-icons/fa";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import { ImSpinner3 } from "react-icons/im";
// ----------------------------------------------------------------


export const ViewPlayers = () => {
    const [modifiedLeaguelist, setModifiedLeagueList] = useState([])
    const [selectedLeague, setSelectedLeague] = useState('')
    const [modifiedTeamList, setModifiedTeamList] = useState([])
    const [players, setPlayers] = useState([])
    const [tablePlayers, setTablePlayers] = useState([])
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogData, setDialogData] = useState({
        id: "",
        league: "",
        team: "",
        name: "",
        role: '',
        emailId: '',
        position: '',
        jerseyNumber: ""
    })
    const [isSubmiting, setIsSubmitting] = useState(false)


    const fetchLeagues = async () => {
        try {
            const response = await getAllLeagues()
            if (response.status === "SUCCESS") {
                const modifiedList = response.leagues.map((el) => {
                    return {
                        label: el.leagueName,
                        value: el._id
                    }
                })
                setModifiedLeagueList(modifiedList)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchTeams = async (leagueId) => {
        setModifiedTeamList([])
        try {
            const response = await getTeams(leagueId)
            if (response.status === 'SUCCESS') {
                const modifiedList = response.data.map((team) => {
                    return {
                        label: team.teamName,
                        value: team._id
                    }
                })
                setModifiedTeamList(modifiedList)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handlefetchTeamPlayers = async (teamId) => {
        try {
            const response = await getTeamPlayers(teamId)
            console.log(response)
            if (response.status === 'SUCCESS') {
                setPlayers(response.data)
                setTablePlayers(response.data)
                return true;
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleSearch = (e) => {
        const { value } = e.target;
        setSearchText(value);
        const filteredPlayers = tablePlayers.filter(player =>
            player.playerName.toLowerCase().includes(value.toLowerCase())
        );
        setTablePlayers(filteredPlayers);
    };

    const handleOpenDialog = (e, record) => {
        e.stopPropagation()
        setDialogData({
            ...dialogData,
            id: record._id,
            team: record.teamId,
            league: selectedLeague,
            name: record.playerName,
            role: record.role,
            emailId: record.email,
            position: record.position,
            jerseyNumber: record.jerseyNumber,
        })
        setIsDialogOpen(true)
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setDialogData({
            id: "",
            league: "",
            team: "",
            name: "",
            role: '',
            emailId: '',
            position: '',
            jerseyNumber: ""
        })
    }

    const handleDialogDataChange = (e) => {
        const { name, value } = e.target;
        setDialogData({ ...dialogData, [name]: value })
    }


    const columns = [
        {
            title: "Name",
            dataIndex: "playerName",
            align: "center",
            key: "playerName",
            render: (name) => <div>{name}</div>,
            filterDropdown: () => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder={`Search Name`}
                        value={searchText}
                        onChange={handleSearch}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                </div>
            ),
        },
        {
            title: "Role",
            dataIndex: "role",
            align: "center",
            key: "_id",
            render: (role) => <div>
                <p className="text-center">{role}</p>
            </div>
        }, {
            title: "Email Id",
            dataIndex: "email",
            key: "_id",
            align: "center",
            render: (email) => <div>
                <p className="text-center">{email}</p>
            </div>
        },
        {
            title: "Position",
            dataIndex: "position",
            key: "_id",
            align: "center",
            render: (position) => <div>
                <p className="text-center">{position}</p>
            </div>
        },
        {
            title: "Jersey No.",
            dataIndex: "jerseyNumber",
            key: "_id",
            align: "center",
            render: (jerseyNumber) => <div>
                <p className="text-center">{jerseyNumber}</p>
            </div>
        },
        {
            title: "",
            dataIndex: "jerseyNumber",
            key: "_id",
            align: "center",
            render: (text, record) => <div>
                <p className="text-center" onClick={(e) => {
                    handleOpenDialog(e, record)
                }}>
                    <FaEdit className="h-4 w-4 cursor-pointer text-orange-600" />
                </p>
            </div>
        }
    ]

    const handleSubmitDialogData = async () => {
        setIsSubmitting(true)
        const formData = {
            playerName: dialogData.name,
            position: dialogData.position,
            email: dialogData.emailId,
            role: dialogData.role,
            jerseyNumber: dialogData.jerseyNumber,
        }
        try {
            const response = await PlayerDetailUpdate(dialogData.id, formData)
            if (response.status === 'SUCCESS') {
                const response = await handlefetchTeamPlayers(dialogData.team)
                if (response) {
                    handleDialogClose()
                    toast.success("Player Details updated")
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRoleValueChange = (e) => {
        setDialogData({ ...dialogData, role: e })
    }

    const handlePositionChange = (e) => {
        setDialogData({ ...dialogData, position: e })
    }

    // const handleSearchPlayer = (e) => {
    //     let value = e.target.value;
    //     value = value.trim();
    //     if (value === '') {
    //         return;
    //     }
    //     const filteredPlayers = players.filter((player) => player.playerName.toLowerCase().includes(e.target.value.toLowerCase()))
    //     setTablePlayers(filteredPlayers)
    // }

    useEffect(() => {
        fetchLeagues()
    }, [])


    return (
        <>
            <Dialog open={isDialogOpen} >
                <DialogContent onClick={handleDialogClose}>
                    <DialogHeader>
                        <DialogDescription>
                            <div>
                                <div>
                                    <Label >Player Name</Label>
                                    <Input className="my-1" value={dialogData.name} name="name" onChange={handleDialogDataChange} />
                                </div>
                                <div>
                                    <Label >Role</Label>
                                    <Select value={dialogData.role} onValueChange={handleRoleValueChange}>
                                        <SelectTrigger className="w-full my-1">
                                            <SelectValue placeholder="" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PLAYER">Player</SelectItem>
                                            <SelectItem value="STAFF">Staff</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label >Email Id</Label>
                                    <Input className="my-1" value={dialogData.emailId} name="emailId" onChange={handleDialogDataChange} />
                                </div>
                                <div>
                                    <Label >Position</Label>
                                    <Select value={dialogData.position} onValueChange={handlePositionChange}>
                                        <SelectTrigger className="w-full my-1">
                                            <SelectValue placeholder="" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Quarterback">Quaterback</SelectItem>
                                            <SelectItem value="Rusher">Rusher</SelectItem>
                                            <SelectItem value="Offensive Player">Offensive Player</SelectItem>
                                            <SelectItem value="Defensive Player">Defensive Player</SelectItem>
                                            <SelectItem value="None">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label >Jersey Number</Label>
                                    <Input className="my-1" type="number" value={dialogData.jerseyNumber} name="jerseyNumber" onChange={handleDialogDataChange} min={1} />
                                </div>
                                <div className="flex justify-end py-6">
                                    <Button className="mr-6 bg-orange-600" onClick={handleDialogClose}>Cancel</Button>
                                    <Button className=" disabled:bg-gray-500 flex items-center justify-center bg-orange-600" onClick={handleSubmitDialogData} disabled={isSubmiting}>Submit
                                        <>
                                            {
                                                isSubmiting ? <ImSpinner3 className="h-4 w-4 animate-spin ml-2" /> : <FaChevronCircleRight className="h-4 w-4 ml-2" />
                                            }
                                        </>
                                    </Button>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <div className="w-full h-auto p-20 flex flex-col  items-center">
                <div className="w-3/4 flex flex-col ">
                    <div className="my-4">
                        <Label className="text-md text-gray-500">To view players of a team first select a league and then a team</Label>
                    </div>
                    <div className="    mb-20 flex  items-center  ">
                        <div className="w-[28%]">
                            <Select className='w-[200px]' onValueChange={(val) => {
                                setSelectedLeague(val)
                                setDialogData({ ...dialogData, league: val })
                                fetchTeams(val)
                            }}  >
                                <SelectTrigger >
                                    <SelectValue placeholder="Select a League" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Leagues</SelectLabel>
                                        {
                                            modifiedLeaguelist.length > 0 && modifiedLeaguelist.map((league) => {
                                                return < SelectItem value={league.value} key={league.value}>{league.label}</SelectItem>
                                            })
                                        }
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-[28%] ml-8">
                            <Select className='w-[200px]' disabled={!selectedLeague} onValueChange={(val) => {
                                setDialogData({ ...dialogData, team: val })
                                handlefetchTeamPlayers(val);
                            }}  >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Please select the team..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Teams</SelectLabel>
                                        {
                                            modifiedTeamList.length > 0 && modifiedTeamList.map((team) => {
                                                return < SelectItem value={team.value} key={team.value}>{team.label}</SelectItem>
                                            })
                                        }
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <AntDTable columns={columns}
                        data={tablePlayers}
                        onRowClick={(record) => {
                            navigate(`/dashboard/playerProfile/${record._id}`);
                        }}
                    />
                </div>

            </div>
        </>
    )
}
