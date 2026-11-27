import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { dlImage } from '@/data/mock'
import IconBase from '@/components/ui/IconBase'

interface Props {
  seeds: string[]
  alt: string
}

/** Galeria do veículo: foto grande e miniaturas clicáveis. */
export default function VehicleGallery({ seeds, alt }: Props) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const list = seeds.length ? seeds : ['veiculo-sem-foto']
  const current = Math.min(index, list.length - 1)

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-themed">
        <img src={dlImage(list[current], 1200, 800)} alt={alt} className="aspect-[3/2] w-full object-cover" />
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((current - 1 + list.length) % list.length)}
              aria-label={t('common.previous')}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-700 backdrop-blur transition hover:bg-white dark:bg-gray-900/80 dark:text-gray-100"
            >
              <IconBase name="chevron-left" size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIndex((current + 1) % list.length)}
              aria-label={t('common.next')}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-700 backdrop-blur transition hover:bg-white dark:bg-gray-900/80 dark:text-gray-100"
            >
              <IconBase name="chevron-right" size={18} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-gray-900/70 px-2.5 py-1 text-xs font-medium text-white">
              {current + 1}/{list.length}
            </span>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
          {list.map((seed, i) => (
            <button
              key={seed}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${t('vehicle.gallery')} ${i + 1}`}
              className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === current ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={dlImage(seed, 200, 150)} alt="" className="h-16 w-24 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
