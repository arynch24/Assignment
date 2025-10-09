import Navbar from "@/components/navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="bg-gray-50 h-full flex-1">
                {children}
            </div>
        </div>
    );
}
