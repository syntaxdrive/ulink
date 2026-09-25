import { create } from 'zustand';
import { type Job } from '../types';

interface JobsStore {
    jobs: Job[];
    lastFetched: number;
    myApplications: Record<string, string>;
    
    setJobs: (jobs: Job[]) => void;
    setMyApplications: (apps: Record<string, string>) => void;
    needsRefresh: () => boolean;
}

export const useJobsStore = create<JobsStore>((set, get) => ({
    jobs: [],
    lastFetched: 0,
    myApplications: {},
    
    setJobs: (jobs) => set({ 
        jobs, 
        lastFetched: Date.now() 
    }),
    
    setMyApplications: (myApplications) => set({ myApplications }),
    
    needsRefresh: () => {
        const state = get();
        if (state.jobs.length === 0) return true;
        // Refresh every 10 minutes
        return Date.now() - state.lastFetched > 1000 * 60 * 10;
    },
}));
