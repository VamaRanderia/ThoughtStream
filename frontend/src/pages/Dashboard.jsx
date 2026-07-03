import Sidebar from "../components/Sidebar";

function Dashboard() {
  return (
    <div className="dashboard-container">

      <Sidebar />

      <div className="dashboard-content">

        <div className="dashboard-header">

          <div>
            <h2>Welcome back,👋</h2>

            <p className="text-secondary">
              Share your thoughts. Build meaningful connections.
            </p>
          </div>

        </div>

        <div className="home-card">

          <p className="home-text">
            Feed will appear here.
          </p>

          <p className="text-secondary">
            Posts, comments and interactions will be added in future phases.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;