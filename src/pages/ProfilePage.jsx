import React, { useEffect, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/Sidebar";
import api from "../api";
import LocalStorage from "../components/localStorage";
import "../styles/ProfilePage.css";
import getCroppedImg from "../components/cropImage";

const ProfilePage = () => {
    const [user, setUser] = useState({
        name: "",
        email: "",
        dob: "",
        profile_photo_url: "",
    });

    const [editingField, setEditingField] = useState(null);
    const [updatedUser, setUpdatedUser] = useState({ ...user });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isCropping, setIsCropping] = useState(false);

    // Cropper States
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Handle cropping complete
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split("T")[0];
    };

    const fetchProfileData = async () => {
        try {
            const response = await api.get("/profile");
            setUser(response.data);
            setUpdatedUser(response.data);

            // ✅ Use API URL or fallback to localStorage
            const savedPhoto = LocalStorage.getProfilePhoto();
            setPhotoPreview(response.data.profile_photo_url || savedPhoto || null);

            // ✅ Save user data to localStorage
            LocalStorage.setAuthData(LocalStorage.getToken(), response.data);
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUser({ ...updatedUser, [name]: value });
    };

    const handleUpdateProfile = async (field) => {
        if (!updatedUser[field]) {
            alert(`${field} cannot be empty.`);
            return;
        }

        try {
            const response = await api.put("/user/update", { [field]: updatedUser[field] });
            setUser(response.data.user);
            setEditingField(null);

            // ✅ Update localStorage
            LocalStorage.setAuthData(LocalStorage.getToken(), response.data.user);
        } catch (error) {
            console.error("Profile update failed:", error);
            alert("Failed to update profile. Please try again.");
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewURL = URL.createObjectURL(file);
            setProfilePhoto(file);
            setPhotoPreview(previewURL);
            setIsCropping(true); // Open cropper modal
        }
    };

    const handlePhotoUpload = async () => {
        if (!profilePhoto || !croppedAreaPixels) return;

        try {
            const croppedImageBlob = await getCroppedImg(photoPreview, croppedAreaPixels);
            const formData = new FormData();
            formData.append("profile_photo", croppedImageBlob, "cropped-image.jpg");

            const response = await api.post("/profile/photo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            const updatedPhotoUrl = response.data.profile_photo_url;
            if (updatedPhotoUrl) {
                LocalStorage.saveProfilePhoto(updatedPhotoUrl);
                setPhotoPreview(updatedPhotoUrl);
            }

            setShowSuccessModal(true);
            setTimeout(() => {
                fetchProfileData();
                setShowSuccessModal(false);
            }, 3000);
        } catch (error) {
            console.error("Failed to upload profile photo:", error);
            alert("Failed to upload profile photo.");
        } finally {
            setIsCropping(false);
        }
    };

    const handleRemovePhoto = async () => {
        try {
            await api.delete("/profile/photo");

            setUser((prevUser) => ({
                ...prevUser,
                profile_photo_url: "",
            }));

            setPhotoPreview(null);
            setProfilePhoto(null);
            LocalStorage.clearProfilePhoto();

            alert("Profile photo removed successfully.");
        } catch (error) {
            console.error("Photo removal failed:", error);
            alert("Failed to remove profile photo.");
        }
    };

    return (
        <div className="sgf-profile-container">
            <Sidebar />
            <div className="sgf-profile-main">
                <div className="sgf-profile-content">
                    <DashboardHeader />
                    <div className="sgf-profile-card">
                        <h1 className="sgf-profile-title">Your Account</h1>

                        <div className="sgf-profile-photo-section">
                            <span className="sgf-photo-label">Profile Photo</span>
                            <img
                                src={photoPreview || user.profile_photo_url || "default-photo-url"}
                                alt="Profile"
                                className="sgf-profile-image"
                                onError={(e) => (e.target.src = "default-photo-url")} // Fallback if image fails
                            />

                            <div className="sgf-photo-actions">
                                <button className="sgf-remove-btn" onClick={handleRemovePhoto} disabled={!photoPreview}>
                                    <strong>Remove</strong>
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="fileInput"
                                    style={{ display: "none" }}
                                    onChange={handlePhotoChange}
                                />
                                <button className="sgf-change-btn" onClick={() => document.getElementById("fileInput").click()}>
                                    Change
                                </button>
                            </div>
                        </div>

                        {/* Cropper Modal */}
                        {isCropping && (
                            <div className="sgf-crop-modal">
                                <h2>Crop Your Photo</h2>
                                <div className="crop-container">
                                    <Cropper
                                        image={photoPreview}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={onCropComplete}
                                    />
                                </div>
                                <div className="sgf-crop-buttons">
                                    <button onClick={() => setIsCropping(false)}>Cancel</button>
                                    <button onClick={handlePhotoUpload}>Save</button>
                                </div>
                            </div>
                        )}

                        {/* Success Modal */}
                        {showSuccessModal && (
                            <div className="sgf-success-modal">
                                <p>Profile photo updated successfully!</p>
                            </div>
                        )}

                        <div className="sgf-info-section">
                            {["name", "email", "dob"].map((field) => (
                                <div className="sgf-info-row" key={field}>
                                    <div className="sgf-info-text">
                                        <span>{field === "dob" ? "Birthdate" : field.charAt(0).toUpperCase() + field.slice(1)}</span>
                                        {editingField === field ? (
                                            <input type={field === "dob" ? "date" : "text"} name={field} value={updatedUser[field] || ""} onChange={handleInputChange} />
                                        ) : (
                                            <span>{field === "dob" ? formatDate(user[field]) : user[field]}</span>
                                        )}
                                    </div>
                                    <div className="sgf-button-group">
                                        {editingField === field ? (
                                            <>
                                                <button className="sgf-save-btn" onClick={() => handleUpdateProfile(field)}>Save</button>
                                                <button className="sgf-cancel-btn" onClick={() => setEditingField(null)}>Cancel</button>
                                            </>
                                        ) : (
                                            <button className="sgf-edit-btn" onClick={() => setEditingField(field)}>Edit</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
