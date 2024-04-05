import { Space, Table, Tag } from 'antd';



function AntDTable({ data, handleApproveTeam, handleUnapproveTeam, isRegularRoundStarted  }) {

    const handleApprove = (index) => {
        handleApproveTeam(index)
    };

    const handleUnapprove = (index) => {
        handleUnapproveTeam(index);
    };

    const columns = [
        {
            title: 'Team Name',
            dataIndex: ['team', 'teamName'],
            key: 'teamName',
            align: 'center',
            render: (text) => <a>{text}</a>,

        },
        {
            title: 'Club Name',
            dataIndex:['team','clubId','clubName'],
            key: 'team',
            align: 'center',
            render: (clubName) => clubName ? clubName : '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => (
                <Tag color={status === 'Approved' ? 'green' : 'red'}>{status}</Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => {
                const dataIndex = data.findIndex(item => item._id === record._id);
                return (
                    <Space size="middle" >
                        {
                            record.status === 'Approved' ? (
                                <button
                                    type="primary"
                                    onClick={() => handleUnapprove(dataIndex)}
                                    disabled={isRegularRoundStarted}
                                    className='border border-red-400 px-3 text-red-500 bg-red-100 rounded disabled:bg-slate-200 disabled:border-gray-300
                                    disabled:text-gray-400'
                                >
                                    Reject
                                </button>
                            ) : (
                                <button
                                    type="primary"
                                    onClick={() => handleApprove(dataIndex)}
                                    disabled={isRegularRoundStarted}
                                    className='border border-green-400 px-3 text-green-500 bg-green-100 rounded disabled:bg-slate-200 disabled:border-gray-300
                                    disabled:text-gray-400'
                                >
                                    Approve
                                </button>
                            )
                        }

                    </Space >
                )
            }
            ,
        },
    ];
    return (
        <Table dataSource={data} columns={columns} />
    )
}

export default AntDTable