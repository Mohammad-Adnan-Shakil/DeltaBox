import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 bg-[#111111] min-h-screen text-white p-6">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;