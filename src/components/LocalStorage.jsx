const LocalStorage = {
    // ✅ Save authentication data (token + user details)
    setAuthData: (token, userData) => {
        LocalStorage.clearAuthData(); // 🔥 Clear old data to prevent mismatches
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user_id", userData.id); // ✅ Ensure user_id is stored
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

    // ✅ Save form preview data (for local preview only)
    saveFormPreview: (formId, formData) => {
        localStorage.setItem(`previewForm-${formId}`, JSON.stringify(formData));
    },

    // ✅ Retrieve form preview data
    getFormPreview: (formId) => {
        const savedPreview = localStorage.getItem(`previewForm-${formId}`);
        return savedPreview ? JSON.parse(savedPreview) : null;
    },

    // ✅ Save form data for persistence in edit mode
    saveFormEditData: (formId, formData) => {
        localStorage.setItem(`form_${formId}`, JSON.stringify(formData));
    },

    // ✅ Retrieve form data (useful when navigating back from preview)
    getFormEditData: (formId) => {
        const storedForm = localStorage.getItem(`form_${formId}`);
        return storedForm ? JSON.parse(storedForm) : null;
    },

    // ✅ Remove authentication-related data only
    clearAuthData: () => {
        const userId = localStorage.getItem("user_id"); // Get user ID before clearing

        if (userId) {
            // Remove user-related keys dynamically
            Object.keys(localStorage).forEach((key) => {
                if (
                    key.includes(userId) ||  // Any key directly containing user_id
                    key.startsWith("form_") ||  // Form edit data
                    key.startsWith("previewForm-") // Form previews
                ) {
                    localStorage.removeItem(key);
                }
            });
        }

        // Remove authentication-related data
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("user_id");
    },
};

export default LocalStorage;
