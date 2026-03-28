import React from 'react'
import { useSelector } from 'react-redux'
import { selectBrands } from '../features/brands/BrandSlice'
import { selectCategories } from '../features/categories/CategoriesSlice'
import { ProductEditorForm } from '../features/admin/components/ProductEditorForm'

export const AddProductPage = () => {
  const categories = useSelector(selectCategories)
  const brands = useSelector(selectBrands)

  return <ProductEditorForm categories={categories} brands={brands} mode="create" />
}
