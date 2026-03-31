import { axiosi, publicAxios } from "../../config/axios";

const appendValues = (params, key, value) => {
    if (!value) {
        return;
    }

    if (Array.isArray(value)) {
        value.forEach((entry) => params.append(key, entry));
        return;
    }

    params.append(key, value);
};

export const addProduct = async (data) => {
    try {
        const res = await axiosi.post('/products', data);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const fetchProducts = async (filters = {}) => {
    const params = new URLSearchParams();

    appendValues(params, 'brand', filters.brand);
    appendValues(params, 'category', filters.category);

    if (filters.search) params.set('search', filters.search);
  if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice);
  if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice);
    if (filters.rating) params.set('rating', filters.rating);
    if (filters.discount) params.set('discount', filters.discount);
    if (filters.inStock !== undefined) params.set('inStock', filters.inStock);
    if (filters.featured) params.set('featured', filters.featured);
    if (filters.trending) params.set('trending', filters.trending);
    if (filters.bestseller) params.set('bestseller', filters.bestseller);
    if (filters.admin) params.set('admin', 'true');

    if (filters.pagination) {
        params.set('page', filters.pagination.page);
        params.set('limit', filters.pagination.limit);
    }

    if (filters.sort) {
        if (typeof filters.sort === 'string') {
            params.set('sort', filters.sort);
        } else {
            params.set('sort', filters.sort.sort);
            params.set('order', filters.sort.order);
        }
    }

    try {
        const res = await publicAxios.get(`/products?${params.toString()}`);
        const totalResults = Number(res.headers['x-total-count'] || 0);
        return { data: res.data, totalResults };
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const fetchProductById = async (id) => {
    try {
        const res = await publicAxios.get(`/products/${id}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateProductById = async (update) => {
    try {
        const res = await axiosi.patch(`/products/${update._id}`, update);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const undeleteProductById = async (id) => {
    try {
        const res = await axiosi.patch(`/products/undelete/${id}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteProductById = async (id) => {
    try {
        const res = await axiosi.delete(`/products/${id}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
