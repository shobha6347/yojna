import React, { useEffect, useState, useRef } from "react";
import { Footer } from "@/layouts/footer";
import { PencilLine, Plus, ShieldOff, SquareX, Trash } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const Taluka = () => {
    const { theme } = useTheme();
    const [talukaData, setTalukaData] = useState([]); // Store fetched data
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(null); // Stores current form data (for editing)
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [filteredData, setFilteredData] = useState([]); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    // Input Refs
    const engnameRef = useRef();
    const marathinameRef = useRef();
    const pincodeRef = useRef();
    const statusInputRef = useRef();

    
    const  URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
    

    // Fetch taluka data from the backend
    const fetchtaluka = async () => {
        try {
            const response = await fetch(`${URL}/api/taluka`);
            const data = await response.json();
            setTalukaData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchtaluka(); // Load data on component mount
    }, []);

    //  Handle opening and closing the form
    const handleOpenForm = () => {
        setFormData(null); // Clear form data when adding a new taluka
        setShowForm(true);
    };
    
    const handleCloseForm = () => {
        setShowForm(false);
        setFormData(null);
    };

    // Handle form submission (Add/Edit taluka)
    const submitFormHandler = async (e) => {
        e.preventDefault();

        const newtaluka = {
            taluka_name_eng: engnameRef.current.value,
            taluka_name_marathi: marathinameRef.current.value,
            pincode: pincodeRef.current.value,
            status: statusInputRef.current.value,
        };

        try {
            const response = await fetch(
                formData?.taluka_id ? `${URL}/api/taluka/${formData.taluka_id}` : `${URL}/api/new-taluka`,
                {
                    method: formData?.taluka_id ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newtaluka),
                }
            );

            if (!response.ok) throw new Error("Failed to save taluka");

            await fetchtaluka(); // Refresh the list after adding/updating
            handleCloseForm();
            console.log(formData?.taluka_id ? "Taluka updated successfully" : "New Taluka added successfully");
        } catch (error) {
            console.error("Error saving Taluka:", error);   
        }
    };

    //  Handle Editing
    const handleEditForm = (taluka) => {
        setFormData(taluka);
        setShowForm(true);
    };

    // Handle Delete
    const deactivateTaluka = async (id) => {
        console.log("Deactivating taluka with id:", id);
       
        try {
            const response = await fetch(`${URL}/api/taluka/deactive/${id}`, {
             method: "PUT",
             headers : {"Content-Type":"application/json"},
            });

            if (!response.ok){
                 throw new Error("Failed to Deactive");
            }

            setTalukaData((prevData) => 
                prevData.map((taluka) =>
                    taluka.taluka_id === id ? { ...taluka, status: "Deactive" } : taluka
                )
            );
    

            console.log("Taluka deactivatef successfully!");
            await fetchtaluka();
        } catch (error) {
            console.error("Error Deactivating taluka:", error);
        }
    };



    const handleStatusChange = (e) => {
             setSelectedStatus(e.target.value);
             setCurrentPage(1);
        };
        
        useEffect(() => {
            setCurrentPage(1);
            if (selectedStatus === "all") {
                setFilteredData(talukaData);
            } else {
                setFilteredData(talukaData.filter(yojana => yojana.status === selectedStatus));
            }
        }, [selectedStatus, talukaData]);
    
    
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
        
        const nextPage = () => {
            if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
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
                <h1 className="title">Taluka</h1>
                <button className="flex justify-center items-center w-[80px] h-[30px] text-xl font-bold bg-blue-400 text-white rounded-md" onClick={handleOpenForm}>
                    <Plus className="text-xl" /> New
                </button>
            </div>

            <div className="flex flex-col justify-between">
                <select onChange={handleStatusChange} value={selectedStatus} className="w-[150px] h-[30px] rounded-md outline outline-2 outline-slate-200 dark:bg-slate-800 dark:text-white">
                        <option value="all">All</option>
                        <option value="Active">Active</option>
                        <option value="Deactive">Deactive</option>
                 </select>
            </div>

            

            {/* Table to Display taluka Data */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="relative h-[500px] w-full overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="table">
                            <thead className="table-header">
                                <tr className="table-row">
                                    <th className="table-head">ID</th>
                                    <th className="table-head">Taluka</th>
                                    <th className="table-head">तालुका</th>
                                    <th className="table-head">Pincode</th>
                                    <th className="table-head">Status</th>
                                    <th className="table-head">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {currentItems.length > 0 ? (
                                    currentItems.map((taluka, index) => (
                                        <tr key={taluka.taluka_id} className="table-row">
                                            <td className="table-cell">{indexOfFirstItem + index + 1}</td>
                                            <td className="table-cell">{taluka.taluka_name_eng}</td>
                                            <td className="table-cell">{taluka.taluka_name_marathi}</td>
                                            <td className="table-cell">{taluka.pincode}</td>
                                            <td className="table-cell">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit
                                                    ${taluka.status === "Active" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
                                                    {taluka.status}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-x-4">
                                                    <button className="flex justify-center items-center text-xs text-white bg-blue-500 w-[50px] h-full rounded dark:text-white" onClick={() => handleEditForm(taluka)}>
                                                        <PencilLine size={20} />
                                                    </button>
                                                    <button className="flex justify-center items-center text-xs text-white bg-red-500 w-[50px] h-full rounded dark:text-white" onClick={() => deactivateTaluka(taluka.taluka_id)}>
                                                        <ShieldOff size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center p-4">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                        <div className="flex lg:justify-end  justify-start gap-4 ">
                            <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded-md">Previous</button>
                            <button onClick={nextPage} disabled={currentPage >= Math.ceil(filteredData.length / itemsPerPage)} className="px-4 py-2 bg-gray-300 rounded-md">Next</button>
                        </div>
                </div>
            </div>

            {/* Form Modal for Adding/Editing */}
            {showForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg relative w-96">
                        <button onClick={handleCloseForm} className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-600">
                            <SquareX className="mb-3" />
                        </button>
                        <form onSubmit={submitFormHandler} className="space-y-4 mt-3">
                            <input ref={engnameRef} type="text" placeholder="New Taluka Name" required className="w-full p-2 border rounded-md" defaultValue={formData?.taluka_name_eng|| ""} />
                            <input ref={marathinameRef} type="text" placeholder="नवीन तालुक्याचे नाव" required className="w-full p-2 border rounded-md" defaultValue={formData?.taluka_name_marathi|| ""} />
                            <input ref={pincodeRef} type="text" placeholder="Pincode" required className="w-full p-2 border rounded-md" defaultValue={formData?.pincode || ""} />
                            <select ref={statusInputRef} className="w-full p-2 border rounded-md" required defaultValue={formData?.status || "Active"}>
                                <option value="Active">Active</option>
                                <option value="Deactive">Deactive</option>
                            </select>
                            <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md">
                                {formData ? "Update Taluka" : "Add taluka"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Taluka;
