import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectBrands } from '../features/brands/BrandSlice'
import { selectCategories } from '../features/categories/CategoriesSlice'
import { ProductEditorForm } from '../features/admin/components/ProductEditorForm'
import { fetchProductById } from '../features/products/ProductApi'

export const ProductUpdatePage = () => {
  const { id } = useParams()
  const categories = useSelector(selectCategories)
  const brands = useSelector(selectBrands)
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetchProductById(id).then(setProduct)
  }, [id])

  return <ProductEditorForm product={product} categories={categories} brands={brands} mode="edit" />
}
