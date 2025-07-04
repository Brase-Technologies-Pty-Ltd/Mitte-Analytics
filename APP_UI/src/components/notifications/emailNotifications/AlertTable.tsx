import { ColumnDef } from '@tanstack/react-table';
import MitteDataTable from '../../smartDataTable/MitteDataTable';

interface CustomColumnMeta {
    sortable?: boolean;
    className?: string;
}

type CustomColumnDef<TData> = ColumnDef<TData, any> & {
    meta?: CustomColumnMeta;
};
interface AlertsProps {
    onClose: () => void;
    data?: any;
    alertType?: any;
    camera_serialNo?: any;
  }
  
  const AlertsTable: React.FC<AlertsProps> = ({
    alertType,
    data,
    camera_serialNo,
  }) => {
    const alertData =
    alertType === "motion_alert"
      ? data.filter((item: any) => item.alertTypeId === alertType)
      : data.filter((item: any) => item.alertTypeId !== "motion_alert") || [];

  const cameraSerialNumbers =
    camera_serialNo && camera_serialNo.trim() !== ""
      ? camera_serialNo.split(",")
      : [];
  const filteredData = alertData.filter((obj: { deviceSerial: any }) =>
    cameraSerialNumbers.includes(obj.deviceSerial)
  );

  filteredData.forEach((obj: any) => console.log(obj));
   
    const columns: CustomColumnDef<any>[] = [
        {
            accessorKey: 'deviceSerial',
            cell: ({ row }) => {
                return <span>{row?.original?.deviceSerial}</span>;
            },
            header: () => 'Serial No',
            meta: { className: 'center' },
            filterFn: 'includesString',
        },
        {
            accessorKey: 'alertType',
            cell: ({ row }) => {
                return <span>{row?.original?.alertType}</span>;
            },
            header: () => 'Alert Type',
            meta: { className: 'center' },
            filterFn: 'includesString',
        },
        {
            accessorKey: 'alertLevel',
            cell: ({ row }) => {
                return <span>{row?.original?.alertLevel}</span>;
            },
            header: () => 'Level',
            meta: { className: 'center' },
            filterFn: 'includesString',
        },
        {
            accessorKey: 'occurredAt',
            cell: ({ row }) => {
                return <span>{row?.original?.occurredAt}</span>;
            },
            header: () => 'Occured At',
            meta: { className: 'center' },
            filterFn: 'includesString',
        },
       
    ];
    return (
        <>
            <div className="" style={{ padding: "15px" }}>
                <MitteDataTable
                    data={filteredData}
                    className='table table-striped'
                    totalRows={filteredData?.length}
                    hidePagination={false}
                    columns={columns}
                />
            </div>
        </>
    )
}

export default AlertsTable