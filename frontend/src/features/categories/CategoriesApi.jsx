import { publicAxios } from "../../config/axios"

export const fetchAllCategories=async()=>{
    try {
        const res=await publicAxios.get("/categories")
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}
