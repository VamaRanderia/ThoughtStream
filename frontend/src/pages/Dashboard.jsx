import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";

function Dashboard() {
  return (
    <div className="dashboard-container">

      <Sidebar />

      <div className="dashboard-content">

        <div className="dashboard-header">

          <div>
            <h2>Home</h2>

            <p className="text-secondary">
              Share your thoughts. Build meaningful connections.
            </p>
          </div>

        </div>

        <Feed />

      </div>

    </div>
  );
}

export default Dashboard;
