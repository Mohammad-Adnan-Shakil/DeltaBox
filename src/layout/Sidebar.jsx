import { Home, Users, Flag, BarChart3, Brain } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", icon: Home, path: "/" },
    { name: "Drivers", icon: Users, path: "/drivers" },
    { name: "Teams", icon: Flag, path: "/teams" },
    { name: "Races", icon: BarChart3, path: "/races" },
    { name: "AI Predictions", icon: Brain, path: "/predictions" },
  ];

  return (
    <div className="w-64 h-screen bg-[#0B0B0F] text-white flex flex-col p-6">
      
      {/* Logo */}
      <h1 className="text-2xl font-bold text-[#E10600] mb-10">
        F1 Pulse
      </h1>

      {/* Menu */}
      <nav className="flex flex-col gap-3">
        {menu.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              to={item.path}
              key={index}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive
                  ? "bg-[#1A1A22] text-white"
                  : "text-gray-400 hover:bg-[#1A1A22] hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
};

export default Sidebar;