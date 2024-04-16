import { Table } from 'antd';



function AntDTable({ data, columns, onRowClick }) {
    const customTableStyle = {
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    };

    const getRowClassName = (record, index) => {
        return `colorful-row-${index % 2}`; 
    };

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
            pagination={{
                position: ['bottomCenter'],
                showSizeChanger: true,
                defaultPageSize: 5,
                pageSizeOptions: ['5', '10', '20', '30'],
                showQuickJumper: true,
                style: { padding: '20px 0' }
            }}
            style={customTableStyle}
            rowClassName={getRowClassName}
        />
    )
}

export default AntDTable