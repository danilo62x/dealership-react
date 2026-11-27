import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RULES, seedData, slugify } from '@/data/mock'
import { driveConflict, cnhValid, customerById, modelById, vehicleById } from '@/data/query'
import type {
  Brand,
  Customer,
  Deal,
  DealStage,
  Model,
  Rules,
  Seller,
  StockState,
  TestDrive,
  TradeIn,
  Vehicle,
} from '@/data/types'

/**
 * A semente nasce com datas relativas a hoje. Se a demonstração ficar guardada
 * no navegador por dias, a agenda de test-drive e o funil de 90 dias saem do
 * lugar — por isso a base é refeita depois de algumas horas.
 */
const SEED_TTL_MS = 6 * 3_600_000

const nextId = (list: { id: number }[]) => (list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1)

export interface DriveRequest {
  vehicleId: number
  customerId: number
  sellerId: number
  date: string
  from: string
  to: string
}

/**
 * O agendamento devolve os três motivos de recusa separados: a agenda do
 * veículo, a agenda do vendedor e a CNH. A tela mostra qual deles bateu.
 */
export interface DriveResult {
  ok: boolean
  cnhOk: boolean
  vehicleClash?: TestDrive
  sellerClash?: TestDrive
  drive?: TestDrive
}

interface DealerState {
  brands: Brand[]
  models: Model[]
  vehicles: Vehicle[]
  customers: Customer[]
  sellers: Seller[]
  deals: Deal[]
  tradeIns: TradeIn[]
  drives: TestDrive[]
  rules: Rules
  seededAt: number

  // estoque
  saveVehicle: (patch: Partial<Vehicle> & { id?: number }) => Vehicle
  removeVehicle: (id: number) => void
  setVehicleState: (id: number, state: StockState) => void

  // propostas
  moveDeal: (id: number, stage: DealStage, lostReason?: string) => void
  saveDeal: (patch: Partial<Deal> & { id?: number }) => Deal
  removeDeal: (id: number) => void
  /** Fecha a venda de uma proposta aprovada: o veículo sai do estoque. */
  closeSale: (dealId: number) => void

  // avaliações de troca
  saveTradeIn: (patch: Partial<TradeIn> & { id?: number }) => TradeIn
  setTradeInAccepted: (id: number, accepted: boolean) => void

  // test-drives
  scheduleDrive: (input: DriveRequest) => DriveResult
  setDriveStatus: (id: number, status: TestDrive['status']) => void

  // clientes
  saveCustomer: (patch: Partial<Customer> & { id?: number }) => Customer
  removeCustomer: (id: number) => void

  // regras
  saveRules: (patch: Partial<Rules>) => void

  reset: () => void
}

