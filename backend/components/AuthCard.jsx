function AuthCard({ title, children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1 className="logo">
          ThoughtStream
        </h1>

        <h3 className="auth-title">
          {title}
        </h3>

        {children}

      </div>
    </div>
  );
}

export default AuthCard;