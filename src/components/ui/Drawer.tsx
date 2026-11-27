import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import IconBase from './IconBase'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children?: ReactNode
  footer?: ReactNode
  width?: string
}

/** Right-side sliding drawer (e.g. sale detail). */
export default function Drawer({ open, onClose, title, subtitle, children, footer, width = 'max-w-md' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <div className={`fixed inset-0 z-[70] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-gray-900/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`surface-card absolute right-0 top-0 flex h-full w-full ${width} flex-col border-l shadow-theme-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label={title}
      >
        <div className="flex items-start justify-between border-b border-themed px-5 py-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-heading">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-heading"
            aria-label="Fechar"
          >
            <IconBase name="x" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-themed px-5 py-4">{footer}</div>}
      </aside>
    </div>,
    document.body
  )
}
