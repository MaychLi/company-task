"use client"

import { api, getLocalUpdateFlag } from "@/shared/api/api"
import type { ContactType } from "@/shared/types"
import { Button } from "@/shared/assets/ui/Button/Button"
import { useNotification } from "@/shared/assets/ui/Notification/NotificationProvider"
import { ContactDetails } from "@/widgets/ContactDetails"
import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styles from "./ContactPage.module.scss"

export const ContactPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contact, setContact] = useState<ContactType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showNotification } = useNotification()
  const isLocalUpdate = useRef(false)

  const fetchContactData = useCallback(async () => {
    if (!id) return
    if (isLocalUpdate.current || getLocalUpdateFlag()) {
      console.log("Skipping API fetch due to local update")
      isLocalUpdate.current = false
      return
    }

    try {
      setIsLoading(true)
      const contactData = await api.getContact(id)
      setContact(contactData)
    } catch (error) {
      if ((error as Error).message === "Local update in progress") {
        console.log("Skipping API error due to local update in progress")
        setIsLoading(false)
        return
      }

      setError("Failed to load contact data")
      showNotification("Failed to load contact data", "error")
    } finally {
      setIsLoading(false)
    }
  }, [id, showNotification])

  useEffect(() => {
    fetchContactData()
  }, [fetchContactData])

  const handleContactUpdate = useCallback((updatedContact: ContactType) => {
    console.log("Contact updated:", updatedContact)
    isLocalUpdate.current = true
    setContact(updatedContact)
  }, [])

  const handleRefreshClick = () => {
    isLocalUpdate.current = false
    fetchContactData()
    showNotification("Data refreshed", "info")
  }

  if (isLoading && !contact) {
    return <div className={styles.loading}>Loading...</div>
  }

  if (error || !contact) {
    return (
      <div className={styles.error}>
        <div>{error || "Contact not found"}</div>
        <Button onClick={handleRefreshClick} className={styles.refreshButton}>
          Refresh Data
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.contactPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>{`${contact.firstname} ${contact.lastname}`}</h1>
        <div className={styles.headerButtons}>
          <Button onClick={handleRefreshClick} variant="outline" className={styles.refreshButton}>
            Refresh Data
          </Button>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>

      <ContactDetails contact={contact} onUpdate={handleContactUpdate} />
    </div>
  )
}

