"use client"

import { api, getLocalUpdateFlag } from "@/shared/api/api"
import type { CompanyType, ContactType } from "@/shared/types"
import { Button } from "@/shared/assets/ui/Button/Button"
import { ConfirmDialog } from "@/shared/assets/ui/Dialog/Dialog"
import { useNotification } from "@/shared/assets/ui/Notification/NotificationProvider"
import { CompanyDetails } from "@/widgets/CompanyDetails"
import { ContactDetails } from "@/widgets/ContactDetails"
import { ImageGallery } from "@/widgets/ImageGallery"
import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styles from "./CompanyPage.module.scss"

export const CompanyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [company, setCompany] = useState<CompanyType | null>(null)
  const [contact, setContact] = useState<ContactType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { showNotification } = useNotification()
  const isLocalUpdate = useRef(false)

  const fetchCompanyData = useCallback(async () => {
    if (!id) return

    if (isLocalUpdate.current || getLocalUpdateFlag()) {
      console.log("Skipping API fetch due to local update")
      isLocalUpdate.current = false
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const companyData = await api.getCompany(id)
      console.log("CompanyPage received company data:", companyData)
      setCompany(companyData)

      if (companyData.contactId) {
        const contactData = await api.getContact(companyData.contactId)
        setContact(contactData)
      }
    } catch (error) {
      if ((error as Error).message === "Local update in progress") {
        console.log("Skipping API error due to local update in progress")
        setIsLoading(false)
        return
      }

      console.error("Error fetching company data:", error)
      setError("Failed to load company data")
      showNotification("Failed to load company data", "error")
    } finally {
      setIsLoading(false)
    }
  }, [id, showNotification])

  useEffect(() => {
    fetchCompanyData()
  }, [fetchCompanyData])

  const handleCompanyUpdate = useCallback((updatedCompany: CompanyType) => {
    console.log("Company updated:", updatedCompany)

    isLocalUpdate.current = true

    setCompany(updatedCompany)
  }, [])

  const handleContactUpdate = useCallback((updatedContact: ContactType) => {
    console.log("Contact updated:", updatedContact)

    isLocalUpdate.current = true

    setContact(updatedContact)
  }, [])

  const handleImagesUpdate = useCallback(
    (updatedImages: any[]) => {
      console.log("Images updated:", updatedImages)

      if (company) {
        isLocalUpdate.current = true

        setCompany({
          ...company,
          photos: updatedImages,
        })
      }
    },
    [company],
  )

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!id) return

    try {
      await api.deleteCompany(id)
      showNotification("Company deleted successfully", "success")
      navigate("/")
    } catch (error) {
      showNotification("Failed to delete company", "error")
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleRefreshClick = () => {
    isLocalUpdate.current = false
    fetchCompanyData()
    showNotification("Data refreshed", "info")
  }

  if (isLoading && !company) {
    return <div className={styles.loading}>Loading...</div>
  }

  if (error || !company) {
    return (
      <div className={styles.error}>
        <div>{error || "Company not found"}</div>
        <Button onClick={handleRefreshClick} className={styles.refreshButton}>
          Refresh Data
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.companyPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>{company.name}</h1>
        <div className={styles.headerButtons}>
          <Button onClick={handleRefreshClick} variant="outline" className={styles.refreshButton}>
            Refresh Data
          </Button>
          <Button variant="outline" onClick={handleDeleteClick}>
            Delete Company
          </Button>
        </div>
      </div>

      <CompanyDetails company={company} onUpdate={handleCompanyUpdate} />

      {contact && <ContactDetails contact={contact} onUpdate={handleContactUpdate} />}

      <ImageGallery companyId={company.id} images={company.photos || []} onUpdate={handleImagesUpdate} />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Company"
        message="Are you sure you want to delete this company? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  )
}

