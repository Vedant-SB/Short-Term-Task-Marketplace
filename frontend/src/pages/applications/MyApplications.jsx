import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

function MyApplications() {

    const { user } = useAuth();

    const [applications, setApplications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    if (user?.role !== "individual") {
        return <Navigate to="/" />;
    }

    useEffect(() => {

        const fetchApplications =
            async () => {

                try {

                    const response =
                        await api.get(
                            "/applications/my-applications"
                        );

                    console.log(
                        response.data
                    );

                    setApplications(
                        response.data.applications
                    );

                } catch (error) {

                    console.log(error);

                } finally {

                    setLoading(false);

                }

            };

        fetchApplications();

    }, []);

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div>

            <h1>
                My Applications
            </h1>

            {applications.length === 0 ? (
                <p>
                    No Applications Yet
                </p>
            ) : (

                applications.map(
                    (application) => (

                        <div
                            key={application._id}
                            style={{
                                border:
                                    "1px solid black",
                                marginBottom: "10px",
                                padding: "10px",
                            }}
                        >

                            <h3>
                                {
                                    application.taskId
                                        ?.title
                                }
                            </h3>

                            <p>
                                Company:
                                {
                                    application.taskId
                                        ?.postedBy
                                        ?.companyName
                                }
                            </p>

                            <p>
                                Budget:
                                ₹
                                {
                                    application.taskId
                                        ?.budget
                                }
                            </p>

                            <p>
                                Status:
                                {
                                    application.status
                                }
                            </p>

                        </div>

                    )
                )

            )}

        </div>
    );
}

export default MyApplications;