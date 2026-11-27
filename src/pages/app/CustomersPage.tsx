import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { useNow } from '@/hooks/useNow'
import {
  cnhValid,
  dealPrice,
  dealsOfCustomer,
  modelLabel,
  tradeInsOfCustomer,
  vehicleById,
  vehicleLabel,
} from '@/data/query'
import { formatCurrency, formatDate } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import FilterBar from '@/components/ui/FilterBar'
import Drawer from '@/components/ui/Drawer'
import ModalBase from '@/components/ui/ModalBase'
import Pagination from '@/components/ui/Pagination'
import Avatar from '@/components/ui/Avatar'
import IconBase from '@/components/ui/IconBase'
import { DealStagePill } from '@/components/dl/StockPill'
import type { Customer } from '@/data/types'

const PAGE_SIZE = 12

export default function CustomersPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  usePageTitle(t('customers.title'))
  const now = useNow()
  const today = new Date(now).toISOString().slice(0, 10)

  const customers = useDealerStore((s) => s.customers)
  const deals = useDealerStore((s) => s.deals)
  const vehicles = useDealerStore((s) => s.vehicles)
  const tradeIns = useDealerStore((s) => s.tradeIns)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const saveCustomer = useDealerStore((s) => s.saveCustomer)
  const removeCustomer = useDealerStore((s) => s.removeCustomer)
  const notify = useUiStore((s) => s.notifySuccess)

  const [term, setTerm] = useState('')
  const [onlyExpired, setOnlyExpired] = useState(false)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', document: '', cnhUntil: '' })

  const rows = useMemo(() => {
    const lower = term.trim().toLowerCase()
    return customers.filter((c) => {
      if (onlyExpired && cnhValid(c, today)) return false
      if (!lower) return true
      return `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(lower)
    })
  }, [customers, term, onlyExpired, today])

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageItems = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const history = selected ? dealsOfCustomer(deals, selected.id) : []
  const bought = history.filter((d) => d.stage === 'aprovada')
  const trades = selected ? tradeInsOfCustomer(tradeIns, selected.id) : []

  const cnhCell = (customer: Customer) => {
    if (!customer.cnhUntil) {
      return <span className="text-xs text-muted">{t('customers.cnhMissing')}</span>
    }
    const valid = cnhValid(customer, today)
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
          valid
            ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
            : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'
        }`}
      >
        <IconBase name={valid ? 'check' : 'ban'} size={11} />
        {valid
          ? t('customers.cnhValid', { date: formatDate(customer.cnhUntil, lang) })
          : t('customers.cnhExpired', { date: formatDate(customer.cnhUntil, lang) })}
      </span>
    )
  }

  const submit = () => {
    saveCustomer({
      name: form.name,
      email: form.email,
      phone: form.phone,
      document: form.document,
      cnhUntil: form.cnhUntil ? new Date(`${form.cnhUntil}T12:00:00`).toISOString() : null,
    })
    setOpen(false)
    setForm({ name: '', email: '', phone: '', document: '', cnhUntil: '' })
    notify(t('customers.saved'))
  }

  const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'

  return (
    <div>
      <PageHeader
        title={t('customers.title')}
        subtitle={t('customers.subtitle')}
        crumbs={[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('customers.title') }]}
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="focus-ring flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <IconBase name="plus" size={16} />
            {t('customers.new')}
          </button>
        }
      />

      <FilterBar search={term} onSearch={setTerm} searchPlaceholder={t('customers.searchPlaceholder')}>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={onlyExpired}
            onChange={(e) => setOnlyExpired(e.target.checked)}
            className="h-4 w-4 rounded border-themed accent-brand-500"
          />
          {t('customers.onlyExpired')}
        </label>
      </FilterBar>

      {pageItems.length ? (
        <>
          <div className="surface-card overflow-hidden rounded-2xl border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-themed text-xs text-muted">
                    <th className="px-5 py-3 font-medium">{t('customers.columns.name')}</th>
                    <th className="px-5 py-3 font-medium">{t('customers.columns.contact')}</th>
                    <th className="px-5 py-3 font-medium">{t('customers.columns.document')}</th>
                    <th className="px-5 py-3 font-medium">{t('customers.columns.cnh')}</th>
                    <th className="px-5 py-3 font-medium">{t('customers.columns.deals')}</th>
                    <th className="px-5 py-3 font-medium">{t('customers.columns.since')}</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((customer) => (
                    <tr
                      key={customer.id}
                      className="cursor-pointer border-b border-themed last:border-0 hover:bg-gray-50 dark:hover:bg-white/5"
                      onClick={() => setSelected(customer)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={customer.avatar} name={customer.name} size="sm" />
                          <span className="font-medium text-heading">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-body">
                        <span className="block truncate text-xs">{customer.email}</span>
                        <span className="block text-xs text-muted">{customer.phone}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted">{customer.document}</td>
                      <td className="px-5 py-3">{cnhCell(customer)}</td>
                      <td className="px-5 py-3 text-body">{dealsOfCustomer(deals, customer.id).length}</td>
                      <td className="px-5 py-3 text-xs text-muted">{formatDate(customer.createdAt, lang)}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          title={t('common.remove')}
                          onClick={(e) => {
                            e.stopPropagation()
                            removeCustomer(customer.id)
                            notify(t('customers.removed'))
                          }}
                          className="text-muted transition hover:text-error-600"
                        >
                          <IconBase name="trash" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      ) : (
        <div className="surface-card rounded-2xl border">
          <EmptyState icon="users" title={t('customers.empty')} description={t('customers.emptyDesc')} />
        </div>
      )}

      {/* ---- Histórico ---- */}
      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={t('customers.historyTitle')}
        subtitle={selected?.name}
        width="max-w-lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar src={selected.avatar} name={selected.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-heading">{selected.name}</p>
                <p className="truncate text-xs text-muted">{selected.email}</p>
                <p className="mt-1">{cnhCell(selected)}</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-heading">{t('customers.bought')}</h4>
              {bought.length ? (
                <ul className="divide-y divide-themed">
                  {bought.map((deal) => {
                    const vehicle = vehicleById(vehicles, deal.vehicleId)
                    return (
                      <li key={deal.id} className="flex items-center justify-between gap-3 py-2.5">
                        <Link
                          to={`/app/proposta/${deal.id}`}
                          className="min-w-0 flex-1 truncate text-sm text-heading hover:text-brand-600"
                        >
                          {vehicle ? vehicleLabel(models, brands, vehicle) : '—'}
                        </Link>
                        <span className="shrink-0 text-sm font-semibold text-heading">
                          {formatCurrency(dealPrice(deal, vehicle), lang)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted">{t('customers.noHistory')}</p>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-heading">{t('deals.title')}</h4>
              {history.length ? (
                <ul className="divide-y divide-themed">
                  {history.slice(0, 10).map((deal) => {
                    const vehicle = vehicleById(vehicles, deal.vehicleId)
                    return (
                      <li key={deal.id} className="flex items-center gap-3 py-2.5">
                        <DealStagePill stage={deal.stage} />
                        <Link
                          to={`/app/proposta/${deal.id}`}
                          className="min-w-0 flex-1 truncate text-sm text-body hover:text-brand-600"
                        >
                          {vehicle ? vehicleLabel(models, brands, vehicle) : '—'}
                        </Link>
                        <span className="shrink-0 text-xs text-muted">{formatDate(deal.movedAt, lang)}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted">{t('customers.noHistory')}</p>
              )}
            </div>

            {trades.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-heading">{t('appraisals.title')}</h4>
                <ul className="divide-y divide-themed">
                  {trades.slice(0, 6).map((trade) => (
                    <li key={trade.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="min-w-0 flex-1 truncate text-sm text-body">
                        {modelLabel(models, brands, trade.modelId)} · {trade.year}
                      </span>
                      <span className="shrink-0 text-xs text-muted">{formatDate(trade.createdAt, lang)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* ---- Novo cliente ---- */}
      <ModalBase
        open={open}
        onClose={() => setOpen(false)}
        title={t('customers.new')}
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="focus-ring rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={submit}
              className="focus-ring rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              {t('common.save')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="c-name">
              {t('customers.columns.name')}
            </label>
            <input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={control} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="c-email">
                {t('auth.email')}
              </label>
              <input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={control} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="c-phone">
                {t('drive.yourPhone')}
              </label>
              <input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={control} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="c-doc">
                {t('customers.columns.document')}
              </label>
              <input id="c-doc" value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} className={control} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="c-cnh">
                {t('drive.cnh')}
              </label>
              <input id="c-cnh" type="date" value={form.cnhUntil} onChange={(e) => setForm({ ...form, cnhUntil: e.target.value })} className={control} />
            </div>
          </div>
        </div>
      </ModalBase>
    </div>
  )
}
