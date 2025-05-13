const LocalStorage = {
    // ✅ Save authentication data (token + user details)
    setAuthData: (token, userData) => {
        LocalStorage.clearAuthData(); // 🔥 Clear old data to prevent mismatches
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user_id", userData.id);
        
        if (userData.profile_photo_url) {
            LocalStorage.saveProfilePhoto(userData.profile_photo_url);
        }
    },

    // ✅ Retrieve authentication token
    getToken: () => localStorage.getItem("authToken"),

    // ✅ Retrieve user ID
    getUserId: () => localStorage.getItem("user_id"),

    // ✅ Retrieve user data
    getUserData: () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    // ✅ Save and retrieve profile photo URL
    saveProfilePhoto: (photoUrl) => {
        localStorage.setItem("profile_photo", photoUrl);
    },
    getProfilePhoto: () => localStorage.getItem("profile_photo"),

    // ✅ Remove stored profile photo
    clearProfilePhoto: () => {
        localStorage.removeItem("profile_photo");
    },

    // ✅ Save form preview data
    saveFormPreview: (formId, formData) => {
        localStorage.setItem(`previewForm-${formId}`, JSON.stringify(formData));
    },
    getFormPreview: (formId) => {
        const savedPreview = localStorage.getItem(`previewForm-${formId}`);
        return savedPreview ? JSON.parse(savedPreview) : null;
    },

    // ✅ Save form data for edit mode
    saveFormEditData: (formId, formData) => {
        localStorage.setItem(`form_${formId}`, JSON.stringify(formData));
    },
    getFormEditData: (formId) => {
        const storedForm = localStorage.getItem(`form_${formId}`);
        return storedForm ? JSON.parse(storedForm) : null;
    },

    // ✅ Remove authentication-related data
    clearAuthData: () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("user_id");
        localStorage.removeItem("profile_photo");

        // Remove all stored forms and previews
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("form_") || key.startsWith("previewForm-")) {
                localStorage.removeItem(key);
            }
        });
    },
};

export default LocalStorage;
