import React, { useEffect, useRef, useState } from "react";
import { Footer } from "@/layouts/footer";
import { useTheme } from "@/hooks/use-theme";
import toast from "react-hot-toast";
import { PencilLine, ShieldOff, SquareX } from "lucide-react";

const User = () => {
    const { theme } = useTheme();
    const [users, setUsers] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [userData, setuserData] = useState([]);
    const [formData, setFormData] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const itemsPerPage = 6;
    
    const URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

    const statusInputRef = useRef();

    // Fetch Users from the backend
    const fetchUsers = async () => {
        try {
            const response = await fetch(`${URL}/api/user`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    

    const handleEditForm = (user) => {
        setFormData(user);
        setShowForm(true);
        setTimeout(() => {
            statusInputRef.current.value = user.status;
        }, 100);
    };
    
    const handleCloseForm = () => {
        setShowForm(false);
        setFormData(null); 
    };



    const submitFormHandler = async (e) => {
            e.preventDefault();

            const newUser = {
                status: statusInputRef.current.value,
            };
           
            try {
                const response = await fetch(`${URL}/api/user/${formData.id}`,
                    {
                        method:"PUT" ,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newUser),
                    }
                );
    
                if (!response.ok) throw new Error("Failed to save User");
                
                await fetchUsers();
    
                handleCloseForm();
                console.log( "user updated successfully");
                toast.success( "User updated");
                
            } catch (error) {
                console.error("Error saving user:", error);
                toast.error("Error saving user");
            }
        };
    
        //  Handle Editing
       
    

    const deactiveUser = async (id) => {
            console.log("User with id:", id);
           
            try {
                const response = await fetch(`${URL}/api/user/deactive/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                });
        
                if (!response.ok) throw new Error("Failed to deactivate");
        
                setuserData((prevData) => 
                    prevData.map((user) =>
                        user.id === id ? { ...user, status: "Deactive" } : user
                    )
                );
        
                console.log("user deactivated successfully!");
                toast.success("user deactivated successfully");
                await fetchUsers();
    
            } catch (error) {
                console.error("Error deactivating user:", error);
                toast.error("Error deactivating user");
            }
        };
    
      

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
        setCurrentPage(1);
    };
    
    useEffect(() => {
        setCurrentPage(1);
        if (selectedStatus === "all") {
            setFilteredUsers(users);
        } else {
            setFilteredUsers(users.filter(user => user.status === selectedStatus));
        }
    }, [selectedStatus, users]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    
    const nextPage = () => {
        if (currentPage < Math.ceil(filteredUsers.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex flex-row justify-between">
                <h1 className="title">Users</h1>
            </div>

            <div className="flex flex-col justify-between">
                <select onChange={handleStatusChange} value={selectedStatus} className="w-[150px] h-[30px] rounded-md outline outline-2 outline-slate-200 dark:bg-slate-800 dark:text-white">
                    <option value="all">All</option>
                    <option value="Active">Active</option>
                    <option value="Deactive">Deactive</option>
                </select>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <div className="relative h-[500px] w-full overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="table">
                            <thead className="table-header">
                                <tr className="table-row">
                                    <th className="table-head">ID</th>
                                    <th className="table-head">Name</th>
                                    <th className="table-head">Email</th>
                                    <th className="table-head">Mobile No</th>
                                    <th className="table-head">Status</th>
                                    <th className="table-head">Action</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {currentItems.length > 0 ? (
                                    currentItems.map((user, index) => (
                                        <tr key={user.id} className="table-row">
                                            <td className="table-cell">{indexOfFirstItem + index + 1}</td>
                                            <td className="table-cell">{user.name}</td>
                                            <td className="table-cell">{user.email}</td>
                                            <td className="table-cell">{user.mobileno}</td>
                                            <td className="table-cell">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit
                                                    ${user.status === "Active" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                    <div className="flex items-center gap-x-4">
                                                        <button className="flex justify-center items-center text-xs text-white bg-blue-500 w-[50px] h-full rounded dark:text-white" onClick={() => handleEditForm(user)}>
                                                            <PencilLine size={20} />
                                                        </button>
                                                        <button className="flex justify-center items-center text-xs text-white bg-red-500 w-[50px] h-full rounded dark:text-white" onClick={() => deactiveUser(user.id)}>
                                                            <ShieldOff  size={20} />
                                                        </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-4">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="flex lg:justify-end justify-start gap-4 mt-5">
                            <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded-md">Previous</button>
                            <button onClick={nextPage} disabled={currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)} className="px-4 py-2 bg-gray-300 rounded-md">Next</button>
                        </div>
                    </div>
                </div>
            </div>


            {showForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg relative w-96">
                        <button onClick={handleCloseForm} className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-600">
                            <SquareX className="mb-3" />
                        </button>
                        <form onSubmit={submitFormHandler} className="space-y-4 mt-3">
                            <select ref={statusInputRef} className="w-full p-2 border rounded-md" required defaultValue={formData?.status || "N/A"}>
                                <option value="Active">Active</option>
                                <option value="Deactive">Deactive</option>
                            </select>
                            <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md">
                                {"Update User"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default User;
