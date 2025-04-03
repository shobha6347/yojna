import React, { useEffect, useState, useRef } from "react";
import { Footer } from "@/layouts/footer";
import { PencilLine, Plus, SquareX, Trash } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import toast from "react-hot-toast";

const Subcategory = () => {
    const { theme } = useTheme();
    const [subCategoryData, setSubCategoryData] = useState([]); // Store fetched data
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(null); // Stores current form data (for editing)
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [filteredData, setFilteredData] = useState([]); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [categoryData, setCategoryData] = useState([]);


    
    const  URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

    // Input Refs
    const categoryIDRef = useRef();
    const subCategoryRef = useRef();
    const statusInputRef = useRef();

    // Fetch Yojana data from the backend
    const fetchSubCategory = async (category) => {
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

        const newSubCategory = {
            category_id : categoryIDRef.current.value,
            subcategory_name : subCategoryRef.current.value ,
            status: statusInputRef.current.value,
        };

        

        try {
            const response = await fetch(
                formData?.subcategory_id ? `${URL}/api/subcategory/${formData.subcategory_id}` : `${URL}/api/new-subcategory`,
                {
                    method: formData?.subcategory_id ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newSubCategory),
                }
            );

            console.log(response);

            if (!response.ok) throw new Error("Failed to save subcategory");

            await fetchSubCategory(); // Refresh the list after adding/updating
            handleCloseForm();
            toast.success(formData?.subcategory_id ? "Subcategory updated!" : "New subcategory added!");
        } catch (error) {
            console.error("Error saving subcategory:", e);
        }
    };

    //  Handle Editing
    const handleEditForm = (subcategory) => {
        setFormData(subcategory);
        setShowForm(true);
    };

    // Handle Delete
    const deactiveSubCategory = async (id) => {
        console.log("Deactivating subcategory with id:", id);
        
        try {
            const response = await fetch(`${URL}/api/subcategory/deactive/${id}`, {
             method: "PUT",
             headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error("Failed to deactivate");
    
            setSubCategoryData((prevData) => 
                prevData.map((subcategory) =>
                    subcategory.subcategory_id === id ? { ...subcategory, status: "Deactive" } : subcategory
                )
            );
    
            console.log("Sub Category deactivated successfully!");
            toast.success("Sub Category deactivated successfully");
            await fetchSubCategory();

        } catch (error) {
            console.error("Error deactivating Sub Category:", error);
            toast.error("Error deactivating Sub category");
        }
    };

    const handleStatusChange = (e) => {
         setSelectedStatus(e.target.value);
         setCurrentPage(1);
    };
    
    useEffect(() => {
        setCurrentPage(1);
        if (selectedStatus === "all") {
            setFilteredData(subCategoryData);
        } else {
            setFilteredData(subCategoryData.filter(subcategory => subcategory.status === selectedStatus));
        }
    }, [selectedStatus, subCategoryData]);


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
                <h1 className="title">Sub Category</h1>
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
                                    <th className="table-head">Sub Category</th>
                                    <th className="table-head">Category</th>
                                    <th className="table-head">Status</th>
                                    <th className="table-head">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {currentItems.length > 0 ? (
                                    currentItems.map((subcategory, index) => {
                                        const category = categoryData.find(cat => cat.category_id == subcategory.category_id);
                                        return (
                                            <tr key={subcategory.id} className="table-row">
                                                <td className="table-cell">{indexOfFirstItem + index + 1}</td>
                                                <td className="table-cell">{subcategory.subcategory_name}</td>
                                                <td className="table-cell">{category ? category.category_name : 'N/A'}</td>
                                                <td className="table-cell">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit
                                                        ${subcategory.status === "Active" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
                                                        {subcategory.status}
                                                    </span>
                                                </td>
                                                <td className="table-cell">
                                                        <div className="flex items-center gap-x-4">
                                                            <button className="flex justify-center items-center text-xs text-white bg-blue-500 w-[50px] h-full rounded dark:text-white" onClick={() => handleEditForm(subcategory)}>
                                                                <PencilLine size={20} />
                                                            </button>
                                                            <button className="flex justify-center items-center text-xs text-white bg-red-500 w-[50px] h-full rounded dark:text-white" onClick={() => deactiveSubCategory(subcategory.subcategory_id)}>
                                                                <Trash size={20} />
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
                            <select ref={categoryIDRef} type="text" placeholder="Select Category" required className="w-full p-2 border rounded-md" defaultValue={formData?.category_name || ""} >
                                {categoryData.map(category => (
                                    <option key={category.category_id} value={category.category_id}>{category.category_name}</option>
                                ))}
                            </select>
                            <input ref={subCategoryRef} type="text" placeholder="New subcategory Name" required className="w-full p-2 border rounded-md" defaultValue={formData?.subcategory_name || ""} />
                            <select ref={statusInputRef} className="w-full p-2 border rounded-md" required defaultValue={formData?.status || "Active"}>
                                <option value="Active">Active</option>
                                <option value="Deactive">Deactive</option>
                            </select>
                            <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md">
                                {formData ? "Update subcategory" : "Add subcategory"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Subcategory;
