import { publicAxios } from "../../config/axios";

export const fetchAllBrands=async()=>{
    try {
        const res=await publicAxios.get("/brands")
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}
