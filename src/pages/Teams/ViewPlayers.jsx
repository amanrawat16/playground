import { useState } from "react";
import { useEffect } from "react";
import Select from "react-select";
import { getTeamPlayers, getTeams } from "../../services/api";
import AntDTable from "../../components/AntDTable/AntDTable";
import { useNavigate } from "react-router-dom";
// ----------------------------------------------------------------


export const ViewPlayers = () => {
    const [teamsList, setTeamsList] = useState([]);
    const [modifiedTeamList, setModifiedTeamList] = useState([])
    const [players, setPlayers] = useState([])
    const [tablePlayers, setTablePlayers] = useState([])
    const navigate = useNavigate()
    const fetchTeams = async () => {
        try {
            const response = await getTeams()
            if (response.status === 'SUCCESS') {
                setTeamsList(response.data)

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
            if (response.status === 'SUCCESS') {
                setPlayers(response.data)
                setTablePlayers(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }


    const columns = [
        {
            title: "Name",
            dataIndex: "playerName",
            align: "center",
            key: "_id",
            render: (name) => <div>
                <p className="text-center">{name}</p>
            </div>
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
        }

    ]

    const handleSearchPlayer = (e) => {
        let value = e.target.value;
        value = value.trim();
        if (value === '') {
            return;
        }
        const filteredPlayers = players.filter((player) => player.playerName.toLowerCase().includes(e.target.value.toLowerCase()))
        setTablePlayers(filteredPlayers)
    }

    useEffect(() => {
        fetchTeams()
    }, [])


    return (
        <div className="w-full h-auto p-20 flex flex-col  items-center">
            <div className="w-3/4 flex flex-col ">
                <div className="    mb-20 flex justify-between   ">
                    <div className=" w-1/3">
                        <label className=" italic">Select team</label>
                        <Select
                            options={modifiedTeamList}
                            onChange={(val) => {
                                handlefetchTeamPlayers(val.value);
                            }}
                            placeholder="Please select the team..."
                        />
                    </div>
                    <div className="w-1/3">
                        {players.length > 0 &&
                            <>
                                <label className="italic">Search Player</label>
                                <input type="text"
                                    placeholder="Team"
                                    className="border w-full h-10 rounded px-2"
                                    onChange={handleSearchPlayer} />
                            </>
                        }
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
    )
}
