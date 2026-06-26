import { useEffect, useState } from "react";
import api from "../../api/axios";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        setProfile(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!profile) {
    return <p>Profile not found</p>;
  }

  const {
    reviewSummary = {
      averageRating: 0,
      reviewCount: 0,
      reviewHistory: [],
    },
  } = profile;

  return (
    <div>
      <h1>Profile</h1>

      <p>Role: {profile.role}</p>
      <p>
        Name: {profile.companyName || profile.name}
      </p>
      <p>Email: {profile.email}</p>
      <p>Average Rating: {reviewSummary.averageRating}</p>
      <p>Number of Reviews: {reviewSummary.reviewCount}</p>

      <hr />

      <h2>Review History</h2>

      {reviewSummary.reviewHistory.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviewSummary.reviewHistory.map((review) => (
          <div
            key={review.id}
            style={{
              border: "1px solid black",
              marginBottom: "10px",
              padding: "10px",
            }}
          >
            <p>Task Title: {review.taskTitle}</p>
            <p>Rating: {review.rating}</p>
            <p>Comment: {review.comment}</p>
            <p>Reviewer: {review.reviewer}</p>
            <p>
              Date:{" "}
              {new Date(review.date).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default Profile;
