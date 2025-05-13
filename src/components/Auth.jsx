const Auth = {
    getToken: () => localStorage.getItem("authToken"),
    getUserId: () => localStorage.getItem("user_id"),
    isAuthenticated: () => !!localStorage.getItem("authToken"),
    logout: () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user_id");
    },
  };
  
  export default Auth;