import { z } from "zod";

export const foodEditSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),

  title_ar: z
    .string()
    .max(255, "Arabic title must be 255 characters or less")
    .optional(),

  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),

  description_ar: z
    .string()
    .max(1000, "Arabic description must be 1000 characters or less")
    .optional(),

  unit: z
    .number()
    .int("Unit must be a valid selection")
    .positive("Unit must be selected"),

  quantity: z.number().min(0, "Quantity must be 0 or greater"),

  calories: z.number().min(0, "Calories must be 0 or greater"),

  fat: z.number().min(0, "Fat must be 0 or greater"),

  protein: z.number().min(0, "Protein must be 0 or greater"),

  carbs: z.number().min(0, "Carbs must be 0 or greater"),

  secondary_food: z
    .number()
    .int("Secondary food must be a valid selection")
    .positive("Secondary food must be selected")
    .optional(),

  is_product: z.boolean(),

  code: z.string().max(100, "Code must be 100 characters or less").optional(),

  private: z.boolean(),

  private_code: z
    .string()
    .max(100, "Private code must be 100 characters or less")
    .optional(),

  is_ai_generated: z.boolean(),

  image: z
    .union([
      z
        .instanceof(File)
        .refine((file) => file.size <= 1024 * 1024, "Image must be 1MB or less")
        .refine(
          (file) =>
            ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
              file.type,
            ),
          "Image must be JPEG, PNG, or WebP format",
        ),
      z.string().url(),
      z.undefined(),
    ]),
});

export type FoodEditFormData = z.infer<typeof foodEditSchema>;
