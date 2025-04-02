export interface CompanyType {
  id: string
  contactId: string
  name: string
  shortName: string
  businessEntity: string
  contract: {
    no: string
    issue_date: string
  }
  type: string[]
  status: string
  photos: ImageType[]
  createdAt: string
  updatedAt: string
}

export interface ContactType {
  id: string
  lastname: string
  firstname: string
  phone: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface ImageType {
  name: string
  filepath: string
  thumbpath: string
  createdAt: string
}

