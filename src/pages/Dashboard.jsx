import PointsChart from "../components/PointChart";
import StatCard from "../components/StatCard";
import DriverTable from "../components/DriverTable";
const Dashboard = () => {
  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      {/* Cards Section */}
      <div className="grid grid-cols-3 gap-6">

  <StatCard title="Total Races" value="23" />
  <StatCard title="Drivers" value="20" />
  <StatCard title="Teams" value="10" />

</div>
      <PointsChart />
      <DriverTable />

    </div>
  );
};

export default Dashboard;