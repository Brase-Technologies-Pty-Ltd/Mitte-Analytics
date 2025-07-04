import LocalStorageService from "./localStorage.svc";

const localStorageService = LocalStorageService.getInstance();
const isAdmin = () => {
    const roles: any = localStorageService.getItem("roles");
    return roles && roles?.some((role: any) => role?.name?.toLowerCase() === "admin");
};
export default isAdmin;