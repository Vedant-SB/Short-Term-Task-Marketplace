import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { ELIGIBLE_LABELS } from "../tasks/taskFormConstants";

function Profile() {

  const { userId } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile =
    !userId || userId === user?.userId;

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        if (isOwnProfile) {

          const profileRes =
            await api.get("/auth/profile");

          const statsRes =
            await api.get(
              `/profiles/${user.userId}`
            );

          setProfile({
            ...profileRes.data,
            ...statsRes.data.profile,
          });

        } else {

          const response =
            await api.get(
              `/profiles/${userId}`
            );

          setProfile(response.data.profile);

        }

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

  }, [userId, user?.userId, isOwnProfile]);

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
    statistics = {},
    reviewSummary = {
      averageRating: 0,
      reviewCount: 0,
      reviewHistory: [],
    },
    portfolio = [],
    profileStatus = "Available",
    activeTaskCount = 0,
  } = profile;

  return (
    <div>

      <h1>Profile</h1>

      {/* =============================== */}
      {/* PROFILE STATUS                   */}
      {/* =============================== */}

      <p>
        <strong>
          {profile.role === "company"
            ? "Company Status"
            : "Status"}
        </strong>{" "}
        {profileStatus}
      </p>

      <p>
        <strong>
          {profile.role === "company"
            ? "Active Projects"
            : "Current Active Tasks"}
        </strong>{" "}
        {activeTaskCount}
      </p>

      <hr />

      {/* =============================== */}
      {/* PERSONAL DETAILS                 */}
      {/* =============================== */}

      <h2>Personal Details</h2>

      <p>
        <strong>Name:</strong>{" "}
        {profile.companyName || profile.name}
      </p>

      {profile.role === "individual" && (
        <>

          <p>
            <strong>Type:</strong>{" "}
            {ELIGIBLE_LABELS[profile.individualType] ||
              profile.individualType}
          </p>

          {profile.college && (
            <p>
              <strong>College:</strong>{" "}
              {profile.college}
            </p>
          )}

          {profile.yearsOfExperience !== undefined &&
            profile.yearsOfExperience !== null && (
              <p>
                <strong>Experience:</strong>{" "}
                {profile.yearsOfExperience} years
              </p>
            )}

          {profile.primaryDomain && (
            <p>
              <strong>Primary Domain:</strong>{" "}
              {profile.primaryDomain}
            </p>
          )}

        </>
      )}

      {profile.role === "company" && (
        <>
          {profile.industry && (
            <p>
              <strong>Industry:</strong>{" "}
              {profile.industry}
            </p>
          )}

          {profile.website && (
            <p>
              <strong>Website:</strong>{" "}
              {profile.website}
            </p>
          )}
        </>
      )}

      {profile.createdAt && (
        <p>
          <strong>Member Since:</strong>{" "}
          {new Date(
            profile.createdAt
          ).toLocaleDateString()}
        </p>
      )}

      <hr />

      {/* =============================== */}
      {/* SKILLS                           */}
      {/* =============================== */}

      {profile.skills &&
        profile.skills.length > 0 && (
          <>

            <h2>Skills</h2>

            <p>
              {profile.skills.join(", ")}
            </p>

            <hr />

          </>
        )}

      {/* =============================== */}
      {/* STATISTICS                       */}
      {/* =============================== */}

      <h2>Statistics</h2>

      <p>
        <strong>Average Rating:</strong>{" "}
        {statistics.averageRating || reviewSummary.averageRating || 0}
      </p>

      <p>
        <strong>Total Reviews:</strong>{" "}
        {statistics.totalReviews || reviewSummary.reviewCount || 0}
      </p>

      {profile.role === "individual" ? (
        <>

          <p>
            <strong>Completed Tasks:</strong>{" "}
            {statistics.completedTasks || 0}
          </p>

          <p>
            <strong>Portfolio Projects:</strong>{" "}
            {statistics.portfolioProjects || 0}
          </p>

          <p>
            <strong>Applications Accepted:</strong>{" "}
            {statistics.applicationsAccepted || 0}
          </p>

          <p>
            <strong>Applications Completed:</strong>{" "}
            {statistics.applicationsCompleted || 0}
          </p>

        </>
      ) : (
        <>

          <p>
            <strong>Tasks Posted:</strong>{" "}
            {statistics.tasksPosted || 0}
          </p>

          <p>
            <strong>Open Tasks:</strong>{" "}
            {statistics.openTasks || 0}
          </p>

          <p>
            <strong>Active Projects:</strong>{" "}
            {statistics.activeProjects || 0}
          </p>

          <p>
            <strong>Under Review:</strong>{" "}
            {statistics.underReview || 0}
          </p>

          <p>
            <strong>Revision Requested:</strong>{" "}
            {statistics.revisionRequested || 0}
          </p>

          <p>
            <strong>Completed Projects:</strong>{" "}
            {statistics.completedProjects || 0}
          </p>

          <p>
            <strong>Individuals Hired:</strong>{" "}
            {statistics.individualsHired || 0}
          </p>

        </>
      )}

      <hr />

      {/* =============================== */}
      {/* REVIEWS                          */}
      {/* =============================== */}

      <h2>Reviews</h2>

      {reviewSummary.reviewHistory.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviewSummary.reviewHistory.map(
          (review) => (

            <div
              key={review.id}
              style={{
                border: "1px solid black",
                marginBottom: "10px",
                padding: "10px",
              }}
            >

              <p>
                <strong>
                  {profile.role === "company"
                    ? "Individual"
                    : "Company"}
                  :
                </strong>{" "}
                {review.reviewer}
              </p>

              <p>
                <strong>Rating:</strong>{" "}
                {review.rating}
              </p>

              <p>
                <strong>Comment:</strong>{" "}
                {review.comment}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(
                  review.date
                ).toLocaleDateString()}
              </p>

            </div>

          )
        )
      )}

      <hr />

      {/* =============================== */}
      {/* PORTFOLIO                        */}
      {/* =============================== */}



      {profile.role === "individual" && (
        <>
          <h2>Portfolio</h2>
          {portfolio.length === 0 ? (
            <p>No completed projects yet.</p>
          ) : (
            portfolio.map(
              (project) => (

                <div
                  key={project.taskId}
                  style={{
                    border: "1px solid black",
                    marginBottom: "10px",
                    padding: "10px",
                  }}
                >

                  <h3>
                    {project.title}
                  </h3>

                  <p>
                    <strong>Category:</strong>{" "}
                    {project.category}
                  </p>

                  <p>
                    <strong>Skills Used:</strong>{" "}
                    {project.skillsUsed?.join(", ")}
                  </p>

                  <p>
                    <strong>Completion Date:</strong>{" "}
                    {new Date(
                      project.completedOn
                    ).toLocaleDateString()}
                  </p>

                  {project.companyRating && (
                    <p>
                      <strong>Company Rating:</strong>{" "}
                      {project.companyRating}
                    </p>
                  )}

                  {project.companyReview && (
                    <p>
                      <strong>Company Review:</strong>{" "}
                      {project.companyReview}
                    </p>
                  )}

                </div>

              )
            )
          )}
        </>
      )}

    </div>
  );
}

export default Profile;
