import StudentSidebar from "../components/teacher-sidebar";
import Header from "../components/ui/header";


export default function ({ children,}: Readonly<{ children: React.ReactNode;}>) {
    return (
        <div>
            <Header />
            <StudentSidebar />
            <div className="ml-[12rem]">
                {children}
            </div>
        </div>
    )
}
