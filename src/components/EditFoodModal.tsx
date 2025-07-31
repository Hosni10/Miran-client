import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useSecondaryFoodMap } from "../hooks/useSecondaryFoodMap";
import { useUnitMap } from "../hooks/useUnitMap";
import { useToast } from "./ui/ToastContainer";
import Modal, { ModalPanel } from "./ui/Modal";
import { Select, type SelectOption } from "./ui/Select";
import { FoodDetail } from "../types/food";
import { buildImageUrl } from "../utils/imageUrl";
import {
  Edit2,
  Upload,
  Save,
  X,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { createBarcode, deleteBarcode } from "../services/barcodeService";
// Using custom validation similar to AddFoodModal

interface EditFoodModalProps {
  open: boolean;
  onClose: () => void;
  foodData: FoodDetail;
  onSuccess?: (updatedFood: FoodDetail) => void;
}

// Form data interface for EditFoodModal (extends validation schema)
interface EditFoodFormData {
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  image?: File | string;
  unit: number | null;
  quantity: number;
  calories: number;
  fat: number;
  protein: number;
  carbs: number;
  secondary_food?: number | null;
  is_product: boolean;
  code: string[];
  private: boolean;
  private_code: boolean;
  is_ai_generated: boolean;
}

export const EditFoodModal: React.FC<EditFoodModalProps> = ({
  open,
  onClose,
  foodData,
  onSuccess,
}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const secMap = useSecondaryFoodMap();
  const unitMap = useUnitMap();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<EditFoodFormData>({
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    image: undefined,
    unit: null,
    quantity: 0,
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newBarcode, setNewBarcode] = useState("");
  const [privateCodeInput, setPrivateCodeInput] = useState("");
  const [privateCodes, setPrivateCodes] = useState<string[]>([]);
  const [privateNutritionalFactsUrl, setPrivateNutritionalFactsUrl] =
    useState("");
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "ar">("en");
  const [isBarcodeLoading, setIsBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  // Reset form when foodData changes - populate with existing data
  useEffect(() => {
    if (open && foodData) {
      console.log("🔧 Initializing EditFoodModal with data:", foodData);

      setFormData({
        title: foodData.title || "",
        title_ar: foodData.title_ar || "",
        description: foodData.description || "",
        description_ar: foodData.description_ar || "",
        image: foodData.image ? buildImageUrl(foodData.image) : undefined,
        unit: typeof foodData.unit === "number" ? foodData.unit : null,
        quantity: foodData.quantity || 0,
        calories: foodData.calories || 0,
        fat: foodData.fat || 0,
        protein: foodData.protein || 0,
        carbs: foodData.carbs || 0,
        secondary_food:
          typeof foodData.secondary_food === "number"
            ? foodData.secondary_food
            : null,
        is_product: foodData.is_product || false,
        code: Array.isArray(foodData.code)
          ? foodData.code
          : typeof foodData.code === "string" && foodData.code
            ? [foodData.code]
            : [],
        private: foodData.private || false,
        private_code:
          typeof foodData.private_code === "boolean"
            ? foodData.private_code
            : false,
        is_ai_generated: foodData.is_ai_generated || false,
      });

      // Set existing image preview
      setImagePreview(foodData.image ? buildImageUrl(foodData.image) : null);

      // Initialize private codes if they exist
      const existingPrivateCodes = (foodData as any).private_codes; // This field may not be in type yet
      if (Array.isArray(existingPrivateCodes)) {
        setPrivateCodes(existingPrivateCodes);
      } else {
        setPrivateCodes([]);
      }

      // Initialize private nutritional facts URL if it exists
      const existingPrivateUrl = foodData.private_nutritional_facts;
      if (typeof existingPrivateUrl === "string") {
        setPrivateNutritionalFactsUrl(existingPrivateUrl);
      } else {
        setPrivateNutritionalFactsUrl("");
      }

      setErrors({});
      setTouched({});
      setNewBarcode("");
      setPrivateCodeInput("");
      setBarcodeError(null);
      setIsBarcodeLoading(false);
    }
  }, [foodData, open]);

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

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (formData: EditFoodFormData) => {
      console.log("🔧 Updating food with data:", {
        id: foodData.id,
        title: formData.title,
        hasNewImage: formData.image instanceof File,
        imageSize: formData.image instanceof File ? formData.image.size : "no change",
        imageType: formData.image instanceof File ? formData.image.type : "no change",
      });

      const form = new FormData();

      // Add text fields
      form.append("title", formData.title);
      form.append("title_ar", formData.title_ar || "");
      form.append("description", formData.description || "");
      form.append("description_ar", formData.description_ar || "");

      // Add numeric fields as strings (only if they have valid values)
      if (formData.unit !== null && formData.unit !== undefined) {
        form.append("unit", formData.unit.toString());
      }
      form.append("quantity", formData.quantity.toString());
      form.append("calories", formData.calories.toString());
      form.append("fat", formData.fat.toString());
      form.append("protein", formData.protein.toString());
      form.append("carbs", formData.carbs.toString());
      if (
        formData.secondary_food !== null &&
        formData.secondary_food !== undefined
      ) {
        form.append("secondary_food", formData.secondary_food.toString());
      }

      // Add boolean fields as strings
      form.append("is_product", formData.is_product.toString());
      form.append("private", formData.private.toString());
      form.append("private_code", formData.private_code.toString());
      form.append("is_ai_generated", formData.is_ai_generated.toString());

      // Add barcodes array (same as AddFoodModal)
      formData.code.forEach((barcode, index) => {
        if (barcode.trim()) {
          form.append("code", barcode.trim());
        }
      });

      // Add private codes array
      privateCodes.forEach((code, index) => {
        if (code.trim()) {
          form.append(`private_codes[${index}]`, code.trim());
        }
      });

      // Add private nutritional facts URL
      if (privateNutritionalFactsUrl.trim()) {
        form.append(
          "private_nutritional_facts",
          privateNutritionalFactsUrl.trim(),
        );
      }

      // Add image file ONLY if a new image was selected (optional)
      if (formData.image instanceof File) {
        form.append("image", formData.image);
      }

      // Debug: Log form data details (safely)
      console.log("🔧 FormData details:", {
        totalFields: Array.from(form.keys()).length,
        fieldNames: Array.from(form.keys()).join(", "),
        hasNewImage: formData.image instanceof File ? "Yes" : "No (keeping existing)",
        imageSize:
          formData.image instanceof File
            ? `${Math.round(formData.image.size / 1024)}KB`
            : "No change",
        formDataType: "FormData",
        isFormDataInstance: form instanceof FormData,
      });

      // Debug: Log individual form entries (safely)
      console.log("🔧 FormData entries (safe logging):");
      const formEntries: string[] = [];
      for (const [key, value] of form.entries()) {
        if (value instanceof File) {
          formEntries.push(
            `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`,
          );
        } else {
          formEntries.push(`${key}: "${value}"`);
        }
      }
      console.log(formEntries.join("\n  "));

      console.log("🔧 Request config:", {
        url: `https://testing.miranapp.com/api/v1/resources/meal/${foodData.id}/update`,
        method: "PUT",
        usingFetchAPI: true,
        bypassingProxy: true,
        directBackendCall: true,
        hasFormData: form instanceof FormData,
        tokenExists: !!(
          localStorage.getItem("userTokenSaved") ||
          localStorage.getItem("access_token")
        ),
      });

      // Use fetch API to ensure proper multipart handling (same as AddFoodModal)
      const token =
        localStorage.getItem("userTokenSaved") ||
        localStorage.getItem("access_token");

      // Make DIRECT call to backend, bypassing Netlify proxy (correct Swagger endpoint: meal/{id}/update)
      const response = await fetch(
        `https://testing.miranapp.com/api/v1/resources/meal/${foodData.id}/update`,
        {
          method: "PUT",
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

        // Handle specific status codes (same as AddFoodModal)
        if (response.status === 413) {
          errorMessage =
            "Image file is too large. Please choose an image smaller than 1MB.";
        } else if (response.status === 400) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage =
              errorData.message || errorData.detail || "Invalid data provided";
          } catch {
            errorMessage = "Invalid data provided";
          }
        } else if (response.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (response.status === 403) {
          errorMessage = "You do not have permission to update food items.";
        } else if (response.status === 404) {
          errorMessage = "Food item not found or endpoint does not exist.";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage =
              errorData.message || errorData.detail || errorMessage;
          } catch {
            // If not JSON, use the text as is
            errorMessage = errorText || errorMessage;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("🔧 Update food success:", data);
      return data;
    },
    onSuccess: (updatedFood) => {
      queryClient.invalidateQueries({ queryKey: ["food-detail", foodData.id] });
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      queryClient.invalidateQueries({ queryKey: ["food-list"] });
      onSuccess?.(updatedFood);
      onClose();

      // Show success toast (same as AddFoodModal)
      showSuccess("Food Updated", `${formData.title} updated successfully`);
    },
    onError: (error: any) => {
      console.error("❌ Error updating food:", error);

      // Handle specific HTTP status codes (same as AddFoodModal)
      if (error.message.includes("403")) {
        showError(
          "Permission Error",
          "You do not have permission to update food items.",
        );
      } else if (error.message.includes("413")) {
        showError(
          "File Too Large",
          "The image file is too large. Please choose an image smaller than 1MB.",
        );
        setErrors((prev) => ({
          ...prev,
          image: "Image file is too large for server",
        }));
      } else if (error.message.includes("400")) {
        showError(
          "Validation Error",
          "Please check your input data and try again.",
        );
      } else if (error.message.includes("401")) {
        showError("Authentication Error", "Please log in again.");
      } else if (error.message.includes("404")) {
        showError(
          "Not Found",
          "Food item not found. It may have been deleted.",
        );
      } else if (error.message.includes("500")) {
        showError("Server Error", "Server error. Please try again later.");
      } else {
        showError("Error", error.message || "Failed to update food item");
      }
    },
  });

  const validateForm = (): boolean => {
    console.log("🔧 Starting validation for edit form");
    const newErrors: Record<string, string> = {};

    // Required fields validation (similar to AddFoodModal but adapted for edit)
    if (!formData.title.trim()) newErrors.title = "Title (EN) is required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be positive";
    if (formData.calories < 0) newErrors.calories = "Calories must be ≥ 0";
    if (formData.fat < 0) newErrors.fat = "Fat must be ≥ 0";
    if (formData.protein < 0) newErrors.protein = "Protein must be ≥ 0";
    if (formData.carbs < 0) newErrors.carbs = "Carbs must be ≥ 0";

    // Validate image if a new file is uploaded
    if (formData.image instanceof File) {
      if (formData.image.size > 1024 * 1024) {
        newErrors.image = "Image must be 1MB or less";
      }
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(formData.image.type)) {
        newErrors.image = "Image must be JPEG, PNG, or WebP format";
      }
    }

    console.log("🔍 Validation results:", { 
      hasErrors: Object.keys(newErrors).length > 0, 
      errors: newErrors,
      formData: {
        title: formData.title,
        unit: formData.unit,
        quantity: formData.quantity,
        imageType: typeof formData.image,
        imageIsFile: formData.image instanceof File
      }
    });

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (isValid) {
      console.log("✅ Validation passed");
    } else {
      console.log("❌ Validation failed with errors:", newErrors);
    }
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔧 Save button clicked - handleSubmit called");

    if (!validateForm()) {
      console.log("❌ Validation failed, not submitting");
      return;
    }

    console.log("✅ Validation passed, submitting form data");
    // Submit the form data directly
    updateMutation.mutate(formData);
  };

  const handleInputChange = <K extends keyof EditFoodFormData>(
    field: K,
    value: EditFoodFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Add barcode validation function (same as AddFoodModal)
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

  // Barcode management functions with API integration
  const addBarcode = useCallback(async () => {
    const validationError = validateBarcode(newBarcode);
    if (validationError) {
      setBarcodeError(validationError);
      return;
    }

    setIsBarcodeLoading(true);
    setBarcodeError(null);
    
    try {
      await createBarcode(foodData.id, newBarcode.trim());
      
      // Update local state
      handleInputChange("code", [...formData.code, newBarcode.trim()]);
      setNewBarcode("");
      
      // Invalidate food queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["food-detail", foodData.id] });
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      
      showSuccess("Barcode Added", `Barcode ${newBarcode.trim()} added successfully.`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to add barcode. Please try again.";
      setBarcodeError(errorMessage);
      showError("Failed to Add Barcode", errorMessage);
    } finally {
      setIsBarcodeLoading(false);
    }
  }, [newBarcode, formData.code, foodData.id, queryClient, showSuccess, showError]);

  const removeBarcode = useCallback(
    async (index: number) => {
      const barcodeToDelete = formData.code[index];
      if (!barcodeToDelete) return;

      if (confirm(`Are you sure you want to delete barcode: ${barcodeToDelete}?`)) {
        setIsBarcodeLoading(true);
        setBarcodeError(null);
        
        try {
          await deleteBarcode(foodData.id, barcodeToDelete);
          
          // Update local state
          const newCodes = formData.code.filter((_, i) => i !== index);
          handleInputChange("code", newCodes);
          
          // Invalidate food queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["food-detail", foodData.id] });
          queryClient.invalidateQueries({ queryKey: ["foods"] });
          
          showSuccess("Barcode Deleted", `Barcode ${barcodeToDelete} deleted successfully.`);
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || error.message || "Failed to delete barcode. Please try again.";
          setBarcodeError(errorMessage);
          showError("Failed to Delete Barcode", errorMessage);
        } finally {
          setIsBarcodeLoading(false);
        }
      }
    },
    [formData.code, foodData.id, queryClient, showSuccess, showError],
  );

  // Private codes management functions (same as AddFoodModal)
  const addPrivateCode = useCallback(() => {
    if (
      privateCodeInput.trim() &&
      !privateCodes.includes(privateCodeInput.trim())
    ) {
      setPrivateCodes((prev) => [...prev, privateCodeInput.trim()]);
      setPrivateCodeInput("");
    }
  }, [privateCodeInput, privateCodes]);

  const removePrivateCode = useCallback((index: number) => {
    setPrivateCodes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      
      // Mark image field as touched when user interacts
      setTouched((prev) => ({ ...prev, image: true }));
      
      if (file) {
        // Validate file size (1MB limit)
        if (file.size > 1024 * 1024) {
          setErrors((prev) => ({
            ...prev,
            image: "Image must be 1MB or less",
          }));
          return;
        }

        // Validate file type
        if (
          !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
            file.type,
          )
        ) {
          setErrors((prev) => ({
            ...prev,
            image: "Image must be JPEG, PNG, or WebP format",
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

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onClose();
    }
  };

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (open && !updateMutation.isPending) {
          handleSubmit(e as any);
        }
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, updateMutation.isPending, formData]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalPanel className="w-full max-w-4xl max-h-[95vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Edit Food Item</h2>
                <p className="text-blue-100 text-sm">
                  Update nutritional information and details
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={updateMutation.isPending}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Language Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Language:
            </span>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                type="button"
                onClick={() => setCurrentLanguage("en")}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  currentLanguage === "en"
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setCurrentLanguage("ar")}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  currentLanguage === "ar"
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLanguage === "en" ? "Food Title *" : "Arabic Title"}
                </label>
                <input
                  type="text"
                  value={
                    currentLanguage === "en"
                      ? formData.title
                      : formData.title_ar
                  }
                  onChange={(e) =>
                    handleInputChange(
                      currentLanguage === "en" ? "title" : "title_ar",
                      e.target.value,
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[currentLanguage === "en" ? "title" : "title_ar"]
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } ${currentLanguage === "ar" ? "text-right" : "text-left"}`}
                  placeholder={
                    currentLanguage === "en"
                      ? "e.g., Grilled Chicken Breast"
                      : "مثال: صدر الدجاج المشوي"
                  }
                  dir={currentLanguage === "ar" ? "rtl" : "ltr"}
                />
                {errors[currentLanguage === "en" ? "title" : "title_ar"] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[currentLanguage === "en" ? "title" : "title_ar"]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Food/Brand
                </label>
                <Select
                  options={secondaryFoodOptions}
                  value={formData.secondary_food || undefined}
                  onChange={(value) =>
                    handleInputChange("secondary_food", value as number)
                  }
                  placeholder="Select brand/category"
                  searchable
                  error={errors.secondary_food}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {currentLanguage === "en"
                  ? "Description"
                  : "Arabic Description"}
              </label>
              <textarea
                value={
                  currentLanguage === "en"
                    ? formData.description
                    : formData.description_ar
                }
                onChange={(e) =>
                  handleInputChange(
                    currentLanguage === "en" ? "description" : "description_ar",
                    e.target.value,
                  )
                }
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  currentLanguage === "ar" ? "text-right" : "text-left"
                }`}
                rows={3}
                placeholder={
                  currentLanguage === "en"
                    ? "Optional detailed description..."
                    : "وصف تفصيلي اختياري..."
                }
                dir={currentLanguage === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Food Image
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
                  <div className={`w-full p-4 border-2 border-dashed rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer bg-white dark:bg-gray-700 ${
                    errors.image && touched.image
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}>
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload new image or keep current
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        JPEG, PNG, WebP up to 1MB
                      </p>
                    </div>
                  </div>
                </label>
                {errors.image && touched.image && (
                  <p className="text-red-500 text-xs mt-1">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          {/* Serving Information */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Serving Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.quantity
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>

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
                  error={errors.unit}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Calories * <span className="text-xs text-gray-500">kcal</span>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.calories
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.calories && (
                  <p className="text-red-500 text-xs mt-1">{errors.calories}</p>
                )}
              </div>
            </div>
          </div>

          {/* Macronutrients */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Macronutrients (per serving)
            </h3>
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Protein * <span className="text-xs text-gray-500">g</span>
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
                    Carbs * <span className="text-xs text-gray-500">g</span>
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.carbs
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.carbs && (
                    <p className="text-red-500 text-xs mt-1">{errors.carbs}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fat * <span className="text-xs text-gray-500">g</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fat}
                    onChange={(e) =>
                      handleInputChange("fat", parseFloat(e.target.value) || 0)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
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
                    disabled={!newBarcode.trim() || isBarcodeLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isBarcodeLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
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
                          disabled={isBarcodeLoading}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conditional Private Options (same as AddFoodModal) */}
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
                        onClick={addPrivateCode}
                        disabled={!privateCodeInput.trim() || isBarcodeLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isBarcodeLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
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
                              onClick={() => removePrivateCode(index)}
                              disabled={isBarcodeLoading}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Press Ctrl+S (Cmd+S) to save quickly
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={updateMutation.isPending}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </ModalPanel>
    </Modal>
  );
};
