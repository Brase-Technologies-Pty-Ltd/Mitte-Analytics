const checkUserRole = (requiredRoles: string[]): boolean => {
    try {
      const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");
        const userRoles = userDetails.roles || [];
  
      return requiredRoles.some(role => userRoles.includes(role));
    } catch (error) {
      return false;
    }
  };
  
export default checkUserRole;
