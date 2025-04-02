"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import styles from "./Notification.module.scss"

type NotificationType = "success" | "error" | "info"

interface Notification {
  id: number
  message: string
  type: NotificationType
}

interface NotificationContextType {
  notifications: Notification[]
  showNotification: (message: string, type: NotificationType) => void
  hideNotification: (id: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [nextId, setNextId] = useState(1)

  const showNotification = useCallback(
    (message: string, type: NotificationType) => {
      const id = nextId
      setNextId((prevId) => prevId + 1)

      const notification: Notification = {
        id,
        message,
        type,
      }

      setNotifications((prev) => [...prev, notification])

      setTimeout(() => {
        hideNotification(id)
      }, 5000)
    },
    [nextId],
  )

  const hideNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      {children}
      <div className={styles.notificationContainer}>
        {notifications.map((notification) => (
          <div key={notification.id} className={`${styles.notification} ${styles[notification.type]}`}>
            <span>{notification.message}</span>
            <button className={styles.closeButton} onClick={() => hideNotification(notification.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

