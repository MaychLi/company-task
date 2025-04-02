"use client"

import { api } from "@/shared/api/api"
import type { ContactType } from "@/shared/types"
import { Button } from "@/shared/assets/ui/Button/Button"
import { Card } from "@/shared/assets/ui/Card/Card"
import { Input } from "@/shared/assets/ui/Input/Input"
import { useNotification } from "@/shared/assets/ui/Notification/NotificationProvider"
import type React from "react"
import { useState, useEffect } from "react"
import styles from "./ContactDetails.module.scss"

interface ContactDetailsProps {
  contact: ContactType
  onUpdate: (updatedContact: ContactType) => void
}

export const ContactDetails: React.FC<ContactDetailsProps> = ({ contact, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<ContactType>>({
    lastname: contact.lastname,
    firstname: contact.firstname,
    phone: contact.phone,
    email: contact.email,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { showNotification } = useNotification()

  useEffect(() => {
    console.log("Contact prop changed in ContactDetails:", contact)
    setFormData({
      lastname: contact.lastname,
      firstname: contact.firstname,
      phone: contact.phone,
      email: contact.email,
    })
  }, [contact])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)

      const changedFields: Partial<ContactType> = {}

      if (formData.lastname !== contact.lastname) {
        changedFields.lastname = formData.lastname
      }

      if (formData.firstname !== contact.firstname) {
        changedFields.firstname = formData.firstname
      }

      if (formData.phone !== contact.phone) {
        changedFields.phone = formData.phone
      }

      if (formData.email !== contact.email) {
        changedFields.email = formData.email
      }

      console.log("Sending contact data to API:", changedFields)

      if (Object.keys(changedFields).length === 0) {
        showNotification("No changes to save", "info")
        setIsEditing(false)
        return
      }

      await api.updateContact(contact.id, changedFields)

      const localUpdatedContact = {
        ...contact,
        ...changedFields,
      }

      console.log("Local updated contact:", localUpdatedContact)

      onUpdate(localUpdatedContact as ContactType)

      setIsEditing(false)
      showNotification("Contact details updated successfully", "success")
    } catch (error) {
      console.error("Update error:", error)
      showNotification("Failed to update contact details", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      lastname: contact.lastname,
      firstname: contact.firstname,
      phone: contact.phone,
      email: contact.email,
    })
    setIsEditing(false)
  }

  return (
    <Card className={styles.contactDetails}>
      <div className={styles.header}>
        <h2 className={styles.title}>Contact Details</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        ) : (
          <div className={styles.actions}>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <div className={styles.content}>
        {isEditing ? (
          <div className={styles.form}>
            <Input label="Last Name" name="lastname" value={formData.lastname || ""} onChange={handleInputChange} />
            <Input label="First Name" name="firstname" value={formData.firstname || ""} onChange={handleInputChange} />
            <Input label="Phone" name="phone" value={formData.phone || ""} onChange={handleInputChange} />
            <Input label="Email" name="email" type="email" value={formData.email || ""} onChange={handleInputChange} />
          </div>
        ) : (
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Last Name:</span>
              <span className={styles.value}>{contact.lastname}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>First Name:</span>
              <span className={styles.value}>{contact.firstname}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Phone:</span>
              <span className={styles.value}>{contact.phone}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{contact.email}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

