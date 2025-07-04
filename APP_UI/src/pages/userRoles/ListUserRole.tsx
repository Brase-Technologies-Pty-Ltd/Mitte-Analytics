
import { useEffect, useState } from 'react';
import { getUserRoleData } from '../../services/roleUser.svc';
import { FaEdit } from 'react-icons/fa';
import MitteDataTable from '../../components/smartDataTable/MitteDataTable';
import { ColumnDef } from '@tanstack/react-table';
import MitteButton from '../../components/mitteButton/MitteButton';
import { User } from '../../models/user.model';
import { FaPlusCircle } from 'react-icons/fa';
import EditUserRole from './EditUserRole';
import MitteModal from '../../components/mitte-Modal/MitteModel';
import AddUserRole from './AddUserRole';
import { toast } from 'react-toastify';

interface CustomColumnMeta {
    sortable?: boolean;
    className?: string;
}

type CustomColumnDef<TData> = ColumnDef<TData, any> & {
    meta?: CustomColumnMeta;
};

const ListUserRole = () => {
    const [userRoles, setUserRoles] = useState<User[]>([]);
    const [openUserRoleModal] = useState<boolean>(false);
    const [selectedUserRole, setSelectedUserRole] = useState<User | null>(null);
    const [openEditModel, setOpenEditModel] = useState<boolean>(false);
    const [openAddModel, setOpenAddModal] = useState<boolean>(false);

    useEffect(() => {
        if (!openUserRoleModal) {
            fetchRoles();
        }
    }, [openUserRoleModal, openEditModel, openAddModel]);

    const fetchRoles = async () => {
        try {
            const roleList = await getUserRoleData();
            if (roleList) {
                setUserRoles(roleList);
            }
        } catch (error) {
            toast.error("Error fetching user roles");
        }
    };



    const userRoleColumns: CustomColumnDef<any>[] = [
        {
            accessorKey: "role",
            cell: ({ row }) => <span>{row.original.role?.name}</span>,
            header: () => 'Role',
            meta: { className: 'center' },
        },
        {
            accessorKey: "user",
            cell: ({ row }) => <span>{row.original.user?.user_name}</span>,
            header: () => 'User',
            meta: { className: 'center' },
        },
        {
            accessorKey: "imprest",
            cell: ({ row }) => <span>{row.original.imprest?.name}</span>,
            header: () => 'Imprest',
            meta: { className: 'center' },
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <span>
                    <FaEdit
                        style={{ cursor: 'pointer', color: 'blue' }}
                        onClick={() => {
                            setSelectedUserRole(row.original);
                            setOpenEditModel(true);
                        }}
                    />
                </span>
            ),
            meta: { className: 'center' },
        }
    ];
    return (
        <>
            <div className='container-fluid'>
                <div className='row d-flex justify-content-between mb-3'>
                    <div className='col'>
                        <h4 className='text-muted'>Assigned Roles</h4>
                    </div>
                    <div className='col'>
                        <MitteButton icon={<FaPlusCircle />} variant='primary' className='float-end mitte-button-primary' onClick={() => setOpenAddModal(true)}>
                            ASSIGN ROLE
                        </MitteButton>
                    </div>
                </div>

                <MitteDataTable
                    data={userRoles}
                    className='table table-striped'
                    totalRows={userRoles.length}
                    hidePagination={false}
                    columns={userRoleColumns}
                    noDataMessage="No User Roles Found"
                />
            </div>

            {openEditModel && selectedUserRole && (
                <MitteModal
                    onClose={() => setOpenEditModel(false)}
                    show={openEditModel}
                    headerText="EDIT ROLE ASSIGNMENT"
                    size='lg'
                    handleHeaderBtn={() => setOpenEditModel(false)}
                    modalBodyComponent={<EditUserRole id={selectedUserRole.id} handleClose={() => setOpenEditModel(false)} />}
                />
            )}

            {openAddModel && (
                <MitteModal
                    onClose={() => setOpenAddModal(false)}
                    show={openAddModel}
                    headerText="ASSIGN NEW ROLE"
                    size='lg'
                    handleHeaderBtn={() => setOpenAddModal(false)}
                    modalBodyComponent={<AddUserRole handleClose={() => setOpenAddModal(false)} />}
                />
            )}
        </>
    );
};

export default ListUserRole;
