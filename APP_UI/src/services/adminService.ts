
const isAdmin = () => {
   const roles: any = JSON.parse(localStorage.getItem("roles") || "[]");
        return roles?.some((role: any) => role?.name?.toLowerCase() === "admin");
};
export default isAdmin;