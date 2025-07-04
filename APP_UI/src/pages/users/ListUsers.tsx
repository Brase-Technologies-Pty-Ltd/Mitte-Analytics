import { useEffect, useState } from 'react'
import { deleteOneUser, getusers } from '../../services/userService';
import { User } from '../../models/user.model';
import MitteDataTable from '../../components/smartDataTable/MitteDataTable';
import { ColumnDef } from '@tanstack/react-table';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import MitteButton from '../../components/mitteButton/MitteButton';
import { FaPlusCircle } from "react-icons/fa";
import MitteModal from '../../components/mitte-Modal/MitteModel';
import EditUser from './EditUser';
import AddUser from './AddUser';
import { toast } from 'react-toastify';

interface CustomColumnMeta {
    sortable?: boolean;
    className?: string;
}

type CustomColumnDef<TData> = ColumnDef<TData, any> & {
    meta?: CustomColumnMeta;
};

const ListUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [openUserModal] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [openEditModel, setOpenEditModel] = useState<boolean>(false);
    const [openAddUserModal, setOpenAddUserModal] = useState<boolean>(false);

    useEffect(() => {
        fetchUser();
    }, [openUserModal, openEditModel, openAddUserModal]);

    const fetchUser = async () => {
        try {
            const Users = await getusers();
            if (Users) {
                setUsers(Users);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const userData: CustomColumnDef<any>[] = [
        {
            accessorKey: 'user_name',
            cell: ({ row }) => {
                return <span>{row?.original?.user_name}</span>;
            },
            header: () => 'User Name',
            meta: { className: 'center' },
            filterFn: 'includesString',
        },
        {
            accessorKey: 'first_name',
            cell: ({ row }) => {
                return <span>{row?.original?.first_name}</span>;
            },
            header: () => 'First Name',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'last_name',
            cell: ({ row }) => {
                return <span>{row?.original?.last_name}</span>;
            },
            header: () => 'Last Name',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'email',
            cell: ({ row }) => {
                return <span>{row?.original?.email}</span>;
            },
            header: () => 'Email',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'phone_number',
            cell: ({ row }) => {
                return <span>{row?.original?.phone_number}</span>;
            },
            header: () => 'Mobile Number',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'active',
            cell: ({ row }) => {
                return <span className={row?.original?.active === true ? ' px-3 py-1 border rounded-pill chip-success' : ' px-3 py-1 border rounded-pill chip-danger'}>{row?.original?.active === true ? 'Active' : 'Inactive'}</span>;
            },
            header: () => 'Status',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'actions',
            cell: ({ row }) => (
                <span>
                    <FaEdit style={{ cursor: 'pointer', color: 'blue' }}
                        onClick={() => {
                            setSelectedUser(row.original);
                            setOpenEditModel(true);
                        }}
                    />
                    <FaTrashAlt style={{ cursor: 'pointer', color: 'red', marginLeft: '10px' }} onClick={() => deleteUser(row.original.id)} />
                </span>
            ),
            header: 'Actions',
            meta: {
                className: 'center',
            },
        },
    ];

    const deleteUser = async (id: number) => {
        try {
            await deleteOneUser(id);
            toast.success("you have DELETED selected User !!!");
            fetchUser();
        } catch (error) {
            console.error(error);
            toast.error("This user is assigned to Role");
        }
    };

    return (
        <>
            <div className='container-fluid'>
                <div className='row d-flex justify-content-between mb-3'>
                    <div className='col'><h4 className='text-muted'>Users</h4></div>
                    <div className='col'><MitteButton icon={<FaPlusCircle />} onClick={() => setOpenAddUserModal(true)} variant='primary' className='float-end mitte-button-primary'>ADD USER</MitteButton></div>
                </div>
                <MitteDataTable
                    data={users}
                    className='table table-striped'
                    totalRows={users.length}
                    hidePagination={false}
                    columns={userData}
                    noDataMessage='No Users found'
                />
            </div>
            {
                openEditModel && (
                    <MitteModal
                        onClose={() => setOpenEditModel(false)}
                        show={openEditModel}
                        headerText="EDIT USER"
                        size='lg'
                        handleHeaderBtn={() => setOpenEditModel(false)}
                        modalBodyComponent={<EditUser users={selectedUser} onClose={() => setOpenEditModel(false)} />}
                    />

                )
            }
            {
                openAddUserModal && (
                    <MitteModal
                        onClose={() => setOpenAddUserModal(false)}
                        show={openAddUserModal}
                        headerText="ADD USER"
                        size='lg'
                        handleHeaderBtn={() => setOpenAddUserModal(false)}
                        modalBodyComponent={<AddUser handleClose={() => setOpenAddUserModal(false)} users={users} />}
                    />
                )
            }
        </>
    )
}

export default ListUsers
