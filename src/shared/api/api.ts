import type { CompanyType, ContactType, ImageType } from "../types"

const API_URL = "https://test-task-api.allfuneral.com"

let authToken: string | null = null

let isLocalUpdateInProgress = false

export const setLocalUpdateFlag = (value: boolean) => {
  isLocalUpdateInProgress = value
}

export const getLocalUpdateFlag = () => {
  return isLocalUpdateInProgress
}

export const setAuthToken = (token: string) => {
  authToken = token
  localStorage.setItem("authToken", token)
}

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem("authToken")
  }
  return authToken
}

const getHeaders = (contentType = "application/json") => {
  const headers: Record<string, string> = {
    "Content-Type": contentType,
  }

  const token = getAuthToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

export const api = {
  auth: async (username: string): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/auth?user=${username}`, {
        method: "GET",
        headers: getHeaders(),
      })

      if (!response.ok) {
        console.error("Auth response not OK:", response.status, response.statusText)
        throw new Error("Authentication failed")
      }

      const authHeader = response.headers.get("Authorization")

      if (authHeader) {
        const token = authHeader.split(" ")[1]
        setAuthToken(token)
        return token
      }

      const data = await response.json()

      if (data.Authorization) {
        const token = data.Authorization.split(" ")[1]
        setAuthToken(token)
        return token
      }

      if (typeof data === "string" && data.startsWith("Bearer ")) {
        const token = data.split(" ")[1]
        setAuthToken(token)
        return token
      }

      if (data.token) {
        setAuthToken(data.token)
        return data.token
      }

      console.error("No Authorization in response:", data)
      throw new Error("Invalid authentication response")
    } catch (error) {
      console.error("Auth error:", error)
      throw error
    }
  },

  getCompany: async (id: string): Promise<CompanyType> => {
    if (isLocalUpdateInProgress) {
      console.log("Skipping getCompany API call due to local update in progress")
      throw new Error("Local update in progress")
    }
    const baseId = id.split("?")[0]
    const timestamp = new Date().getTime()
    const url = `${API_URL}/companies/${baseId}?_t=${timestamp}&nocache=true`

    console.log("Fetching company data from:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch company data")
    }

    const data = await response.json()
    console.log("Received company data:", data)
    return data
  },

  updateCompany: async (id: string, data: Partial<CompanyType>): Promise<void> => {
    setLocalUpdateFlag(true)

    try {
      const dataToSend = { ...data }
      if (dataToSend.type !== undefined) {
        if (!Array.isArray(dataToSend.type)) {
          dataToSend.type = []
        }
      }

      console.log("Sending to API:", JSON.stringify(dataToSend))

      const response = await fetch(`${API_URL}/companies/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", errorData)
        throw new Error(`Failed to update company data: ${response.status} ${JSON.stringify(errorData)}`)
      }

      try {
        const responseData = await response.json()
        console.log("Update response from server:", responseData)
      } catch (e) {
        console.log("No JSON response from update")
      }
    } finally {
      setTimeout(() => {
        setLocalUpdateFlag(false)
      }, 500)
    }
  },

  deleteCompany: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/companies/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    })
    if (!response.ok) {
      throw new Error("Failed to delete company")
    }
  },

  uploadCompanyImage: async (id: string, file: File): Promise<ImageType> => {
    setLocalUpdateFlag(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_URL}/companies/${id}/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      return await response.json()
    } finally {
      setTimeout(() => {
        setLocalUpdateFlag(false)
      }, 500)
    }
  },

  deleteCompanyImage: async (companyId: string, imageName: string): Promise<void> => {
    setLocalUpdateFlag(true)

    try {
      const response = await fetch(`${API_URL}/companies/${companyId}/image/${imageName}`, {
        method: "DELETE",
        headers: getHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to delete image")
      }
    } finally {
      setTimeout(() => {
        setLocalUpdateFlag(false)
      }, 500)
    }
  },

  getContact: async (id: string): Promise<ContactType> => {
    if (isLocalUpdateInProgress) {
      console.log("Skipping getContact API call due to local update in progress")
      throw new Error("Local update in progress")
    }
    const timestamp = new Date().getTime()

    const response = await fetch(`${API_URL}/contacts/${id}?_t=${timestamp}&nocache=true`, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch contact data")
    }

    return await response.json()
  },

  updateContact: async (id: string, data: Partial<ContactType>): Promise<void> => {
    setLocalUpdateFlag(true)

    try {
      console.log("Sending contact data to API:", data)

      const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update contact data")
      }
    } finally {
      setTimeout(() => {
        setLocalUpdateFlag(false)
      }, 500)
    }
  },
}

