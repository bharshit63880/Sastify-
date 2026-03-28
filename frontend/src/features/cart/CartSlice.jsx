import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { GUEST_CART_STORAGE_KEY } from '../../constants'
import { addToCart, fetchCartByUserId, updateCartItemById, deleteCartItemById, resetCartByUserId } from './CartApi'

const readGuestCart = () => {
    try {
        return JSON.parse(window.localStorage.getItem(GUEST_CART_STORAGE_KEY) || '[]')
    } catch (error) {
        return []
    }
}

const writeGuestCart = (items) => {
    window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items))
}

const initialState = {
    status: "idle",
    items: typeof window !== "undefined" ? readGuestCart() : [],
    cartItemAddStatus: "idle",
    cartItemRemoveStatus: "idle",
    errors: null,
    successMessage: null,
    isGuestCart: true,
}

export const addToCartAsync = createAsyncThunk('cart/addToCartAsync', async (item) => {
    const addedItem = await addToCart(item)
    return addedItem
})

export const fetchCartByUserIdAsync = createAsyncThunk('cart/fetchCartByUserIdAsync', async () => {
    const items = await fetchCartByUserId()
    return items
})

export const updateCartItemByIdAsync = createAsyncThunk('cart/updateCartItemByIdAsync', async (update) => {
    const updatedItem = await updateCartItemById(update)
    return updatedItem
})

export const deleteCartItemByIdAsync = createAsyncThunk('cart/deleteCartItemByIdAsync', async (id) => {
    const deletedItem = await deleteCartItemById(id)
    return deletedItem
})

export const resetCartByUserIdAsync = createAsyncThunk('cart/resetCartByUserIdAsync', async () => {
    await resetCartByUserId()
    return []
})

export const syncGuestCartAsync = createAsyncThunk('cart/syncGuestCartAsync', async (guestItems, thunkAPI) => {
    for (const item of guestItems) {
        await addToCart({
            product: item.product._id,
            quantity: item.quantity,
            size: item.size || "",
            color: item.color || "",
        })
    }

    thunkAPI.dispatch(clearGuestCart())
    const items = await fetchCartByUserId()
    return items
})

const cartSlice = createSlice({
    name: "cartSlice",
    initialState,
    reducers: {
        resetCartItemAddStatus: (state) => {
            state.cartItemAddStatus = 'idle'
        },
        resetCartItemRemoveStatus: (state) => {
            state.cartItemRemoveStatus = 'idle'
        },
        hydrateGuestCart: (state) => {
            state.items = readGuestCart()
            state.isGuestCart = true
        },
        addGuestCartItem: (state, action) => {
            state.cartItemAddStatus = 'fulfilled'
            state.isGuestCart = true
            const existingIndex = state.items.findIndex((item) => item.product._id === action.payload.product._id)

            if (existingIndex >= 0) {
                state.items[existingIndex].quantity += action.payload.quantity || 1
            } else {
                state.items.push({
                    _id: `guest-${action.payload.product._id}`,
                    product: action.payload.product,
                    quantity: action.payload.quantity || 1,
                    size: action.payload.size || "",
                    color: action.payload.color || "",
                })
            }

            writeGuestCart(state.items)
        },
        updateGuestCartItem: (state, action) => {
            state.isGuestCart = true
            const item = state.items.find((cartItem) => cartItem._id === action.payload.id)
            if (item) {
                item.quantity = action.payload.quantity
            }
            writeGuestCart(state.items)
        },
        removeGuestCartItem: (state, action) => {
            state.cartItemRemoveStatus = 'fulfilled'
            state.isGuestCart = true
            state.items = state.items.filter((item) => item._id !== action.payload)
            writeGuestCart(state.items)
        },
        clearGuestCart: (state) => {
            state.items = []
            state.isGuestCart = true
            writeGuestCart([])
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addToCartAsync.pending, (state) => {
                state.cartItemAddStatus = 'pending'
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.cartItemAddStatus = 'fulfilled'
                state.isGuestCart = false
                const index = state.items.findIndex((item) => item._id === action.payload._id)
                if (index >= 0) {
                    state.items[index] = action.payload
                } else {
                    state.items.push(action.payload)
                }
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.cartItemAddStatus = 'rejected'
                state.errors = action.error
            })
            .addCase(fetchCartByUserIdAsync.pending, (state) => {
                state.status = 'pending'
            })
            .addCase(fetchCartByUserIdAsync.fulfilled, (state, action) => {
                state.status = 'fulfilled'
                state.isGuestCart = false
                state.items = action.payload
            })
            .addCase(fetchCartByUserIdAsync.rejected, (state, action) => {
                state.status = 'rejected'
                state.errors = action.error
            })
            .addCase(updateCartItemByIdAsync.pending, (state) => {
                state.status = 'pending'
            })
            .addCase(updateCartItemByIdAsync.fulfilled, (state, action) => {
                state.status = 'fulfilled'
                const index = state.items.findIndex((item) => item._id === action.payload._id)
                if (index >= 0) {
                    state.items[index] = action.payload
                }
            })
            .addCase(updateCartItemByIdAsync.rejected, (state, action) => {
                state.status = 'rejected'
                state.errors = action.error
            })
            .addCase(deleteCartItemByIdAsync.pending, (state) => {
                state.cartItemRemoveStatus = 'pending'
            })
            .addCase(deleteCartItemByIdAsync.fulfilled, (state, action) => {
                state.cartItemRemoveStatus = 'fulfilled'
                state.items = state.items.filter((item) => item._id !== action.payload._id)
            })
            .addCase(deleteCartItemByIdAsync.rejected, (state, action) => {
                state.cartItemRemoveStatus = 'rejected'
                state.errors = action.error
            })
            .addCase(resetCartByUserIdAsync.pending, (state) => {
                state.status = 'pending'
            })
            .addCase(resetCartByUserIdAsync.fulfilled, (state) => {
                state.status = 'fulfilled'
                state.isGuestCart = false
                state.items = []
            })
            .addCase(resetCartByUserIdAsync.rejected, (state, action) => {
                state.status = 'rejected'
                state.errors = action.error
            })
            .addCase(syncGuestCartAsync.fulfilled, (state, action) => {
                state.status = 'fulfilled'
                state.isGuestCart = false
                state.items = action.payload
            })
    }
})

export const selectCartStatus = (state) => state.CartSlice.status
export const selectCartItems = (state) => state.CartSlice.items
export const selectCartErrors = (state) => state.CartSlice.errors
export const selectCartSuccessMessage = (state) => state.CartSlice.successMessage
export const selectCartItemAddStatus = (state) => state.CartSlice.cartItemAddStatus
export const selectCartItemRemoveStatus = (state) => state.CartSlice.cartItemRemoveStatus
export const selectIsGuestCart = (state) => state.CartSlice.isGuestCart

export const {
    resetCartItemAddStatus,
    resetCartItemRemoveStatus,
    hydrateGuestCart,
    addGuestCartItem,
    updateGuestCartItem,
    removeGuestCartItem,
    clearGuestCart,
} = cartSlice.actions

export default cartSlice.reducer
