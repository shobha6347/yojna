import { ChartColumn, Home, NotepadText, Plus , Package, PackagePlus, Settings,ShoppingBag, UserCheck, UserPlus, Users, MapPinHouse, Landmark } from "lucide-react";



export const navbarLinks = [
    {
        title: "Dashboard",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/",
            },
            
        ],
    },
    {
        title: "Schemes",
        links: [
            {
                label: "Category",
                icon: Package,
                path: "/category",
            },
            {
                label: "Sub Category",
                icon: Package,
                path: "/subcategory",
            },
            {
                label: "Yojana",
                icon: Package,
                path: "/yojana",
            },
            {
                label: "Yojana Vice Documet",
                icon: ShoppingBag,
                path: "/document-yojana",
            },
            {
                label: "Document",
                icon: ShoppingBag,
                path: "/document",
            },
        ],
    },
    {
        title: "Manage",
        links: [
            {
                label: "Taluka",
                icon: MapPinHouse,
                path: "/taluka",
            },
            {
                label: "Gram Panchayat",
                icon: Landmark ,
                path: "/gram-panchayat",
            },
            {
                label: "Village",
                icon: Landmark ,
                path: "/village",
            },
        ],
    },
    {
        title: "Users",
        links: [
            {
                label: "Users",
                icon: Users,
                path: "/user",
            },
        ],
    },
    
    {
        title: "Settings",
        links: [
            {
                label: "Settings",
                icon: Settings,
                path: "/setting",
            },
            {
                label: "Login",
                icon: Settings,
                path: "/login",
            },
            {
                label: "Register",
                icon: Settings,
                path: "/register",
            },
        ],
    },
];


