import React, { useEffect, useState, useRef } from "react";
import { Footer } from "@/layouts/footer";
import { PencilLine, Plus, ShieldOff, SquareX, Trash } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

import  axios from 'axios';


const GramPanchayat = () => {
    const { theme } = useTheme();
    const [talukaData, setTalukatData] = useState([]); 
    const [panchayatData, setPanchayatData] = useState([]); // Store fetched data
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(null); // Stores current form data (for editing)
    const [selectedTaluka, setSelectedTaluka] = useState(null);

    const [selectedStatus, setSelectedStatus] = useState("all");
    const [filteredData, setFilteredData] = useState([]); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;


    const  URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
    




   


    // Input Refs
    const panchayat_marathiRef = useRef();
    const panchayat_engRef = useRef();
    const taluka_idRef = useRef();
    const statusInputRef = useRef();
    
    

    const fetchtaluka = async () => {
        try{
            const response = await fetch(`${URL}/api/taluka`);
            const data = await response.json();
            setTalukatData(data);
        }catch(e){
            console.log(e);
        }
    } 

    // Fetch panchayat data from the backend
    const fetchpanchayat = async (taluka_id) => {
        try {
            const url = taluka_id === "All" ? `${URL}/api/panchayat` : `${URL}/api/panchayat/${taluka_id}`;
            const response = await fetch(url);
            const data = await  response.json();
            setPanchayatData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    
    


    useEffect(() => {
        fetchtaluka();// Load data on component mount
        const storedTaluka = localStorage.getItem("SelectedTaluka") || "All";
        if(storedTaluka){
            setSelectedTaluka(storedTaluka);
            fetchpanchayat(storedTaluka);
        }
    }, []);

    useEffect(() => {
        fetchpanchayat(selectedTaluka);
    }, [selectedTaluka]);


    const handleTalukaChange = async (event) => {
        const taluka_id = event.target.value;
        setSelectedTaluka(taluka_id);
        localStorage.setItem("SelectedTaluka", taluka_id);
        await fetchpanchayat(taluka_id);
    }




    //  Handle opening and closing the form
    const handleOpenForm = () => {
        setFormData(null); // Clear form data when adding a new panchayat
        setShowForm(true);
    };
    
    const handleCloseForm = () => {
        setShowForm(false);
        setFormData(null);
    };

    // Handle form submission (Add/Edit panchayat)
    const submitFormHandler = async (e) => {
        e.preventDefault();

        const newpanchayat = {
            panchayat_eng: panchayat_engRef.current.value,
            panchayat_marathi: panchayat_marathiRef.current.value,
            taluka_id : taluka_idRef.current.value,
            status : statusInputRef.current.value,
           };

        try {
            const response = await fetch(
                formData?.panchayat_id ? `${URL}/api/panchayat/${formData.panchayat_id}` : `${URL}/api/new-panchayat`,
                {
                    method: formData?.panchayat_id ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newpanchayat),
                }
            );

            if (!response.ok) throw new Error("Failed to save panchayat");

            await fetchpanchayat(selectedTaluka); // Refresh the list after adding/updating


            handleCloseForm();
            console.log(formData?.panchayat_id ? "Panchayat updated successfully" : "New Panchayat added successfully");
        } catch (error) {
            console.error("Error saving panchayat:", error);
        }
    };


    

    //  Handle Editing
    const handleEditForm = (panchayat) => {
        setFormData(panchayat);
        setShowForm(true);
    };

    // Handle Delete
    const deactivatePanchayat = async (id) => {
        console.log("Deactivating panchayat with id:", id);
       
        try {
            const response = await fetch(`${URL}/api/panchayat/deactive/${id}`, {
             method: "PUT",
             headers :{"Content-Type":"application/json"},
            });

            if (!response.ok){
                 throw new Error("Failed to Deactive");
            }

            setPanchayatData((prevData) => 
                prevData.map((panchayat) =>
                    panchayat.panchayat_id === id ? { ...panchayat, status: "Deactive" } : panchayat
                )
            );
    
            console.log("Panchayat deactivated successfully!");
            await fetchpanchayat(selectedTaluka);
        } catch (error) {
            console.error("Error Deactivating panchayat:", error);
        }
    };

    const handleStatusChange = (e) => {
                 setSelectedStatus(e.target.value);
                 setCurrentPage(1);
            };
            
    useEffect(() => {
                setCurrentPage(1);
                if (selectedStatus === "all") {
                    setFilteredData(panchayatData);
                } else {
                    setFilteredData(panchayatData.filter(panchayat => panchayat.status === selectedStatus));
                }
            }, [selectedStatus, panchayatData]);
        
        
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
            <div className="flex lg:flex-row md:flex-row flex-col justify-between">
                <h1 className="title">Gram Panchayat</h1>
                <button className="flex justify-center mt-2 items-center lg:w-[80px] lg:h-[30px] md:w-[80px] md:h-[30px] w-[60px] h-[25px]  lg:text-xl  text-xs  font-bold bg-blue-400 text-white rounded-md" onClick={handleOpenForm}>
                    <Plus className="text-xl" /> New
                </button>
            </div>

            <div className="flex flex-row justify-start items-start gap-3">
                <select ref={taluka_idRef} onChange={handleTalukaChange} value={selectedTaluka} className="w-[200px] h-[30px] rounded-md outline outline-2  outline-slate-200 dark:bg-slate-800 dark:text-white">
                    <option value="All">All Taluka</option>
                    {talukaData.map(taluka => (
                        <option key={taluka.taluka_id} value={taluka.taluka_id}>
                            {taluka.taluka_name_eng}
                        </option>
                    ))}
                </select>
                <select onChange={handleStatusChange} value={selectedStatus} className="w-[150px] h-[30px] rounded-md outline outline-2 outline-slate-200 dark:bg-slate-800 dark:text-white">
                        <option value="all">All</option>
                        <option value="Active">Active</option>
                        <option value="Deactive">Deactive</option>
                 </select>
            </div>

            {/* Table to Display panchayat Data */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="relative h-[500px] w-full overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="table">
                        <thead className="table-header">
                            <tr className="table-row">
                                <th className="table-head">ID</th>
                                <th className="table-head">Gram Panchayat</th>
                                <th className="table-head">ग्राम पंचायत</th>
                                <th className="table-head">Taluka</th>  
                                <th className="table-head">Status</th>
                                <th className="table-head">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="table-body">
                                {currentItems.length > 0 ? (
                                    currentItems.map((panchayat, index) => {
                                        const taluka = talukaData.find(cat => cat.taluka_id == panchayat.taluka_id);
                                        return (
                                        <tr key={panchayat.id} className="table-row">
                                            <td className="table-cell">{indexOfFirstItem + index + 1}</td>
                                            <td className="table-cell">{panchayat.panchayat_eng}</td>
                                            <td className="table-cell">{panchayat.panchayat_marathi}</td>
                                            <td className="table-cell">{taluka ? taluka.taluka_name_eng : 'N/A'}</td>
                                            <td>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit
                                                    ${panchayat.status === "Active" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
                                                    {panchayat.status}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-x-4">
                                                    <button className="flex justify-center items-center text-xs text-white bg-blue-500 w-[50px] h-full rounded dark:text-white" onClick={() => handleEditForm(panchayat)}>
                                                        <PencilLine size={20} />
                                                    </button>
                                                    <button className="flex justify-center items-center text-xs text-white bg-red-500 w-[50px] h-full rounded  dark:text-white" onClick={() => deactivatePanchayat(panchayat.panchayat_id)}>
                                                        <ShieldOff size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center p-4">No data available</td>
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

            {showForm && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg relative w-96">
                                    <button onClick={handleCloseForm} className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-600">
                                        <SquareX className="mb-3" />
                                    </button>
                                    <form onSubmit={submitFormHandler} className="space-y-4 mt-3">
                                        <input ref={panchayat_engRef} type="text" placeholder="New Panchayat Name" required className="w-full p-2 border rounded-md" defaultValue={formData?.panchayat_eng|| ""} />
                                        <input ref={panchayat_marathiRef} type="text" placeholder="पंचायतीचे नवे नाव" required className="w-full p-2 border rounded-md" defaultValue={formData?.panchayat_marathi|| ""} />
                                        <select ref={taluka_idRef} className="w-full p-2 border rounded-md" required defaultValue={formData?.taluka_id || "" }>
                                            {talukaData.map(taluka => (
                                                <option key={taluka.taluka_id} value={taluka.taluka_id}>
                                                    {taluka.taluka_name_eng}
                                                </option>
                                            ))}
                                        </select>
                                        <select ref={statusInputRef} className="w-full p-2 border rounded-md" required defaultValue={formData?.status || "Active"}>
                                            <option value="Active">Active</option>
                                            <option value="Deactive">Deactive</option>
                                        </select>
                                        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md">
                                            {formData ? "Update Panchayat" : "Add Panchayat"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
            

           

            <Footer />
        </div>
    );
};

export default GramPanchayat;
