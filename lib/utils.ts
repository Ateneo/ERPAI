import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formateo de fechas y horas
export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return "hace unos segundos"
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`
  if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} meses`
  return `hace ${Math.floor(diffInSeconds / 31536000)} años`
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-ES").format(num)
}

// Validaciones españolas
export function validateTaxId(taxId: string): boolean {
  return validateSpanishTaxId(taxId)
}

export function validateSpanishTaxId(taxId: string): boolean {
  if (!taxId) return false

  const cleanId = taxId.toUpperCase().replace(/[^A-Z0-9]/g, "")

  if (cleanId.length !== 9) return false

  // NIF (DNI)
  if (/^[0-9]{8}[A-Z]$/.test(cleanId)) {
    return validateNIF(cleanId)
  }

  // NIE
  if (/^[XYZ][0-9]{7}[A-Z]$/.test(cleanId)) {
    return validateNIE(cleanId)
  }

  // CIF
  if (/^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/.test(cleanId)) {
    return validateCIF(cleanId)
  }

  return false
}

export function validateNIF(nif: string): boolean {
  const letters = "TRWAGMYFPDXBNJZSQVHLCKE"
  const number = Number.parseInt(nif.substring(0, 8), 10)
  const letter = nif.charAt(8)
  return letters.charAt(number % 23) === letter
}

export function validateNIE(nie: string): boolean {
  const letters = "TRWAGMYFPDXBNJZSQVHLCKE"
  let number = nie.substring(1, 8)

  switch (nie.charAt(0)) {
    case "X":
      number = "0" + number
      break
    case "Y":
      number = "1" + number
      break
    case "Z":
      number = "2" + number
      break
    default:
      return false
  }

  const letter = nie.charAt(8)
  return letters.charAt(Number.parseInt(number, 10) % 23) === letter
}

export function validateCIF(cif: string): boolean {
  const firstLetter = cif.charAt(0)
  const numbers = cif.substring(1, 8)
  const control = cif.charAt(8)

  let sum = 0
  for (let i = 0; i < numbers.length; i++) {
    let digit = Number.parseInt(numbers.charAt(i), 10)
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10)
    }
    sum += digit
  }

  const units = sum % 10
  const controlDigit = units === 0 ? 0 : 10 - units

  // Algunas organizaciones usan letra, otras número
  if (/[NPQRSW]/.test(firstLetter)) {
    const letters = "JABCDEFGHI"
    return control === letters.charAt(controlDigit)
  } else {
    return control === controlDigit.toString() || control === "JABCDEFGHI".charAt(controlDigit)
  }
}

export function validateSpanishPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^0-9]/g, "")

  // Móvil español: 6XX XXX XXX o 7XX XXX XXX
  if (/^[67][0-9]{8}$/.test(cleanPhone)) return true

  // Fijo español: 9XX XXX XXX
  if (/^9[0-9]{8}$/.test(cleanPhone)) return true

  // Con prefijo internacional: +34
  if (/^34[67][0-9]{8}$/.test(cleanPhone)) return true
  if (/^349[0-9]{8}$/.test(cleanPhone)) return true

  return false
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePostalCode(postalCode: string): boolean {
  return /^[0-9]{5}$/.test(postalCode)
}

export function validateIBAN(iban: string): boolean {
  const cleanIban = iban.replace(/[^A-Z0-9]/g, "")

  if (cleanIban.length !== 24) return false
  if (!cleanIban.startsWith("ES")) return false

  // Algoritmo de validación IBAN
  const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4)
  let numericString = ""

  for (let i = 0; i < rearranged.length; i++) {
    const char = rearranged.charAt(i)
    if (/[A-Z]/.test(char)) {
      numericString += (char.charCodeAt(0) - 55).toString()
    } else {
      numericString += char
    }
  }

  // Calcular módulo 97
  let remainder = 0
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + Number.parseInt(numericString.charAt(i), 10)) % 97
  }

  return remainder === 1
}

// Utilidades de texto
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str
}

// Utilidades de arrays
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function groupBy<T, K extends keyof any>(array: T[], key: (item: T) => K): Record<K, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = key(item)
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    },
    {} as Record<K, T[]>,
  )
}

// Utilidades de fechas
export function isToday(date: Date | string): boolean {
  const d = new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

export function isYesterday(date: Date | string): boolean {
  const d = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return d.toDateString() === yesterday.toDateString()
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function diffInDays(date1: Date | string, date2: Date | string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Utilidades de archivos
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Utilidades de URL
export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

// Utilidades de colores
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// Utilidades de localStorage
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error)
    return defaultValue
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error)
  }
}

// Utilidades de debounce y throttle
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Utilidades de generación
export function generateId(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Utilidades de cálculo
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function roundToDecimals(value: number, decimals: number): number {
  return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals)
}

// Utilidades de objetos
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0
  return Object.keys(obj).length === 0
}

// Utilidades de promesas
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await sleep(delay)
      return retry(fn, retries - 1, delay * 2)
    }
    throw error
  }
}
