import { useEffect } from 'react'

const BASE = 'Garagem — Concessionária'

/** Sets the document title to "<title> · <base>" while the page is mounted. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : BASE
    return () => {
      document.title = BASE
    }
  }, [title])
}
