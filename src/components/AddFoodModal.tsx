import React, { useState, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useSecondaryFoodMap } from "../hooks/useSecondaryFoodMap";
import { useUnitMap } from "../hooks/useUnitMap";
import Modal, { ModalPanel } from "./ui/Modal";
import { Select, type SelectOption } from "./ui/Select";
import { api } from "../lib/api";
import { buildImageUrl } from "../utils/imageUrl";
import { useToast } from "./ui/ToastContainer";
import { Upload, X, Plus, Trash2, Save } from "lucide-react";
import axios from "axios";

interface AddFoodModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AddFoodFormData {
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  image: File | null;
  unit: number | null;
  quantity: number;
  calories: number;
  fat: number;
  protein: number;
  carbs: number;
  secondary_food: number | null;
  is_product: boolean;
  code: string[];
  private: boolean;
  private_code: boolean;
  is_ai_generated: boolean;
}

interface Unit {
  id: number;
  name: string;
}

interface SecondaryFood {
  id: number;
  title: string;
  image?: string;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // Use the same hooks as EditFoodModal
  const secMap = useSecondaryFoodMap();
  const unitMap = useUnitMap();

  const [formData, setFormData] = useState<AddFoodFormData>({
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    image: null,
    unit: null,
    quantity: 100,
    calories: 0,
    fat: 0,
    protein: 0,
    carbs: 0,
    secondary_food: null,
    is_product: false,
    code: [],
    private: false,
    private_code: false,
    is_ai_generated: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newBarcode, setNewBarcode] = useState("");
  const [privateCodeInput, setPrivateCodeInput] = useState("");
  const [privateCodes, setPrivateCodes] = useState<string[]>([]);
  const [privateNutritionalFactsUrl, setPrivateNutritionalFactsUrl] =
    useState("");
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  // Create food mutation
  const createMutation = useMutation({
    mutationFn: async (formData: AddFoodFormData) => {
      console.log("🔧 Creating food with data:", {
        title: formData.title,
        imageSize: formData.image ? formData.image.size : "no image",
        imageSizeKB: formData.image
          ? Math.round(formData.image.size / 1024)
          : "no image",
        imageSizeMB: formData.image
          ? Math.round((formData.image.size / (1024 * 1024)) * 100) / 100
          : "no image",
        imageType: formData.image ? formData.image.type : "no image",
        hasImage: !!formData.image,
        endpoint: "/v1/resources/food/",
        method: "POST",
      });

      const form = new FormData();

      // Add text fields
      form.append("title", formData.title);
      form.append("title_ar", formData.title_ar);
      form.append("description", formData.description);
      form.append("description_ar", formData.description_ar);

      // Add numeric fields as strings
      form.append("unit", formData.unit?.toString() || "");
      form.append("quantity", formData.quantity.toString());
      form.append("calories", formData.calories.toString());
      form.append("fat", formData.fat.toString());
      form.append("protein", formData.protein.toString());
      form.append("carbs", formData.carbs.toString());
      form.append("secondary_food", formData.secondary_food?.toString() || "");

      // Add boolean fields as strings
      form.append("is_product", formData.is_product.toString());
      form.append("private", formData.private.toString());
      form.append("private_code", formData.private_code.toString());
      form.append("is_ai_generated", formData.is_ai_generated.toString());

      // Add barcodes array
      formData.code.forEach((barcode, index) => {
        form.append(`code[${index}]`, barcode);
      });

      // Add private codes array
      privateCodes.forEach((code, index) => {
        form.append(`private_codes[${index}]`, code);
      });

      // Add private nutritional facts URL
      if (privateNutritionalFactsUrl.trim()) {
        form.append(
          "private_nutritional_facts",
          privateNutritionalFactsUrl.trim(),
        );
      }

      // Add image file
      if (formData.image) {
        form.append("image", formData.image);
      }

      // Debug: Log form data details
      console.log("🔧 FormData details:", {
        totalFields: Array.from(form.keys()).length,
        fieldNames: Array.from(form.keys()),
        hasImage: formData.image ? "Yes" : "No",
        imageSize: formData.image
          ? `${Math.round(formData.image.size / 1024)}KB`
          : "N/A",
        formDataType: form.constructor.name,
        isFormDataInstance: form instanceof FormData,
      });

      // Debug: Log individual form entries
      console.log("🔧 FormData entries:");
      for (const [key, value] of form.entries()) {
        if (value instanceof File) {
          console.log(
            `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`,
          );
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      console.log("🔧 Request config:", {
        url: "https://testing.miranapp.com/api/v1/resources/food/add",
        method: "POST",
        usingFetchAPI: true,
        bypassingProxy: true,
        directBackendCall: true,
        hasFormData: form instanceof FormData,
        tokenExists: !!(
          localStorage.getItem("userTokenSaved") ||
          localStorage.getItem("access_token")
        ),
      });

      // Use fetch API to ensure proper multipart handling
      const token =
        localStorage.getItem("userTokenSaved") ||
        localStorage.getItem("access_token");

      // Make DIRECT call to backend, bypassing Netlify proxy
      const response = await fetch(
        "https://testing.miranapp.com/api/v1/resources/food/add",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            // Don't set Content-Type - let browser handle multipart boundary
          },
          body: form,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🚨 Backend Error Response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          errorBody: errorText,
        });

        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch {
          // If not JSON, use the text as is
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      queryClient.invalidateQueries({ queryKey: ["food-list"] });
      showSuccess("Food Added", `${formData.title} added successfully`);
      resetForm();
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      console.error("Error creating food:", error);

      // Handle specific HTTP status codes
      if (error.response?.status === 413) {
        showError(
          "File Too Large",
          "The image file is too large. Please choose an image smaller than 1MB.",
        );
        setErrors((prev) => ({
          ...prev,
          image: "Image file is too large for server",
        }));
      } else if (error.response?.status === 400) {
        // Handle validation errors from server
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
          showError(
            "Validation Error",
            "Please check the form fields and try again.",
          );
        } else if (error.response?.data?.message) {
          showError("Error", error.response.data.message);
        } else {
          showError(
            "Error",
            "Invalid data provided. Please check your inputs.",
          );
        }
      } else if (error.response?.status === 401) {
        showError("Authentication Error", "Please log in again to continue.");
      } else if (error.response?.status === 403) {
        showError(
          "Permission Error",
          "You do not have permission to add food items.",
        );
      } else if (error.response?.status === 500) {
        showError(
          "Server Error",
          "Server error occurred. Please try again later.",
        );
      } else if (error.response?.data?.message) {
        showError("Error", error.response.data.message);
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        showError(
          "Validation Error",
          "Please check the form fields and try again.",
        );
      } else {
        showError("Error", "Failed to create food item. Please try again.");
      }
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      title_ar: "",
      description: "",
      description_ar: "",
      image: null,
      unit: null,
      quantity: 100,
      calories: 0,
      fat: 0,
      protein: 0,
      carbs: 0,
      secondary_food: null,
      is_product: false,
      code: [],
      private: false,
      private_code: false,
      is_ai_generated: false,
    });
    setErrors({});
    setImagePreview(null);
    setNewBarcode("");
    setPrivateCodeInput("");
    setPrivateCodes([]);
    setPrivateNutritionalFactsUrl("");
    setBarcodeError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.title.trim()) newErrors.title = "Title (EN) is required";
    if (!formData.title_ar.trim())
      newErrors.title_ar = "Title (AR) is required";
    if (!formData.description.trim())
      newErrors.description = "Description (EN) is required";
    if (!formData.description_ar.trim())
      newErrors.description_ar = "Description (AR) is required";
    if (!formData.image) newErrors.image = "Image is required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (formData.quantity <= 0)
      newErrors.quantity = "Quantity must be positive";
    if (formData.calories < 0) newErrors.calories = "Calories must be ≥ 0";
    if (formData.fat < 0) newErrors.fat = "Fat must be ≥ 0";
    if (formData.protein < 0) newErrors.protein = "Protein must be ≥ 0";
    if (formData.carbs < 0) newErrors.carbs = "Carbs must be ≥ 0";
    if (!formData.secondary_food)
      newErrors.secondary_food = "Secondary Food is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = <K extends keyof AddFoodFormData>(
    field: K,
    value: AddFoodFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file size (1MB limit to avoid 413 errors)
        if (file.size > 1024 * 1024) {
          setErrors((prev) => ({
            ...prev,
            image: "Image must be 1MB or less",
          }));
          return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          setErrors((prev) => ({
            ...prev,
            image: "Only image files are allowed",
          }));
          return;
        }

        setFormData((prev) => ({ ...prev, image: file }));

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Clear any previous image errors
        if (errors.image) {
          setErrors((prev) => ({ ...prev, image: "" }));
        }
      }
    },
    [errors.image],
  );

  // Add barcode validation function
  const validateBarcode = (code: string): string | null => {
    const trimmedCode = code.trim();
    
    // Check if empty
    if (!trimmedCode) {
      return "Barcode cannot be empty.";
    }
    
    // Check if numeric only
    if (!/^\d+$/.test(trimmedCode)) {
      return "Barcode must contain only numbers.";
    }
    
    // Check length (8-14 digits)
    if (trimmedCode.length < 8 || trimmedCode.length > 14) {
      return "Barcode must be between 8 and 14 digits.";
    }
    
    // Check for duplicates
    if (formData.code.includes(trimmedCode)) {
      return "This barcode already exists.";
    }
    
    return null;
  };

  const addBarcode = () => {
    const validationError = validateBarcode(newBarcode);
    if (validationError) {
      setBarcodeError(validationError);
      return;
    }

    setBarcodeError(null);
    setFormData((prev) => ({
      ...prev,
      code: [...prev.code, newBarcode.trim()],
    }));
    setNewBarcode("");
    showSuccess("Barcode Added", "Barcode added to list. It will be saved when you create the food item.");
  };

  const removeBarcode = (index: number) => {
    const barcodeToDelete = formData.code[index];
    if (!barcodeToDelete) return;

    if (confirm(`Are you sure you want to remove barcode: ${barcodeToDelete}?`)) {
      setFormData((prev) => ({
        ...prev,
        code: prev.code.filter((_, i) => i !== index),
      }));
      showSuccess("Barcode Removed", "Barcode removed from list.");
    }
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  // Check if form is valid for save button state
  const isFormValid = useMemo(() => {
    // Check required fields without side effects
    return (
      formData.title.trim() !== "" &&
      formData.title_ar.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.description_ar.trim() !== "" &&
      formData.image !== null &&
      formData.unit !== null &&
      formData.quantity > 0 &&
      formData.calories >= 0 &&
      formData.fat >= 0 &&
      formData.protein >= 0 &&
      formData.carbs >= 0 &&
      formData.secondary_food !== null
    );
  }, [formData]);

  // Prepare select options
  const unitOptions: SelectOption[] = Object.entries(unitMap).map(
    ([id, label]) => ({
      value: parseInt(id),
      label: label || `Unit ${id}`,
    }),
  );

  const secondaryFoodOptions: SelectOption[] = Object.entries(secMap).map(
    ([id, meta]) => ({
      value: parseInt(id),
      label: meta.title || `Brand ${id}`,
      icon: meta.icon ? buildImageUrl(meta.icon) : undefined,
    }),
  );

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalPanel className="w-full max-w-4xl max-h-[95vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Add New Food Item
                </h2>
                <p className="text-green-100 text-sm">
                  Create a new food entry with nutritional information
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title (EN) *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.title
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="e.g., Grilled Chicken Breast"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title (AR) *
                  </label>
                  <input
                    type="text"
                    value={formData.title_ar}
                    onChange={(e) =>
                      handleInputChange("title_ar", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-right ${
                      errors.title_ar
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="مثال: صدر الدجاج المشوي"
                    dir="rtl"
                  />
                  {errors.title_ar && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.title_ar}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (EN) *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.description ? "border-red-500" : ""
                    }`}
                    rows={3}
                    placeholder="Detailed description..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (AR) *
                  </label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) =>
                      handleInputChange("description_ar", e.target.value)
                    }
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right ${
                      errors.description_ar ? "border-red-500" : ""
                    }`}
                    rows={3}
                    placeholder="وصف تفصيلي..."
                    dir="rtl"
                  />
                  {errors.description_ar && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description_ar}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Food Image *
              </h3>
              <div className="flex items-start gap-4">
                {imagePreview && (
                  <div className="flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt="Food preview"
                      className="w-24 h-24 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div
                      className={`w-full p-4 border-2 border-dashed rounded-lg hover:border-green-400 dark:hover:border-green-500 transition-colors cursor-pointer bg-white dark:bg-gray-700 ${
                        errors.image
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload image
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Max 1MB, image files only
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                          💡 Tip: Use compressed/optimized images for best
                          results
                        </p>
                      </div>
                    </div>
                  </label>
                  {errors.image && (
                    <p className="text-red-500 text-xs mt-1">{errors.image}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Serving Information & Selections */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Serving Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit *
                  </label>
                  <Select
                    options={unitOptions}
                    value={formData.unit || undefined}
                    onChange={(value) =>
                      handleInputChange("unit", value as number)
                    }
                    placeholder="Select unit"
                    searchable
                    error={errors.unit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) =>
                      handleInputChange(
                        "quantity",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.quantity
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Calories *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.calories}
                    onChange={(e) =>
                      handleInputChange(
                        "calories",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.calories
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.calories && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.calories}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secondary Food *
                  </label>
                  <Select
                    options={secondaryFoodOptions}
                    value={formData.secondary_food || undefined}
                    onChange={(value) =>
                      handleInputChange("secondary_food", value as number)
                    }
                    placeholder="Select secondary food"
                    searchable
                    error={errors.secondary_food}
                  />
                </div>
              </div>
            </div>

            {/* Macronutrients */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Macronutrients
              </h3>
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Protein (g) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.protein}
                      onChange={(e) =>
                        handleInputChange(
                          "protein",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.protein
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                    {errors.protein && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.protein}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Carbs (g) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.carbs}
                      onChange={(e) =>
                        handleInputChange(
                          "carbs",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.carbs
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                    {errors.carbs && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.carbs}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fat (g) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fat}
                      onChange={(e) =>
                        handleInputChange(
                          "fat",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.fat
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                    {errors.fat && (
                      <p className="text-red-500 text-xs mt-1">{errors.fat}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Additional Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_product}
                    onChange={(e) =>
                      handleInputChange("is_product", e.target.checked)
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    📦 Is Product
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.private}
                    onChange={(e) =>
                      handleInputChange("private", e.target.checked)
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    🔒 Private
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_ai_generated}
                    onChange={(e) =>
                      handleInputChange("is_ai_generated", e.target.checked)
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    🤖 AI Generated
                  </span>
                </label>
              </div>

              {/* Barcodes - Only show if is_product is true */}
              {formData.is_product && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Barcodes (Optional)
                  </h3>

                  {/* Add new barcode */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newBarcode}
                      onChange={(e) => setNewBarcode(e.target.value)}
                      placeholder="Enter barcode"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addBarcode}
                      disabled={!newBarcode.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Code
                    </button>
                  </div>
                  {barcodeError && (
                    <p className="text-red-500 text-xs mt-1">{barcodeError}</p>
                  )}

                  {/* Barcode list */}
                  {formData.code.length > 0 && (
                    <div className="space-y-2">
                      {formData.code.map((barcode, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500"
                        >
                          <span className="font-mono text-sm text-gray-900 dark:text-white">
                            {barcode}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeBarcode(index)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 focus:outline-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Private Options */}
              {formData.private && (
                <div className="mt-6 pt-4 border-t border-red-200 dark:border-red-800">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-red-600">🔒</span>
                    Private Options
                  </h4>

                  <div className="space-y-4">
                    {/* Private Codes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Private Codes
                      </label>

                      {/* Add new private code */}
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={privateCodeInput}
                          onChange={(e) => setPrivateCodeInput(e.target.value)}
                          placeholder="Enter private code"
                          className="flex-1 px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (privateCodeInput.trim()) {
                              setPrivateCodes([
                                ...privateCodes,
                                privateCodeInput.trim(),
                              ]);
                              setPrivateCodeInput("");
                            }
                          }}
                          disabled={!privateCodeInput.trim()}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Code
                        </button>
                      </div>

                      {/* Private codes list */}
                      {privateCodes.length > 0 && (
                        <div className="space-y-2">
                          {privateCodes.map((code, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                            >
                              <span className="font-mono text-sm text-gray-900 dark:text-white">
                                {code}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPrivateCodes(
                                    privateCodes.filter((_, i) => i !== index),
                                  );
                                }}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 focus:outline-none"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Private Nutritional Facts URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Private Nutritional Facts URL
                      </label>
                      <input
                        type="url"
                        value={privateNutritionalFactsUrl}
                        onChange={(e) =>
                          setPrivateNutritionalFactsUrl(e.target.value)
                        }
                        className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="https://example.com/nutrition-facts.pdf"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={createMutation.isPending || !isFormValid}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Food Item
                </>
              )}
            </button>
          </div>
        </div>
      </ModalPanel>
    </Modal>
  );
};
