/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const Api = createApi({
  reducerPath: "Api",
  baseQuery: fetchBaseQuery({ 
    baseUrl:import.meta.env.VITE_API_URL, 
  prepareHeaders: async (headers) => {
      return new Promise((resolve) => {
        async function checkToken() {
          const clerk = window.Clerk;
          if (clerk) {
            const token = await clerk.session?.getToken();
            headers.set("Authorization", `Bearer ${token}`);
            resolve(headers);
          } else {
            setTimeout(checkToken, 500);
          }
        }
        checkToken();
      });
    },
}),
  endpoints: (build) => ({
    getAllGalleryItems: build.query({
      query: () => "/gallery",
      providesTags: (result = []) => [
        ...result.map(({ _id }) => ({ type: 'Gallery', id: _id })),
        { type: 'Gallery', id: 'LIST' },
      ],
    }),
    createGalleryItem: build.mutation({
      query: (galleryItemData) => ({
        url: '/gallery',
        method: 'POST',
        body: galleryItemData,
      }),
      invalidatesTags: [{ type: 'Gallery', id: 'LIST' }],
    }),

    deleteGalleryItem: build.mutation({
      query: (galleryItemId) => ({
        url: `/gallery/${galleryItemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, galleryItemId) => 
        [{ type: 'Gallery', id: galleryItemId },
          { type: 'Gallery', id: 'LIST' },
        ],
    })
    }),
  })

export const {
    useGetAllGalleryItemsQuery,
    useCreateGalleryItemMutation,
    useDeleteGalleryItemMutation
} = Api;