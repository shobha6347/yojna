import React, { useEffect, useState, useRef } from "react";
import { Footer } from "@/layouts/footer";
import { PencilLine, Plus, ShieldOff, SquareX, Trash } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import toast from "react-hot-toast";

const Category = () => {
    const { theme } = useTheme();
    const [categoryData, setCategoryData] = useState([]); // Store fetched data
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(null); // Stores current form data (for editing)
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [filteredData, setFilteredData] = useState([]); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;


    
    const  URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

    // Input Refs
    const nameInputRef = useRef();
    const statusInputRef = useRef();

    // Fetch Yojana data from the backend
    const fetchCategory = async () => {
        try {
            const response = await fetch(`${URL}/api/category`);
            const data = await response.json();
            setCategoryData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch"); 
        }
    };

    useEffect(() => {
        fetchCategory(); // Load data on component mount
    }, []);

    

    //  Handle opening and closing the form
    const handleOpenForm = (category) => {
        setFormData(category); // Clear form data when adding a new Yojana
        setShowForm(true);
        setTimeout(() => {
            nameInputRef.current.value = category.category_name;
            statusInputRef.current.value = category.status;
        }, 100); 
    };
    
    const handleCloseForm = () => {
        setShowForm(false);
        setFormData(null);
    };

    // Handle form submission (Add/Edit Yojana)
    const submitFormHandler = async (e) => {
        e.preventDefault();

        const newCategory = {
            category_name: nameInputRef.current.value,
            status: statusInputRef.current.value,
        };

        try {
            const response = await fetch(
                formData?.category_id ? `${URL}/api/category/${formData.category_id}` : `${URL}/api/new-category`,
                {
                    method: formData?.category_id ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newCategory),
                }
            );

            if (!response.ok) throw new Error("Failed to save category");

            await fetchCategory();

            handleCloseForm();
            console.log(formData?.category_id ? "Category updated successfully" : "New Category added successfully");
            toast.success(formData?.category_id ? "Category updated" : "New Category added");
            
        } catch (error) {
            console.error("Error saving Category:", error);
            toast.error("Error saving category");
        }
    };

    //  Handle Editing
    const handleEditForm = (category) => {
        setFormData(category);
        setShowForm(true);
    };

    // Handle Delete
    const deactiveCategory = async (id) => {
        console.log("Category with id:", id);
        if (!window.confirm("Are you sure you want to Deactivating this Category?")) 
            return;
        try {
            const response = await fetch(`${URL}/api/category/deactive/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });
    
            if (!response.ok) throw new Error("Failed to deactivate");
    
            setCategoryData((prevData) => 
                prevData.map((category) =>
                    category.category_id === id ? { ...category, status: "Deactive" } : category
                )
            );
    
            console.log("Category deactivated successfully!");
            toast.success("Category deactivated successfully");
            await fetchCategory();

        } catch (error) {
            console.error("Error deactivating Category:", error);
            toast.error("Error deactivating category");
        }
    };

    const handleStatusChange = (e) => {
         setSelectedStatus(e.target.value);
         setCurrentPage(1);
    };
    
    useEffect(() => {
        setCurrentPage(1);
        if (selectedStatus === "all") {
            setFilteredData(categoryData);
        } else {
            setFilteredData(categoryData.filter(category => category.status === selectedStatus));
        }
    }, [selectedStatus, categoryData]);


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
                <h1 className="title">Category</h1>
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
                                    <th className="table-head">Status</th>
                                    <th className="table-head">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {currentItems.length > 0 ? (
                                    currentItems.map((category, index) => (
                                        <tr key={category.id} className="table-row">
                                            <td className="table-cell">{indexOfFirstItem + index + 1}</td>
                                            <td className="table-cell">{category.category_name}</td>
                                            <td className="table-cell">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit
                                                    ${category.status === "Active" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
                                                    {category.status}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                    <div className="flex items-center gap-x-4">
                                                        <button className="flex justify-center items-center text-xs text-white bg-blue-500 w-[50px] h-full rounded dark:text-white" onClick={() => handleEditForm(category)}>
                                                            <PencilLine size={20} />
                                                        </button>
                                                        <button className="flex justify-center items-center text-xs text-white bg-red-500 w-[50px] h-full rounded dark:text-white" onClick={() => deactiveCategory(category.category_id)}>
                                                            <ShieldOff  size={20} />
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
                            <input ref={nameInputRef} type="text" placeholder="New Category Name" required className="w-full p-2 border rounded-md" defaultValue={formData?.category_name || " "} />
                            <select ref={statusInputRef} className="w-full p-2 border rounded-md" placeholder="Select Status" required defaultValue={formData?.status || "Active"}>
                                <option value="Active">Active</option>
                                <option value="Deactive">Deactive</option>
                            </select>
                            <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md">
                                {formData ? "Update Category" : "Add Category"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Category;
