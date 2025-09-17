import axios from "axios"

// Determine base URL based on environment
const getBaseURL = () => {
  // If we're on the server side (Node.js), use the HAPI FHIR URL directly
  if (typeof window === 'undefined') {
    return 'https://hapi.fhir.org/baseR4'
  }
  // If we're on the client side (browser), use the proxy
  return '/fhir'
}

// FHIR API client configuration
export const fhirApi = axios.create({
  baseURL: getBaseURL(),
  timeout: Number(process.env.FHIR_API_TIMEOUT) || 30000, // Increased timeout to 30 seconds
  headers: {
    "Content-Type": "application/fhir+json",
    Accept: "application/fhir+json",
    "Cache-Control": "no-cache"
  },
})

// Request interceptor to filter out browser-specific parameters
fhirApi.interceptors.request.use(
  (config) => {
    if (config.params) {
      // Filter out browser-specific parameters
      const filteredParams = Object.fromEntries(
        Object.entries(config.params).filter(([key]) => 
          !key.startsWith('vscodeBrowserReqId') && 
          !key.startsWith('webview') && 
          !key.includes('Browser') &&
          !key.includes('chrome') &&
          !key.includes('safari') &&
          !key.includes('firefox')
        )
      )
      config.params = filteredParams
    }
    
    // Also filter URL parameters if they exist
    if (config.url && config.url.includes('?')) {
      const [baseUrl, queryString] = config.url.split('?')
      const urlParams = new URLSearchParams(queryString)
      
      // Remove browser-specific parameters
      const keysToRemove = []
      for (const [key] of urlParams.entries()) {
        if (key.startsWith('vscodeBrowserReqId') || 
            key.startsWith('webview') || 
            key.includes('Browser') ||
            key.includes('chrome') ||
            key.includes('safari') ||
            key.includes('firefox')) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => urlParams.delete(key))
      
      const cleanQueryString = urlParams.toString()
      config.url = cleanQueryString ? `${baseUrl}?${cleanQueryString}` : baseUrl
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for FHIR-specific error handling
fhirApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error("FHIR API Error: Request timeout exceeded")
    } else if (error.response) {
      console.error("FHIR API Error:", error.response.status, error.response.data)
    } else {
      console.error("FHIR API Error:", error.message)
    }
    return Promise.reject(error)
  },
)

// FHIR utility functions
export const fhirClient = {
  get: (url: string, params?: any) => {
    console.log(`🔍 FHIR GET: ${url}`, params)
    return fhirApi.get(url, { params }).then((res) => {
      console.log(`✅ FHIR GET Response:`, res.data)
      return res.data
    })
  },
  
  post: (url: string, data?: any) => {
    console.log(`📤 FHIR POST: ${url}`, data)
    return fhirApi.post(url, data).then((res) => {
      console.log(`✅ FHIR POST Response:`, res.data)
      return res.data
    })
  },
  
  put: (url: string, data?: any) => {
    console.log(`📝 FHIR PUT: ${url}`, data)
    return fhirApi.put(url, data).then((res) => {
      console.log(`✅ FHIR PUT Response:`, res.data)
      return res.data
    })
  },
  
  delete: (url: string) => {
    console.log(`🗑️ FHIR DELETE: ${url}`)
    return fhirApi.delete(url).then((res) => {
      console.log(`✅ FHIR DELETE Response:`, res.data)
      return res.data
    })
  },

  // FHIR-specific methods
  search: (resourceType: string, params?: Record<string, string>): Promise<FHIRBundle> => {
    // Filter out browser-specific parameters that FHIR servers don't recognize
    const filteredParams = params ? Object.fromEntries(
      Object.entries(params).filter(([key]) => 
        !key.startsWith('vscodeBrowserReqId') && 
        !key.startsWith('webview') && 
        !key.includes('Browser') &&
        !key.includes('chrome') &&
        !key.includes('safari') &&
        !key.includes('firefox')
      )
    ) : {}
    
    const queryParams = new URLSearchParams(filteredParams).toString()
    const url = `/${resourceType}${queryParams ? `?${queryParams}` : ''}`
    console.log(`🔍 FHIR SEARCH: ${resourceType}`, filteredParams)
    return fhirApi.get(url).then((res) => {
      console.log(`✅ FHIR SEARCH Response:`, res.data)
      return res.data
    })
  },

  create: (resourceType: string, resource: any): Promise<any> => {
    const url = `/${resourceType}`
    console.log(`📤 FHIR CREATE: ${resourceType}`, resource)
    return fhirApi.post(url, resource).then((res) => {
      console.log(`✅ FHIR CREATE Response:`, res.data)
      return res.data
    })
  },

  update: (resourceType: string, id: string, resource: any): Promise<any> => {
    const url = `/${resourceType}/${id}`
    console.log(`📝 FHIR UPDATE: ${resourceType}/${id}`, resource)
    return fhirApi.put(url, resource).then((res) => {
      console.log(`✅ FHIR UPDATE Response:`, res.data)
      return res.data
    })
  },

  read: (resourceType: string, id: string): Promise<any> => {
    const url = `/${resourceType}/${id}`
    console.log(`🔍 FHIR READ: ${resourceType}/${id}`)
    return fhirApi.get(url).then((res) => {
      console.log(`✅ FHIR READ Response:`, res.data)
      return res.data
    })
  }
}

