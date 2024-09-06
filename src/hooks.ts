import { DocumentData, DocumentReference } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useDocumentData } from "react-firebase-hooks/firestore"

export const getLocalStorage = <T = any>(key: string, defaultValue = {}) => {
  return JSON.parse(
    localStorage.getItem(key) ?? JSON.stringify(defaultValue)
  ) as T
}

export const setLocalStorage = (key: string, value = {}) => {
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(
    new StorageEvent("storage", { key, newValue: JSON.stringify(value) })
  )
}

interface LocalStorageOptions {
  key: string
  defaultValue?: any
  serialize?: boolean
}

export const useLocalStorage = <T>({
  key,
  defaultValue,
  serialize,
}: LocalStorageOptions): [T, React.Dispatch<React.SetStateAction<T>>] => {
  if (serialize) {
    key += " (Dib It Serialize)"
  }

  const [value, setValue] = useState<T>(
    getLocalStorage(key, defaultValue ?? null)
  )

  useEffect(() => {
    if (!localStorage.getItem(key) && defaultValue) {
      localStorage.setItem(key, JSON.stringify(defaultValue))
    }

    const listener = (e: StorageEvent) => {
      if (e.key === key) {
        if (e.newValue) {
          setValue(JSON.parse(e.newValue))
        } else {
          setValue(defaultValue ?? null)
        }
      }
    }

    window.addEventListener("storage", listener)

    return () => window.removeEventListener("storage", listener)
  }, [key])

  const userSetValue = (newValue: any) => {
    setValue(newValue)
    if (typeof newValue === "function") {
      newValue = newValue(value)
    }
    if (newValue !== undefined) {
      localStorage.setItem(key, JSON.stringify(newValue))
      window.dispatchEvent(
        new StorageEvent("storage", { key, newValue: JSON.stringify(newValue) })
      )
    }
  }

  return [value, userSetValue]
}

export const useCachedDocumentData = (
  docRef: DocumentReference<DocumentData>
) => {
  const [data, setData] = useLocalStorage<any>({
    key: "Cached " + docRef.path,
    defaultValue: {},
  })
  const [document, loading, error, snapshot] = useDocumentData(docRef)

  useEffect(() => {
    if (document) {
      setData(document)
    }
  }, [document])

  return [data, loading, error, snapshot]
}

const cachedUrlValues: Record<string, any> = {}
const fetchUrlValuePromises: Record<string, Promise<any>> = {}

export const cachedFetch = async <T = any>(url: string): Promise<T> => {
  if (cachedUrlValues[url] !== undefined) {
    return cachedUrlValues[url]
  }

  if (fetchUrlValuePromises[url] === undefined) {
    fetchUrlValuePromises[url] = fetch(url).then((r) => r.json())
  }

  const result = await fetchUrlValuePromises[url]
  return result
}
