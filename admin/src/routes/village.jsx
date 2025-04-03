import React, { useEffect, useState, useRef } from "react";
import { Footer } from "@/layouts/footer";
import { PencilLine, Plus, ShieldOff, SquareX, Trash } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

// import { Search } from "../layouts/search";
// import  axios from 'axios';

const Village = () => {
    const { theme } = useTheme();
    const [talukaData, setTalukatData] = useState([]); 
    const [panchayatData, setPanchayatData] = useState([]); // Store fetched data
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(null); // Stores current form data (for editing)
    const [selectedTaluka, setSelectedTaluka] = useState('All');
    const [selectedPanchayat, setSelectedPanchayat] = useState('All');
    const [villageData, setVillageData] = useState([]);
  
   




    
    const  URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;


   


    // Input Refs
    const village_marathiRef = useRef();
    const village_engRef = useRef();
    const panchayat_idRef = useRef();
    const taluka_idRef = useRef();
    

    

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
            const response = await fetch(`${URL}/api/panchayat/${taluka_id}`);
            const data = await  response.json();
            setPanchayatData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const fetchvillage = async (taluka_id, panchayat_id) => {
        try {
            let url = `${URL}/api/village`;
    
            if (taluka_id !== "All") {
                url += `/${taluka_id}`;
            }
            if (panchayat_id !== "All") {
                url += `/${panchayat_id}`;
            }
    
            const response = await fetch(url);
            const data = await response.json();
            setVillageData(data);
        } catch (error) {
            console.error("Error fetching villages:", error);
        }
    };
    
    
    
    

    
    


    useEffect(() => {
        fetchtaluka();
    }, []); // Runs only once on mount
    
    useEffect(() => {
        fetchpanchayat(selectedTaluka);
    }, [selectedTaluka]); // Runs when Taluka changes
    
    useEffect(() => {
        if (selectedPanchayat !== null) {
            fetchvillage(selectedTaluka, selectedPanchayat);
        }
    }, [selectedTaluka]);
    

    const handleTalukaChange = (event) => {
        const taluka_id = event.target.value;
        setSelectedTaluka(taluka_id);
        localStorage.setItem("SelectedTaluka", taluka_id);
        
        fetchpanchayat(taluka_id); // Fetch Panchayats for this Taluka
        fetchvillage(taluka_id, selectedPanchayat);
    };

    const handlePanchayatChange = (event) => {
        const panchayat_id = event.target.value;
        setSelectedPanchayat(panchayat_id);
        localStorage.setItem("SelectedPanchayat", panchayat_id);
    
        // Ensure fetchvillage gets the latest state
        fetchvillage(selectedTaluka, panchayat_id);
    };
    
    



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
    
        console.log("Submitting Form Data:", formData); // Debugging log
    
        if (!formData || !formData.id) {
            console.log("No ID found, treating as new village.");
        } else {
            console.log("ID found, treating as an update.");
        }
    
        const newvillage = {
            village_eng: village_engRef.current.value,
            village_marathi: village_marathiRef.current.value,
            taluka_id: selectedTaluka,
            panchayat_id: selectedPanchayat,
        };
    
        try {
            const response = await fetch(
                formData?.id ? `${URL}/api/village/${formData.id}` : `${URL}/api/new-village`,
                {
                    method: formData?.id ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newvillage),
                }
            );
    
            if (!response.ok) throw new Error("Failed to save Village");
    
            
            await fetchvillage(selectedTaluka, selectedPanchayat);
    
            handleCloseForm();
    
            console.log(formData?.id ? "Village updated successfully" : "New Village added successfully");
        } catch (error) {
            console.error("Error saving Village:", error);
        }
    };
    
    //  Handle Editing
    const handleEditForm = (village) => {
        setFormData({
            id: village.village_id, // Ensure ID is explicitly set
            village_eng: village.village_eng,
            village_marathi: village.village_marathi,
            taluka_id: village.taluka_id,
            panchayat_id: village.panchayat_id
        });
        setShowForm(true);
    };

    // Handle Deactive
    const deactiveVillage = async (id) => {
        console.log("Deactivating village with id:", id);
      
        try {
            const response = await fetch(`${URL}/api/deactive/village/${id}`, {
             method: "PUT",
             headers:{"Content-Type":"application/json"},
            });

            if (!response.ok){
                 throw new Error("Failed to Deactive");
            }

            setVillageData((prevData) => 
                prevData.map((village) =>
                    village.village_id === id ? { ...village, status: "Deactive" } : village
                )
            );
    
            console.log("Village Deactived successfully!");
            await fetchvillage(selectedTaluka, selectedPanchayat);
        } catch (error) {
            console.error("Error Deactivating village:", error);
        }
    };

    

    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex lg:flex-row  flex-col  justify-between">
                <h1 className="title">Village</h1>
                <button className="flex justify-center mt-2 items-center lg:w-[80px] lg:h-[30px] md:w-[80px] md:h-[30px] w-[60px] h-[25px]  lg:text-xl  text-xs font-bold bg-blue-400 text-white rounded-md" onClick={handleOpenForm}>
                        <Plus className="text-xl" /> New
                    </button>
            </div>
            

            <div className="flex flex-row space-x-3 ">
                <select onChange={handleTalukaChange} value={selectedTaluka} className="w-[200px] h-[30px] rounded-md outline outline-2  outline-slate-200 dark:bg-slate-800 dark:text-white">
                    <option value="All">All Taluka</option>
                    {talukaData.map(taluka => (
                        <option key={taluka.taluka_id} value={taluka.taluka_id}>{taluka.taluka_name_eng}</option>
                    ))}
                </select>

                <select onChange={handlePanchayatChange} value={selectedPanchayat} className="w-[200px] h-[30px] rounded-md outline outline-2  outline-slate-200 dark:bg-slate-800 dark:text-white">
                    <option value="All">All Panchayat</option>
                    {panchayatData.map(panchayat => (
                        <option key={panchayat.id} value={panchayat.id}>{panchayat.panchayat_eng}</option>
                    ))}
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
                                    <th className="table-head">Village</th>
                                    <th className="table-head">खेडे</th>
                                    <th className="table-head">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {villageData.length > 0 ? (
                                    villageData.map((village, index) => (
                                        <tr key={village.id} className="table-row">
                                            <td className="table-cell">{index + 1}</td>
                                            <td className="table-cell">{village.village_eng}</td>
                                            <td className="table-cell">{village.village_marathi}</td>   
                                            <td className="table-cell">
                                                <div className="flex items-center gap-x-4">
                                                    <button className="flex justify-center items-center text-xs text-white bg-blue-500 w-[50px] h-full rounded dark:text-white" onClick={() => handleEditForm(village)}>
                                                        <PencilLine size={20} />
                                                    </button>
                                                    <button className="flex justify-center items-center text-xs text-white bg-red-500 w-[50px] h-full rounded dark:text-white" onClick={() => deactiveVillage(village.village_id)}>
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
                </div>
            </div>

            {showForm && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg relative w-96">
                                    <button onClick={handleCloseForm} className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-600">
                                        <SquareX className="mb-3" />
                                    </button>
                                    <form onSubmit={submitFormHandler} className="space-y-4 mt-3">
                                    <select
                                            required
                                            value={selectedTaluka}
                                            onChange={(e) => setSelectedTaluka(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            <option value="">Select Taluka</option>
                                            {talukaData.map((taluka) => (
                                                <option key={taluka.taluka_id} value={taluka.taluka_id}>
                                                    {taluka.taluka_name_eng}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            required
                                            value={selectedPanchayat}
                                            onChange={(e) => setSelectedPanchayat(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            disabled={!selectedTaluka}
                                        >
                                            <option value="">Select Panchayat</option>
                                            {panchayatData.map((panchayat) => (
                                                <option key={panchayat.panchayat_id} value={panchayat.panchayat_id}>
                                                    {panchayat.panchayat_eng}
                                                </option>
                                            ))}
                                        </select>
                                        <input ref={village_engRef} type="text" placeholder="New Village Name" required className="w-full p-2 border rounded-md" defaultValue={formData?.village_eng|| ""} />
                                        <input ref={village_marathiRef} type="text" placeholder="खेडे नवे नाव" required className="w-full p-2 border rounded-md" defaultValue={formData?.village_marathi|| ""} />
                                        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md">
                                            {formData ? "Update Village" : "Add Village"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
            

           

            <Footer />
        </div>
    );
};

export default Village;