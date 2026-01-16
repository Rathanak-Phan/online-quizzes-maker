import Header from "../components/ui/header";
import AdminSidebar from "../components/AdminSidebar";


export default function ({ children,}: Readonly<{ children: React.ReactNode;}>) {
    return (
        <div>
            <Header />
            <AdminSidebar />
            <div className="ml-[4rem] pt-20">
                {children}
            </div>
        </div>
    )
}
