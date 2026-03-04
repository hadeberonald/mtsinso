// lib/cloudinary.ts

const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

// Single file — auto-detects PDF vs image, accepts optional folder
export const uploadToCloudinary = async (
  file: File,
  folder = 'ic-cars-vehicles'
): Promise<string> => {
  const isPdf    = file.type === 'application/pdf'
  const endpoint = isPdf
    ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`
    : `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const res = await fetch(endpoint, { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.statusText}`)
  const data = await res.json()
  return data.secure_url as string
}

// Vehicle images (images only)
export const uploadMultipleToCloudinary = async (files: FileList): Promise<string[]> =>
  Promise.all(Array.from(files).map(f => uploadToCloudinary(f, 'ic-cars-vehicles')))

// Finance documents — PDF + image, separate folder for easy admin access
export const uploadFinanceDoc = async (file: File): Promise<string> =>
  uploadToCloudinary(file, 'ic-cars-finance-docs')

export const uploadMultipleFinanceDocs = async (files: File[]): Promise<string[]> =>
  Promise.all(files.map(uploadFinanceDoc))