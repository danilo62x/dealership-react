import { useSyncExternalStore } from 'react'

/**
 * Relógio compartilhado da aplicação inteira.
 *
 * Toda derivação que depende de "agora" — dias em estoque, giro lento, agenda
 * do test-drive, funil dos últimos 90 dias — lê **este** valor. É uma leitura
 * só por render: se cada card chamasse `Date.now()` por conta própria, dois
 * cards da mesma lista poderiam cair em dias diferentes e o contador de dias
 * em estoque mudaria a cada F5.
 *
 * Existe um único `setInterval` para a página toda, ligado quando o primeiro
 * componente assina e desligado quando o último sai. O passo é de um minuto:
 * nada aqui muda de segundo em segundo.
 */
const STEP_MS = 60_000

let now = Date.now()
let timer: number | null = null
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  if (timer === null) {
    timer = window.setInterval(() => {
      now = Date.now()
      listeners.forEach((fn) => fn())
    }, STEP_MS)
  }
  return () => {
    listeners.delete(onChange)
    if (listeners.size === 0 && timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
  }
}

const getSnapshot = () => now

/** Milissegundos de "agora", estável dentro do mesmo minuto. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
