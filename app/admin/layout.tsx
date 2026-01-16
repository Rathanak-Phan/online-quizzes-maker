import Header from "../components/ui/header";
import AdminSidebar from "./components/AdminSidebar";


export default function ({ children,}: Readonly<{ children: React.ReactNode;}>) {
    return (
        <div>
            <Header />
            <AdminSidebar />
            <div className="ml-[14rem] pt-4">
                {children}
            </div>
        </div>
    )
}
