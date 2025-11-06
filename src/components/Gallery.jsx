import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/button";
import {  useCreateGalleryItemMutation } from "@/lib/api";
import GalleryImageInput from "./GalleryImageInput";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Textarea } from "../components/ui/textarea";

const createGallerySchema = z.object({
  image: z.string().min(1, "Image is required").refine(
    (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid image URL" }
  ),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description cannot exceed 500 characters")
    .trim(),
});


export default function Gallery() {
  const { user } = useUser();
  const form = useForm({
    resolver: zodResolver(createGallerySchema),
    defaultValues: {
      image: "",
      description: "",
    },
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const { reset } = form;
  const [createGallery] = useCreateGalleryItemMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        description: data.description,
        images: data.image ? [data.image] : [],
         createdBy: {
            id: user.id,
            name: user.fullName || user.username || "Anonymous",
            email: user.primaryEmailAddress?.emailAddress,
            imageUrl: user.imageUrl,
          },
      };
      console.log("Gallery payload to save:", payload);
      await createGallery(payload).unwrap();
      reset();
    } catch (err) {
      setError(err.message || "Failed to create gallery item");
    } finally {
      setIsSubmitting(false);
    }
  };

 

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Add New Gallery Item</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter gallery item description"
                        {...field}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Gallery Image</FormLabel>
                    <FormControl>
                      <GalleryImageInput
                        onChange={(url) => {
                          field.onChange(url);
                          const previewEl = document.getElementById('imagePreview');
                          if (previewEl) {
                            previewEl.src = url;
                          }
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    {field.value && (
                      <div className="mt-2">
                        <img
                          id="imagePreview"
                          src={field.value}
                          alt="Preview"
                          className="w-full max-h-[200px] object-cover rounded-md"
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Uploading..." : "Upload Gallery Item"}
              </Button>

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
