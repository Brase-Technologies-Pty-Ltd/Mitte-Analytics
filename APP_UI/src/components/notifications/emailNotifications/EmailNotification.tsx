import { ColumnDef } from '@tanstack/react-table';
import MitteDataTable from '../../smartDataTable/MitteDataTable';


interface EmailTableProps {
    emailType: number | null;
    onClose: () => void;
    data?: any;
  }
interface CustomColumnMeta {
    sortable?: boolean;
    className?: string;
}

type CustomColumnDef<TData> = ColumnDef<TData, any> & {
    meta?: CustomColumnMeta;
};
const EmailTable: React.FC<EmailTableProps> = ({
    emailType,
    data,
  }) => {
    const emailData =    data.filter((item: any) => item.alertMode === emailType) || [];
   
    const notificationsColumns: CustomColumnDef<any>[] = [
        {
            accessorKey: 'notificationType',
            cell: ({ row }) => {
                return <span>{row?.original?.notificationType}</span>;
            },
            header: () => 'Notification',
            filterFn: 'includesString',
        },
        {
            accessorKey: 'message',
            cell: ({ row }) => {
                return <span>{row?.original?.message}</span>;
            },
            header: () => 'Message',
            filterFn: 'includesString',
        },
       
    ];
    return (
        <div className='container-fluid'>
            <div className="table-responsive">
                <MitteDataTable
                    data={emailData}
                    className='table table-striped'
                    totalRows={emailData?.length}
                    hidePagination={false}
                    columns={notificationsColumns}
                />
            </div>
        </div>
    )
}

export default EmailTable