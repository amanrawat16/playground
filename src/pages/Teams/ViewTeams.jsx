import AntDTable from "@/components/AntDTable/AntDTable"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { baseURL, ChangeTeamImage, getAllLeagues, getTeams, updateTeamInfo } from "@/services/api"
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import ReactSelect from 'react-select';
import { IoMdCloudUpload } from "react-icons/io";
import { toast } from "react-toastify"
import { ImSpinner8 } from "react-icons/im"

function ViewTeams() {
    const [modifiedLeaguelist, setModifiedLeagueList] = useState([])
    const [modifiedTeamList, setModifiedTeamList] = useState([])
    const [dialogData, setDialogData] = useState({
        id: "",
        teamName: '',
        image: ""
    })
    const navigate = useNavigate()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmiting, setIsSubmitting] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)

    const fetchTeams = async (leagueId) => {
        setModifiedTeamList([])
        try {
            const response = await getTeams(leagueId)
            if (response.status === 'SUCCESS') {
                const modifiedList = response.data.map((team) => {
                    return {
                        ...team,
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

    const fetchLeagues = async () => {
        try {
            const response = await getAllLeagues()
            if (response.status === "SUCCESS") {
                const modifiedList = response.leagues.map((el) => {
                    return {
                        ...el,
                        label: el.leagueName,
                        value: el._id
                    }
                })
                console.log(modifiedList)
                setModifiedLeagueList(modifiedList)
            }
        } catch (error) {
            console.log(error)
        }
    }


    const handleDialogDataChange = (e) => {
        const { name, value } = e.target;
        setDialogData({ ...dialogData, [name]: value })
    }

    const handleSubmitDialogData = async () => {
        setIsSubmitting(true)
        try {
            const { teamName } = dialogData;
            if (teamName === "") {
                toast.error("Team name is required")
                return
            }
            const response = await updateTeamInfo(dialogData.id, { teamName })
            if (response.status === "SUCCESS") {
                const teamList = modifiedTeamList.map(team => team._id === dialogData.id ? { ...team, teamName } : team)
                setModifiedTeamList(teamList)
                setIsDialogOpen(false)
                toast.success("Team Info updated")
            }
        } catch (error) {
            console.log(error)
            toast.error("Error updating team")
        } finally {
            setIsSubmitting(false)
        }
    }


    const handleOpenDialog = (e, record) => {
        e.stopPropagation()
        setDialogData({
            id: record._id,
            teamName: record.teamName,
            image: record?.teamImage
        })
        setIsDialogOpen(true)
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setDialogData({
            id: "",
            teamName: "",
            image: ''
        })
    }

    const handleImageChange = async (e) => {
        setIsUploadingImage(true)
        const file = e.target.files[0];
        const formdata = new FormData()
        try {
            formdata.append('teamImage', file)
            const response = await ChangeTeamImage(dialogData.id, formdata)
            console.log(response)
            if (response.status === 'SUCCESS') {
                const teamList = modifiedTeamList.map(team => team._id === dialogData.id ? { ...team, teamImage: response.team.teamImage } : team)
                setDialogData({ ...dialogData, image: response.team.teamImage })
                setModifiedTeamList(teamList)
                toast.success("Team Image updated")
            }
        } catch (error) {
            console.log(error)
            toast.error("Error updating team Image")
        } finally {
            setIsUploadingImage(false)
        }
    }

    const columns = [
        {
            title: "Team",
            dataIndex: "teamName",
            align: "center",
            key: "playerName",
            render: (name) => <div>{name}</div>,
            filterDropdown: () => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder={`Search Name`}
                        // value={searchText}
                        // onChange={handleSearch}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                </div>
            ),
        },
        {
            title: "",
            dataIndex: "teamImage",
            align: "text-center",
            key: "_id",
            render: (record) => <div className="flex items-center justify-center">
                <img src={`${baseURL}/uploads/${record?.split('/').pop().split('\\').pop()}`} alt={`${record}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }} className="w-10 h-10 rounded-full" />
            </div>
        },
        {
            title: "Email Id",
            dataIndex: "_id",
            key: "_id",
            align: "center",
            render: (text, record) => <div>
                <p className="text-center">{record?.teamEmail || ''}</p>
            </div>
        },
        {
            title: "Points",
            dataIndex: "pointsScored",
            key: "_id",
            align: "center",
            render: (text) => <div>
                <p className="text-center" >
                    {text}
                </p>
            </div>
        },
        {
            title: "Matches Played",
            dataIndex: "totalMatchesPlayed",
            key: "_id",
            align: "center",
            render: (text) => <div>
                <p className="text-center" >
                    {text}
                </p>
            </div>
        },
        {
            title: "",
            dataIndex: "_id",
            key: "_id",
            align: "center",
            render: (text, record) => <div>
                <p className="text-center" onClick={(e) => {
                    handleOpenDialog(e, record)
                }}>
                    <FaEdit className="h-4 w-4 cursor-pointer text-orange-600" />
                </p>
            </div>
        },
    ]

    useEffect(() => {
        fetchLeagues()
    }, [])

    return (
        <>
            <Dialog open={isDialogOpen} >
                <DialogContent onClick={handleDialogClose}>
                    <DialogHeader>
                        <DialogTitle></DialogTitle>
                        <DialogDescription>
                            <div>
                                <div>
                                    <Label >Team Name</Label>
                                    <Input className="my-1" value={dialogData.teamName} name="teamName" onChange={handleDialogDataChange} />
                                </div>
                                <div className="my-5 flex items-center">
                                    {
                                        console.log(dialogData.image.split('/').pop().split('\\').pop())
                                    }
                                    <img src={`${baseURL}/uploads/${dialogData.image?.split('/').pop().split('\\').pop()}`} alt={`${dialogData?.image}`}
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }} className="w-20 h-20 rounded-full" />
                                    <Button
                                        className="ml-4 flex items-center bg-orange-600"
                                        onClick={() => document.getElementById('fileInput').click()}
                                        disabled={isUploadingImage}
                                    >
                                        {
                                            isUploadingImage ?
                                                <>
                                                    <ImSpinner8 className="w-4 h-4 mr-1 animate-spin" />Uploading Image
                                                </> :
                                                <>
                                                    <IoMdCloudUpload className="w-6 h-6 mr-1" /> Upload Image
                                                </>
                                        }
                                    </Button>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImageChange}
                                    />
                                </div>
                                <div className="flex justify-end py-6">
                                    <Button className="mr-6 bg-orange-600" onClick={handleDialogClose}>Cancel</Button>
                                    <Button className=" disabled:bg-slate-500 bg-orange-600" disabled={isSubmiting} onClick={handleSubmitDialogData}>Submit</Button>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <div className="w-full h-auto p-20 flex flex-col  items-center">
                <div className="w-3/4 flex flex-col ">
                    <div className="    mb-20 flex  items-center  ">
                        <div className="w-[28%]">
                            <Select onValueChange={(val) => {
                                setDialogData({ ...dialogData, league: val.label })
                                fetchTeams(val)
                            }}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select League" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        modifiedLeaguelist.length > 0 && modifiedLeaguelist.map((val, index) => {
                                            return <SelectItem key={index} value={val._id}>{val.leagueName}</SelectItem>
                                        })
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <AntDTable
                        columns={columns}
                        data={modifiedTeamList}
                    />
                </div>

            </div>
        </>
    )
}

export default ViewTeams