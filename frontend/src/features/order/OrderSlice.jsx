import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { cancelOrderById, createOrder, getAllOrders, getCheckoutPreview, getOrderById, getOrderByUserId, updateOrderById } from './OrderApi'


const initialState={
    status:"idle",
    orderUpdateStatus:"idle",
    orderFetchStatus:"idle",
    checkoutPreviewStatus:"idle",
    orders:[],
    currentOrder:null,
    orderDetails:null,
    checkoutPreview:null,
    errors:null,
    successMessage:null
}

export const createOrderAsync=createAsyncThunk("orders/createOrderAsync",async(order)=>{
    const createdOrder=await createOrder(order)
    return createdOrder
})

export const getAllOrdersAsync=createAsyncThunk("orders/getAllOrdersAsync",async()=>{
    const orders=await getAllOrders()
    return orders
})

export const getOrderByUserIdAsync=createAsyncThunk("orders/getOrderByUserIdAsync",async(id)=>{
    const orders=await getOrderByUserId(id)
    return orders
})

export const getOrderByIdAsync=createAsyncThunk("orders/getOrderByIdAsync",async(id)=>{
    const order=await getOrderById(id)
    return order
})

export const getCheckoutPreviewAsync=createAsyncThunk("orders/getCheckoutPreviewAsync",async(params)=>{
    const preview=await getCheckoutPreview(params)
    return preview
})

export const cancelOrderByIdAsync=createAsyncThunk("orders/cancelOrderByIdAsync",async(payload)=>{
    const updated=await cancelOrderById(payload)
    return updated
})

export const updateOrderByIdAsync=createAsyncThunk("orders/updateOrderByIdAsync",async(update)=>{
    const updatedOrder=await updateOrderById(update)
    return updatedOrder
})

const orderSlice=createSlice({
    name:'orderSlice',
    initialState:initialState,
    reducers:{
        resetCurrentOrder:(state)=>{
            state.currentOrder=null
        },
        resetOrderUpdateStatus:(state)=>{
            state.orderUpdateStatus='idle'
        },
        resetOrderFetchStatus:(state)=>{
            state.orderFetchStatus='idle'
        },
        resetCheckoutPreview:(state)=>{
            state.checkoutPreview=null
            state.checkoutPreviewStatus='idle'
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(createOrderAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(createOrderAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.orders.push(action.payload)
                state.currentOrder=action.payload
            })
            .addCase(createOrderAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(getAllOrdersAsync.pending,(state)=>{
                state.orderFetchStatus='pending'
            })
            .addCase(getAllOrdersAsync.fulfilled,(state,action)=>{
                state.orderFetchStatus='fulfilled'
                state.orders=action.payload
            })
            .addCase(getAllOrdersAsync.rejected,(state,action)=>{
                state.orderFetchStatus='rejected'
                state.errors=action.error
            })

            .addCase(getOrderByUserIdAsync.pending,(state)=>{
                state.orderFetchStatus='pending'
            })
            .addCase(getOrderByUserIdAsync.fulfilled,(state,action)=>{
                state.orderFetchStatus='fulfilled'
                state.orders=action.payload
            })
            .addCase(getOrderByUserIdAsync.rejected,(state,action)=>{
                state.orderFetchStatus='rejected'
                state.errors=action.error
            })

            .addCase(getOrderByIdAsync.pending,(state)=>{
                state.orderFetchStatus='pending'
            })
            .addCase(getOrderByIdAsync.fulfilled,(state,action)=>{
                state.orderFetchStatus='fulfilled'
                state.orderDetails=action.payload
            })
            .addCase(getOrderByIdAsync.rejected,(state,action)=>{
                state.orderFetchStatus='rejected'
                state.errors=action.error
            })

            .addCase(getCheckoutPreviewAsync.pending,(state)=>{
                state.checkoutPreviewStatus='pending'
            })
            .addCase(getCheckoutPreviewAsync.fulfilled,(state,action)=>{
                state.checkoutPreviewStatus='fulfilled'
                state.checkoutPreview=action.payload
            })
            .addCase(getCheckoutPreviewAsync.rejected,(state,action)=>{
                state.checkoutPreviewStatus='rejected'
                state.errors=action.error
            })

            .addCase(updateOrderByIdAsync.pending,(state)=>{
                state.orderUpdateStatus='pending'
            })
            .addCase(updateOrderByIdAsync.fulfilled,(state,action)=>{
                state.orderUpdateStatus='fulfilled'
                const index=state.orders.findIndex((order)=>order._id===action.payload._id)
                if(index>=0){
                    state.orders[index]=action.payload
                }
                state.orderDetails=action.payload
            })
            .addCase(updateOrderByIdAsync.rejected,(state,action)=>{
                state.orderUpdateStatus='rejected'
                state.errors=action.error
            })

            .addCase(cancelOrderByIdAsync.fulfilled,(state,action)=>{
                const index=state.orders.findIndex((order)=>order._id===action.payload._id)
                if(index>=0){
                    state.orders[index]=action.payload
                }
                state.orderDetails=action.payload
            })
    }
})

// exporting reducers
export const {resetCurrentOrder,resetOrderUpdateStatus,resetOrderFetchStatus,resetCheckoutPreview}=orderSlice.actions

// exporting selectors
export const selectOrderStatus=(state)=>state.OrderSlice.status
export const selectOrders=(state)=>state.OrderSlice.orders
export const selectOrdersErrors=(state)=>state.OrderSlice.errors
export const selectOrdersSuccessMessage=(state)=>state.OrderSlice.successMessage
export const selectCurrentOrder=(state)=>state.OrderSlice.currentOrder
export const selectOrderUpdateStatus=(state)=>state.OrderSlice.orderUpdateStatus
export const selectOrderFetchStatus=(state)=>state.OrderSlice.orderFetchStatus
export const selectOrderDetails=(state)=>state.OrderSlice.orderDetails
export const selectCheckoutPreview=(state)=>state.OrderSlice.checkoutPreview
export const selectCheckoutPreviewStatus=(state)=>state.OrderSlice.checkoutPreviewStatus

export default orderSlice.reducer
