import React, { useEffect, useState, useRef } from "react";
import { Footer } from "@/layouts/footer";
import { PencilLine, Plus, ShieldOff, SquareX, Trash } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const Yojana = () => {
    const { theme } = useTheme();
    const [yojanaData, setYojanaData] = useState([]); 
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(null); 
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [filteredData, setFilteredData] = useState([]); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [categoryData, setCategoryData] = useState([]);
    const [subCategoryData, setSubCategoryData] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(""); 
    const [filteredSubcategories, setFilteredSubcategories] = useState([]); 


    
    const  URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

    // Input Refs
    const categoryIDRef = useRef();
    const subCategoryIDRef = useRef();
    const nameInputRef = useRef();
    const amountRef = useRef();
    const linkInputRef = useRef();
    const detailsInputRef = useRef();
    const statusInputRef = useRef();
    const yojanaYearRef = useRef();

    // Fetch Yojana data from the backend
    const fetchYojana = async () => {
        try {
            const response = await fetch(`${URL}/api/yojana`);
            const data = await response.json();
            setYojanaData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchYojana(); // Load data on component mount
    }, []);

    const fetchSubCategory = async () => {
            try {
                const response = await fetch(`${URL}/api/subcategory`);
                const data = await response.json();
                setSubCategoryData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        useEffect(() => {
            fetchSubCategory(); // Load data on component mount
        }, []);



    const fetchCategory = async () => {
            try {
                const response = await fetch(`${URL}/api/category`);
                const data = await response.json();
                setCategoryData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
    useEffect(() => {
        fetchCategory(); // Load data on component mount
    }, []);
        
    
    
    

    

    //  Handle opening and closing the form
    const handleOpenForm = () => {
        setFormData(null); // Clear form data when adding a new Yojana
        setShowForm(true);
    };
    
    const handleCloseForm = () => {
        setShowForm(false);
        setFormData(null);
    };

    // Handle form submission (Add/Edit Yojana)
    const submitFormHandler = async (e) => {
        e.preventDefault();

        const newYojana = {
            category_id: categoryIDRef.current.value,
            subcategory_id: subCategoryIDRef.current.value,
            yojana_type: nameInputRef.current.value,
            amount : amountRef.current.value,
            year : yojanaYearRef.current.value,
            status: statusInputRef.current.value,
            description: detailsInputRef.current.value,
            link: linkInputRef.current.value,
        };

        try {
            const response = await fetch(
                formData?.yojana_type_id ? `${URL}/api/yojana/${formData.yojana_type_id}` : `${URL}/api/new-yojana`,
                {
                    method: formData?.yojana_type_id ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newYojana),
                }
            );

            if (!response.ok) throw new Error("Failed to save yojana");

            await fetchYojana(); // Refresh the list after adding/updating
            handleCloseForm();
            console.log(formData?.yojana_type_id ? "Yojana updated successfully" : "New Yojana added successfully");
        } catch (error) {
            console.error("Error saving yojana:", error);
        }
    };

    //  Handle Editing
    const handleEditForm = (yojana) => {
        setFormData(yojana);
        setShowForm(true);
    };

    // Handle Delete
    const deactiveYojana = async (id) => {
        console.log("Deactivating yojana with id:", id);
        try {
            const response = await fetch(`${URL}/api/yojana/deactive/${id}`, {
             method: "PUT",
             headers: { "Content-Type": "application/json" },
            });

            if (!response.ok){
                 throw new Error("Failed to delete");
            }

            setYojanaData((prevData) => 
                prevData.map((yojana) =>
                    yojana.yojana_type_id === id ? { ...yojana, status: "Deactive" } : yojana
                )
            );
    
            console.log("Yojana deactivated successfully!");
            await fetchYojana();
        } catch (error) {
            console.error("Error deactivating yojana:", error);
        }
    };

    const handleStatusChange = (e) => {
         setSelectedStatus(e.target.value);
         setCurrentPage(1);
    };
    
    useEffect(() => {
        setCurrentPage(1);
        if (selectedStatus === "all") {
            setFilteredData(yojanaData);
        } else {
            setFilteredData(yojanaData.filter(yojana => yojana.status === selectedStatus));
        }
    }, [selectedStatus, yojanaData]);



    const handleCategoryChange = (event) => {
        const categoryId = Number(event.target.value);
        setSelectedCategory(categoryId); 
    
        const filtered = subCategoryData.filter(sub => sub.category_id === categoryId);
        setFilteredSubcategories(filtered);
    };
    


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
                <h1 className="title">Yojana</h1>
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

            {/* Table to Display Yojana Data */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="relative h-[500px] w-full overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="table">
                            <thead className="table-header">
                                <tr className="table-row">
                                    <th className="table-head">ID</th>
                                    <th className="table-head">Category</th>
                                    <th className="table-head">Sub Category</th>
                                    <th className="table-head">Yojana</th>
                                    <th className="table-head">Amount</th>
                                    <th className="table-head">Year</th>
                                    <th className="table-head">Status</th>
                                    <th className="table-head">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {currentItems.length > 0 ? (
                                    currentItems.map((yojana, index) => {
                                        const category = categoryData.find(cat => cat.category_id == yojana.category_id);
                                        const sub_category = subCategoryData.find(cat => cat.subcategory_id == yojana.subcategory_id);
                                        
                                        return (
                                        <tr key={yojana.id} className="table-row">
                                            <td className="table-cell">{indexOfFirstItem + index + 1}</td>
                                            <td className="table-cell">{category ? category.category_name : 'N/A'}</td>
                                            <td className="table-cell">{sub_category ? sub_category.subcategory_name : 'N/A'}</td>
                                            <td className="table-cell">{yojana.yojana_type}</td>
                                            <td className="table-cell">{yojana.amount}</td>
                                            <td className="table-cell">{yojana.yojana_year}</td>
                                            <td className="table-cell">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit
                                                    ${yojana.status === "Active" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
                                                    {yojana.status}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                    <div className="flex items-center gap-x-4">
                                                        <button className="flex justify-center items-center text-xs text-white bg-blue-500 w-[50px] h-full rounded dark:text-white" onClick={() => handleEditForm(yojana)}>
                                                            <PencilLine size={20} />
                                                        </button>
                                                        <button className="flex justify-center items-center text-xs text-white bg-red-500 w-[50px] h-full rounded dark:text-white" onClick={() => deactiveYojana(yojana.yojana_type_id)}>
                                                            <ShieldOff  size={20} />
                                                        </button>
                                                </div>
                                            </td>
                                         </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center p-4">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="flex lg:justify-end  justify-start gap-4 mt-5 ">
                            <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded-md">Previous</button>
                            <button onClick={nextPage} disabled={currentPage >= Math.ceil(filteredData.length / itemsPerPage)} className="px-4 py-2 bg-gray-300 rounded-md">Next</button>
                        </div>
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

                            {/* Dropdown for category selection */}
                            <select 
                                ref={categoryIDRef} 
                                onChange={handleCategoryChange} 
                                required 
                                className="w-full p-2 border rounded-md"
                                selected={formData?.category_name || ""}
                            >
                                <option value="">Select Category</option>
                                {categoryData.map(category => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                            {/* Dropdown for sub category */}
                            <select 
                                ref={subCategoryIDRef} 
                                required 
                                className="w-full p-2 border rounded-md"
                                defaultValue={formData?.subcategory_name || ""}
                            >
                                <option value="">Select Sub Category</option>
                                    {filteredSubcategories.length > 0 ? (
                                        filteredSubcategories.map(sub => (
                                            <option key={sub.subcategory_id} value={sub.subcategory_id}>
                                                {sub.subcategory_name}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No subcategories available</option>
                                    )}
                            </select>

                            

                            <input ref={nameInputRef} type="text" placeholder="New Yojana Name" required className="w-full p-2 border rounded-md" defaultValue={formData?.yojana_type || ""} />
                            <input ref={amountRef} type="number" placeholder="Amount" required className="w-full p-2 border rounded-md" defaultValue={formData?.amount || ""} />
                                    
                            <select 
                                ref={yojanaYearRef} 
                                required 
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">Select Year</option>
                                {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    );
                                })}
                            </select>

                            <select ref={statusInputRef} className="w-full p-2 border rounded-md" required defaultValue={formData?.status || "Active"}>
                                <option value="Active">Active</option>
                                <option value="Deactive">Deactive</option>
                            </select>
                            <input ref={linkInputRef} type="text" placeholder="Links" required className="w-full p-2 border rounded-md" defaultValue={formData?.link || ""}/>
                            <textarea ref={detailsInputRef} placeholder="Details" required className="w-full p-2 border rounded-md h-24" defaultValue={formData?.description || ""}/>
                            <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md">
                                {formData ? "Update Yojana" : "Add Yojana"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Yojana;
