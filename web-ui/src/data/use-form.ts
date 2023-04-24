
import { create } from 'zustand'

export interface DomainState {
    domains: string[]
    setDomains: (domains: DomainState['domains']) => void
}

const useDomains = create<DomainState>((set) => {
    return {
        domains: [],
        setDomains: (domains: string[]) => set({
            domains
        })
    }
})

export { useDomains }