// FHIR Resource types
export interface FHIRResource {
  resourceType: string
  id?: string
  meta?: {
    versionId?: string
    lastUpdated?: string
  }
}

export interface FHIRBundle {
  resourceType: "Bundle"
  id?: string
  type: "searchset" | "collection" | "document" | "message" | "transaction" | "transaction-response" | "batch" | "batch-response" | "history"
  total?: number
  link?: Array<{
    relation: string
    url: string
  }>
  entry?: Array<{
    fullUrl?: string
    resource?: FHIRResource
    search?: {
      mode: "match" | "include" | "outcome"
      score?: number
    }
  }>
}

export interface FHIRPatient extends FHIRResource {
  resourceType: "Patient"
  identifier?: Array<{
    use?: "usual" | "official" | "temp" | "secondary"
    system?: string
    value?: string
  }>
  active?: boolean
  name?: Array<{
    use?: "usual" | "official" | "temp" | "nickname" | "anonymous" | "old" | "maiden"
    family?: string
    given?: string[]
    prefix?: string[]
    suffix?: string[]
  }>
  telecom?: Array<{
    system?: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other"
    value?: string
    use?: "home" | "work" | "temp" | "old" | "mobile"
  }>
  gender?: "male" | "female" | "other" | "unknown"
  birthDate?: string
  address?: Array<{
    use?: "home" | "work" | "temp" | "old" | "billing"
    line?: string[]
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }>
  contact?: Array<{
    relationship?: Array<{
      coding?: Array<{
        system?: string
        code?: string
        display?: string
      }>
    }>
    name?: {
      family?: string
      given?: string[]
    }
    telecom?: Array<{
      system?: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other"
      value?: string
      use?: "home" | "work" | "temp" | "old" | "mobile"
    }>
  }>
}

export interface FHIRAppointment extends FHIRResource {
  resourceType: "Appointment"
  status: "proposed" | "pending" | "booked" | "arrived" | "fulfilled" | "cancelled" | "noshow" | "entered-in-error" | "checked-in" | "waitlist"
  serviceType?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }>
  appointmentType?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }
  reasonCode?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }>
  description?: string
  start?: string
  end?: string
  participant?: Array<{
    type?: Array<{
      coding?: Array<{
        system?: string
        code?: string
        display?: string
      }>
    }>
    actor?: {
      reference?: string
      display?: string
    }
    required?: "required" | "optional" | "information-only"
    status: "accepted" | "declined" | "tentative" | "needs-action"
  }>
}