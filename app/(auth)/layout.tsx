import Header from "../components/ui/header";


export default function ({ children,}: Readonly<{ children: React.ReactNode;}>) {
    return (
        <div>
            <Header />
            <div className="">
                {children}
            </div>
        </div>
    )
}
