import { Table } from 'antd';



function AntDTable({ data, columns, onRowClick }) {


    return (
        <Table dataSource={data} columns={columns} onRow={(record) => ({
            onClick: () => {
                if (onRowClick) {
                    onRowClick(record);
                }
            },
            
            style: onRowClick ? { cursor: 'pointer' } : null,
        })} 
        bordered
        />
    )
}

export default AntDTable