function CompleteProfile() {
  return (
    <div>
      <h1>Complete Your Profile</h1>

      <form>
        <input
          type="text"
          placeholder="Bio"
        />

        <br /><br />

        <input
          type="text"
          placeholder="Location"
        />

        <br /><br />

        <input
          type="text"
          placeholder="Profile Picture URL"
        />

        <br /><br />

        <button>
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default CompleteProfile;