import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
const App = dynamic (() => import("./app"),{ssr:false}); 


// npm i react-admin ra-data-simple-rest
const AdminPage = () => {
     
    if(!isAdmin()) {
        redirect('/');

    }
    return (

        <App />

    );
}


export default AdminPage; 

