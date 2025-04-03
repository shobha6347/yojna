import React, { useEffect, useState } from "react";
import {  List, Package, TrendingUp, User, Users } from "lucide-react";

const DashboardPage = () => {
    const [totalyojana, setTotalYojana] = useState(null);
    const [yojana, setYojana] = useState([]);
    const [showYojana, setShowYojana] = useState(false); // State to toggle views
    const [user, setUser] = useState([]);
    const [totalUser, setTotalUser] = useState(null);
    const [totalCategory, setTotalCategory] = useState(null);
    const [totalTaluka, setTotalTaluka] = useState(null);
    const [taluka, setTaluka] = useState([]);
    const [showTaluka, setShowTaluka] = useState(false);
    const [category, setCategory] = useState([]);
    const [showCategory, setShowCategory] = useState(false);
    

    
    const  URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

    // Fetch Total Yojana
    useEffect(() => {
        const fetchTotalYojana = async () => {
            try {
                const response = await fetch(`${URL}/api/total-yojana`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setTotalYojana(data.totalYojana);
            } catch (error) {
                console.error("Error fetching total Yojana:", error);
                setTotalYojana("N/A");
            }
        };
        fetchTotalYojana();
    }, []);

    useEffect(() => {
        const fetchTotalUser = async () => {
            try {
                const response = await fetch(`${URL}/api/total-user`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setTotalUser(data.totalUser);
            } catch (error) {
                console.error("Error fetching total User:", error);
                setTotalUser("N/A");
            }
        };
        fetchTotalUser();
    }, []);

    useEffect(() => {
        const fetchTotalCategory = async () => {
            try {
                const response = await fetch(`${URL}/api/total-category`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setTotalCategory(data.totalCategory);
            } catch (error) {
                console.error("Error fetching total Category:", error);
                setTotalCategory("N/A");
            }
        };
        fetchTotalCategory();
    }, []);


    useEffect(() => {
        const fetchTotalTaluka = async () => {
            try {
                const response = await fetch(`${URL}/api/total-taluka`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setTotalTaluka(data.totalTaluka);
            } catch (error) {
                console.error("Error fetching total Taluka:", error);
                setTotalTaluka("N/A");
            }
        };
        fetchTotalTaluka();
    }, []);

    
    // Fetch Yojanas
    const handleYojana = async () => {
        try {
            const response = await fetch(`${URL}/api/yojana`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setYojana(data);
            setShowYojana(true); // Show Yojana list when fetched
        } catch (error) {
            console.error("Error fetching Yojana:", error);
        }
    };

    const handleCategory = async () => {
        try {
            const response = await fetch(`${URL}/api/category`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setCategory(data);
            setShowCategory(true); // Show Yojana list when fetched
        } catch (error) {
            console.error("Error fetching Category:", error);
        }
    };

    const handleTaluka = async () => {
        try {
            const response = await fetch(`${URL}/api/taluka`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setTaluka(data);
            setShowTaluka(true); // Show Yojana list when fetched
        } catch (error) {
            console.error("Error fetching Taluka:", error);
        }
    };

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Dashboard</h1>

            {/* Show Yojana List if showYojana is true */}
            {showYojana ? (
                <div>
                    {/* Back Button */}
                    <button
                        onClick={() => setShowYojana(false)}
                        className="mb-4 rounded bg-blue-500/50 px-4 py-2 font-bold text-white hover:bg-blue-500"
                    >
                        ← Back
                    </button>

                    {/* Display fetched Yojanas */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {yojana.length > 0 ? (
                            yojana.map((yojana, index) => (
                                <div key={index} className="card">
                                    <div className="card-header">
                                        <div className="w-full h-[60px] rounded-lg bg-green-500/20 p-2 text-green-500 flex flex-row">
                                            <p className="card-title">{yojana.yojana_type}</p>
                                        </div>
                                    </div>
                                    {/* <div className="card-body bg-slate-100">
                                        <p className="text-lg font-semibold text-slate-700">
                                            {yojana.description}
                                        </p>
                                    </div> */}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No Yojanas available</p>
                        )}
                    </div>
                </div>
            ) : (
                // Default Dashboard Cards (Shown when showYojana is false)
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="card" onClick={handleYojana}>
                        <div className="card-header">
                            <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500">
                                <Package size={26} />
                            </div>
                            <p className="card-title">Total Yojana</p>
                        </div>
                        <div className="card-body bg-slate-100">
                            <p className="text-3xl font-bold text-slate-900">
                                {totalyojana !== null ? totalyojana : "Loading..."}
                            </p>
                            <span className="flex w-fit items-center gap-x-2 border border-blue-500 px-2 py-1 font-medium text-blue-500">
                                <TrendingUp size={18} />
                                
                            </span>
                        </div>
                    </div>

                    

                    <div className="card">
                        <div className="card-header">
                            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500">
                                <List size={26} />
                            </div>
                            <p className="card-title">Total Category</p>
                        </div>
                        <div className="card-body bg-slate-100">
                            <p className="text-3xl font-bold text-slate-900">
                            {totalCategory !== null ? totalCategory : "Loading..."}
                            </p>
                            <span className="flex w-fit items-center gap-x-2 border border-blue-500 px-2 py-1 font-medium text-blue-500">
                                <TrendingUp size={18} />
                                
                            </span>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500">
                                <Users size={26} />
                            </div>
                            <p className="card-title">Total Taluka</p>
                        </div>
                        <div className="card-body bg-slate-100">
                            <p className="text-3xl font-bold text-slate-900">
                                {totalTaluka !== null ? totalTaluka : "Loading..."}
                            </p>
                            <span className="flex w-fit items-center gap-x-2 border border-blue-500 px-2 py-1 font-medium text-blue-500">
                                <TrendingUp size={18} />
                            </span>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500">
                                <User size={26} />
                            </div>
                            <p className="card-title">Total User</p>
                        </div>
                        <div className="card-body bg-slate-100">
                            <p className="text-3xl font-bold text-slate-900">
                            {totalUser !== null ? totalUser : "Loading..."}
                            </p>
                            <span className="flex w-fit items-center gap-x-2 border border-blue-500 px-2 py-1 font-medium text-blue-500">
                                <TrendingUp size={18} />
                                
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
