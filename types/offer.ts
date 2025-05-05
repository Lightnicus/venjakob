export interface Offer {
  id: number
  offerNumber: string
  customerId: number
  salesOpportunityId?: number
  currentVersionId?: number
  validUntil?: string
  createdById?: number
  createdAt: string
  updatedById?: number
  updatedAt: string
  customer?: Customer
  currentVersion?: OfferVersion
  versions?: OfferVersion[]
}

export interface OfferVersion {
  id: number
  offerId: number
  versionNumber: string
  title: string
  description?: string
  status: string
  recipientName?: string
  recipientEmail?: string
  recipientPhone?: string
  changeTitle?: string
  changeDescription?: string
  publishedById?: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
  publishedBy?: User
  offerBlocks?: OfferBlock[]
  positions?: Position[]
  offer?: Offer
}

export interface OfferBlock {
  id: number
  offerVersionId: number
  blockId: number
  position: number
  createdAt: string
  updatedAt: string
  block?: Block
}

export interface Block {
  id: number
  name: string
  isStandard: boolean
  isMandatory: boolean
  position?: number
  printTitle: boolean
  createdById?: number
  createdAt: string
  updatedById?: number
  updatedAt: string
  descriptions?: BlockDescription[]
}

export interface BlockDescription {
  id: number
  blockId: number
  language: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Position {
  id: number
  offerVersionId: number
  blockId: number
  articleId?: number
  name: string
  quantity: number
  unit: string
  unitPrice: number
  discount?: number
  totalPrice: number
  isOption: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: number
  name: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  contactPerson?: string
  email?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  email: string
  name: string
  role: string
  status: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}
