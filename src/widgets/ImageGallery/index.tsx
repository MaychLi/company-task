"use client"

import { api } from "@/shared/api/api"
import type { ImageType } from "@/shared/types"
import { Button } from "@/shared/assets/ui/Button/Button"
import { Card } from "@/shared/assets/ui/Card/Card"
import { ConfirmDialog } from "@/shared/assets/ui/Dialog/Dialog"
import { useNotification } from "@/shared/assets/ui/Notification/NotificationProvider"
import React, { useState } from "react"
import styles from "./ImageGallery.module.scss"

interface ImageGalleryProps {
  companyId: string
  images: ImageType[]
  onUpdate: (images: ImageType[]) => void
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ companyId, images, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { showNotification } = useNotification()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const newImage = await api.uploadCompanyImage(companyId, file)

      const updatedImages = [...images, newImage]
      onUpdate(updatedImages)

      showNotification("Image uploaded successfully", "success")
    } catch (error) {
      showNotification("Failed to upload image", "error")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteClick = (image: ImageType) => {
    setSelectedImage(image)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedImage) return

    try {
      await api.deleteCompanyImage(companyId, selectedImage.name)
      const updatedImages = images.filter((img) => img.name !== selectedImage.name)
      onUpdate(updatedImages)

      showNotification("Image deleted successfully", "success")
    } catch (error) {
      showNotification("Failed to delete image", "error")
    } finally {
      setSelectedImage(null)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <Card className={styles.imageGallery}>
      <div className={styles.header}>
        <h2 className={styles.title}>Photos</h2>
        <Button onClick={handleUploadClick} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Image"}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className={styles.fileInput}
        />
      </div>

      <div className={styles.gallery}>
        {images.length === 0 ? (
          <div className={styles.emptyState}>No images uploaded yet</div>
        ) : (
          images.map((image) => (
            <div key={image.name} className={styles.imageContainer}>
              <img src={image.thumbpath || "/placeholder.svg"} alt={image.name} className={styles.image} />
              <div className={styles.imageOverlay}>
                <Button
                  variant="flat"
                  size="sm"
                  onClick={() => handleDeleteClick(image)}
                  className={styles.deleteButton}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </Card>
  )
}

