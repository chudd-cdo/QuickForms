const LocalStorage = {
    // ✅ Save login data (Clears old data to prevent mismatches)
    setAuthData: (token, userData) => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(userData));
      },
     
  
    // ✅ Get stored token
    getToken: () => localStorage.getItem("authToken"),
  
    // ✅ Get stored user data
    getUserData: () => {
        try {
          const user = localStorage.getItem("user");
          return user ? JSON.parse(user) : null;
        } catch (error) {
          console.error("Error parsing user data:", error);
          return null;
        }
     },
     
  
    // ✅ Save form preview data
    saveFormPreview: (formId, formData) => {
      localStorage.setItem(`previewForm-${formId}`, JSON.stringify(formData));
    },
  
    // ✅ Get form preview data
    getFormPreview: (formId) => {
      const savedPreview = localStorage.getItem(`previewForm-${formId}`);
      return savedPreview ? JSON.parse(savedPreview) : null;
    },
  
    // ✅ Clear all localStorage (on logout)
    clearAuthData: () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
     },
     
  };
  
  export default LocalStorage;
  