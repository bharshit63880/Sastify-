import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { PageWrapper } from "../../../components/ui/PageWrapper";
import { addProduct, updateProductById } from "../../products/ProductApi";

const specsToText = (specs = []) => specs.map((item) => `${item.label}:${item.value}`).join("\n");

export const ProductEditorForm = ({ product, categories, brands, mode = "create" }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      category: "",
      brand: "",
      price: 0,
      originalPrice: 0,
      stock: 0,
      status: "active",
      images: "",
      highlights: "",
      specs: "",
      colors: "",
      sizes: "",
      featured: false,
      trending: false,
      bestseller: false,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        category: product.category?._id || product.category || "",
        brand: product.brand?._id || product.brand || "",
        images: (product.images || []).join(", "),
        highlights: (product.highlights || []).join("\n"),
        specs: specsToText(product.specs),
        colors: (product.colors || []).join(", "),
        sizes: (product.sizes || []).join(", "),
      });
    }
  }, [product, reset]);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      price: Number(values.price),
      originalPrice: Number(values.originalPrice),
      stock: Number(values.stock),
      images: values.images,
      highlights: values.highlights,
      colors: values.colors,
      sizes: values.sizes,
      specs: values.specs
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, ...rest] = line.split(":");
          return { label: label.trim(), value: rest.join(":").trim() };
        }),
      featured: values.featured === true || values.featured === "true",
      trending: values.trending === true || values.trending === "true",
      bestseller: values.bestseller === true || values.bestseller === "true",
    };

    if (mode === "edit" && product?._id) {
      await updateProductById({ ...payload, _id: product._id });
    } else {
      await addProduct(payload);
    }

    navigate("/admin");
  };

  return (
    <PageWrapper className="py-0">
      <Card hover={false}>
        <div className="mb-8 space-y-3">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {mode === "edit" ? "Edit product" : "Create product"}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">
            {mode === "edit" ? "Update product details" : "Launch a new product"}
          </h1>
          <p className="text-sm text-textSecondary">Manage catalog data without touching pricing or fulfillment logic.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-8">
              <Input label="Product name" {...register("name", { required: true })} />
            </div>
            <div className="md:col-span-4">
              <Input label="Status" as="select" {...register("status")}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </Input>
            </div>
            <div className="md:col-span-12">
              <Input label="Short description" {...register("shortDescription")} />
            </div>
            <div className="md:col-span-12">
              <Input label="Description" as="textarea" rows={5} {...register("description", { required: true })} />
            </div>
            <div className="md:col-span-6">
              <Input label="Category" as="select" {...register("category", { required: true })}>
                <option value="">Select a category</option>
                {categories.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </Input>
            </div>
            <div className="md:col-span-6">
              <Input label="Brand" as="select" {...register("brand", { required: true })}>
                <option value="">Select a brand</option>
                {brands.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </Input>
            </div>
            <div className="md:col-span-4">
              <Input label="Price" type="number" {...register("price", { required: true })} />
            </div>
            <div className="md:col-span-4">
              <Input label="Original price" type="number" {...register("originalPrice", { required: true })} />
            </div>
            <div className="md:col-span-4">
              <Input label="Stock" type="number" {...register("stock", { required: true })} />
            </div>
            <div className="md:col-span-12">
              <Input label="Image URLs (comma separated)" {...register("images", { required: true })} />
            </div>
            <div className="md:col-span-4">
              <Input label="Colors" {...register("colors")} />
            </div>
            <div className="md:col-span-4">
              <Input label="Sizes" {...register("sizes")} />
            </div>
            <div className="md:col-span-4">
              <Input label="Highlights (one per line)" as="textarea" rows={4} {...register("highlights")} />
            </div>
            <div className="md:col-span-12">
              <Input
                label="Specifications (label:value per line)"
                as="textarea"
                rows={5}
                {...register("specs")}
              />
            </div>
            <div className="md:col-span-4">
              <Input label="Featured" as="select" {...register("featured")}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Input>
            </div>
            <div className="md:col-span-4">
              <Input label="Trending" as="select" {...register("trending")}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Input>
            </div>
            <div className="md:col-span-4">
              <Input label="Bestseller" as="select" {...register("bestseller")}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Input>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit">{mode === "edit" ? "Update product" : "Create product"}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/admin")}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </PageWrapper>
  );
};
