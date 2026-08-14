import { useEffect, useState } from 'react'
import { subscribe } from '../data/store'

// React hook for live collection data (mimics Firestore onSnapshot).
export function useCollection(name) {
  const [docs, setDocs] = useState([])
  useEffect(() => subscribe(name, setDocs), [name])
  return docs
}