export const useDealerStore = create<DealerState>()(
  persist(
    (set, get) => ({
      ...seedData(),

      // ---- estoque ------------------------------------------------------

      saveVehicle(patch) {
        const list = get().vehicles
        if (patch.id) {
          const updated = list.map((v) => (v.id === patch.id ? { ...v, ...patch } : v))
          set({ vehicles: updated })
          return updated.find((v) => v.id === patch.id)!
        }

        const id = nextId(list)
        const model = modelById(get().models, patch.modelId ?? get().models[0].id)
        const brand = get().brands.find((b) => b.id === model?.brandId)
        const version = patch.version ?? 'Padrão'
        const modelYear = patch.modelYear ?? patch.year ?? new Date().getFullYear()
        const slug = `${brand?.slug ?? 'veiculo'}-${slugify(model?.name ?? 'modelo')}-${slugify(version)}-${modelYear}-${id}`

        const created: Vehicle = {
          id,
          slug,
          modelId: model?.id ?? 1,
          version,
          year: patch.year ?? modelYear,
          modelYear,
          km: patch.km ?? 0,
          color: patch.color ?? 'Branco',
          plateEnd: patch.plateEnd ?? '0',
          transmission: patch.transmission ?? 'manual',
          fuel: patch.fuel ?? 'flex',
          doors: patch.doors ?? 4,
          options: patch.options ?? [],
          photoSeeds: patch.photoSeeds ?? [`${slug}-a`, `${slug}-b`, `${slug}-c`],
          acquisitionCost: patch.acquisitionCost ?? 0,
          prepCost: patch.prepCost ?? 0,
          price: patch.price ?? 0,
          state: patch.state ?? 'preparacao',
          // A entrada define o início da contagem de dias em estoque.
          arrivedAt: patch.arrivedAt ?? new Date().toISOString(),
          soldAt: null,
        }
        set({ vehicles: [...list, created] })
        return created
      },

      removeVehicle(id) {
        set({
          vehicles: get().vehicles.filter((v) => v.id !== id),
          deals: get().deals.filter((d) => d.vehicleId !== id),
          drives: get().drives.filter((d) => d.vehicleId !== id),
        })
      },

      setVehicleState(id, state) {
        // `arrivedAt` nunca é tocado aqui: mudar de situação não zera os dias.
        set({
          vehicles: get().vehicles.map((v) =>
            v.id === id
              ? { ...v, state, soldAt: state === 'vendido' ? (v.soldAt ?? new Date().toISOString()) : null }
              : v
          ),
        })
      },

      // ---- propostas ----------------------------------------------------

      /**
       * Mover a proposta mexe no estoque: entrar em `aprovada` reserva o
       * veículo e ele some da vitrine; sair de `aprovada` libera. Em nenhum
       * dos dois caminhos `arrivedAt` muda — os dias em estoque continuam.
       */
      moveDeal(id, stage, lostReason) {
        const deal = get().deals.find((d) => d.id === id)
        if (!deal || deal.stage === stage) return

        const entering = stage === 'aprovada'
        const leaving = deal.stage === 'aprovada'

        const vehicles = get().vehicles.map((v) => {
          if (v.id !== deal.vehicleId) return v
          if (entering && v.state === 'disponivel') return { ...v, state: 'reservado' as StockState }
          if (leaving && v.state === 'reservado') return { ...v, state: 'disponivel' as StockState }
          return v
        })

        set({
          vehicles,
          deals: get().deals.map((d) =>
            d.id === id
              ? {
                  ...d,
                  stage,
                  movedAt: new Date().toISOString(),
                  lostReason: stage === 'perdida' ? (lostReason ?? d.lostReason ?? '') : undefined,
                }
              : d
          ),
        })
      },

      saveDeal(patch) {
        const list = get().deals
        if (patch.id) {
          const updated = list.map((d) => (d.id === patch.id ? { ...d, ...patch } : d))
          set({ deals: updated })
          return updated.find((d) => d.id === patch.id)!
        }
        const now = new Date().toISOString()
        const created: Deal = {
          id: nextId(list),
          vehicleId: patch.vehicleId ?? 0,
          customerId: patch.customerId ?? 0,
          sellerId: patch.sellerId ?? get().sellers[0].id,
          stage: patch.stage ?? 'contato',
          createdAt: patch.createdAt ?? now,
          movedAt: patch.movedAt ?? now,
          discount: patch.discount ?? 0,
          tradeInId: patch.tradeInId ?? null,
          finance: patch.finance ?? null,
        }
        set({ deals: [...list, created] })
        return created
      },

      removeDeal(id) {
        const deal = get().deals.find((d) => d.id === id)
        if (deal && deal.stage === 'aprovada') {
          set({
            vehicles: get().vehicles.map((v) =>
              v.id === deal.vehicleId && v.state === 'reservado' ? { ...v, state: 'disponivel' as StockState } : v
            ),
          })
        }
        set({ deals: get().deals.filter((d) => d.id !== id) })
      },

      closeSale(dealId) {
        const deal = get().deals.find((d) => d.id === dealId)
        if (!deal || deal.stage !== 'aprovada') return
        const now = new Date().toISOString()
        set({
          vehicles: get().vehicles.map((v) =>
            v.id === deal.vehicleId ? { ...v, state: 'vendido' as StockState, soldAt: v.soldAt ?? now } : v
          ),
        })
      },

      // ---- trocas -------------------------------------------------------

      saveTradeIn(patch) {
        const list = get().tradeIns
        if (patch.id) {
          const updated = list.map((t) => (t.id === patch.id ? { ...t, ...patch } : t))
          set({ tradeIns: updated })
          return updated.find((t) => t.id === patch.id)!
        }
        const created: TradeIn = {
          id: nextId(list),
          dealId: patch.dealId ?? null,
          customerId: patch.customerId ?? 0,
          modelId: patch.modelId ?? get().models[0].id,
          year: patch.year ?? new Date().getFullYear() - 3,
          km: patch.km ?? 0,
          condition: patch.condition ?? 'bom',
          options: patch.options ?? [],
          accepted: patch.accepted ?? false,
          createdAt: patch.createdAt ?? new Date().toISOString(),
        }
        set({ tradeIns: [...list, created] })
        return created
      },

      setTradeInAccepted(id, accepted) {
        set({ tradeIns: get().tradeIns.map((t) => (t.id === id ? { ...t, accepted } : t)) })
      },

      // ---- test-drives --------------------------------------------------

      scheduleDrive(input) {
        const { drives, customers } = get()
        const customer = customerById(customers, input.customerId)
        const clash = driveConflict(input, drives)
        const cnhOk = cnhValid(customer, input.date)

        if (clash.vehicle || clash.seller || !cnhOk) {
          return { ok: false, cnhOk, vehicleClash: clash.vehicle, sellerClash: clash.seller }
        }

        const drive: TestDrive = {
          id: nextId(drives),
          vehicleId: input.vehicleId,
          customerId: input.customerId,
          sellerId: input.sellerId,
          date: input.date,
          from: input.from,
          to: input.to,
          status: 'agendado',
          cnhOk: true,
        }
        set({ drives: [...drives, drive] })
        return { ok: true, cnhOk: true, drive }
      },

      setDriveStatus(id, status) {
        set({ drives: get().drives.map((d) => (d.id === id ? { ...d, status } : d)) })
      },

      // ---- clientes -----------------------------------------------------

      saveCustomer(patch) {
        const list = get().customers
        if (patch.id) {
          const updated = list.map((c) => (c.id === patch.id ? { ...c, ...patch } : c))
          set({ customers: updated })
          return updated.find((c) => c.id === patch.id)!
        }
        const created: Customer = {
          id: nextId(list),
          name: patch.name ?? 'Novo cliente',
          email: patch.email ?? '',
          phone: patch.phone ?? '',
          document: patch.document ?? '',
          avatar: patch.avatar ?? '',
          cnhUntil: patch.cnhUntil ?? null,
          createdAt: patch.createdAt ?? new Date().toISOString(),
        }
        set({ customers: [...list, created] })
        return created
      },

      removeCustomer(id) {
        set({ customers: get().customers.filter((c) => c.id !== id) })
      },

      // ---- regras -------------------------------------------------------

      saveRules(patch) {
        set({ rules: { ...get().rules, ...patch } })
      },

      reset() {
        set({ ...seedData(), rules: RULES })
      },
    }),
    {
      name: 'dl-data',
      onRehydrateStorage: () => (state) => {
        // Semente velha = agenda e funil fora do lugar: melhor recomeçar.
        if (state && Date.now() - state.seededAt > SEED_TTL_MS) state.reset()
      },
    }
  )
)

/** Atalho: o veículo de uma proposta. */
export function dealVehicle(deal: Deal, vehicles: Vehicle[]): Vehicle | undefined {
  return vehicleById(vehicles, deal.vehicleId)
}
