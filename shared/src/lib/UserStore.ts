
import { create } from "zustand";
import { Stop, Line } from "./MetrolinxTypes";

// Set cache call time
// If last call less than x minutes ago, use cache
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache for stops and lines

/*
  This project uses Zustand to handle state throughout the app
  State and Action define the variables and functions which can be accessed by the app
  useUserStore defines the default variables, and behaviour of the functions

  The Functions and Variables are hooks that react functions can use to update data
*/

type State = {
  nav: any,
  menuBarShown: boolean,

  // GO Transit Data
  stops: Stop[],
  stopsLastFetched: number | null,
  lines: Line[],
  linesLastFetched: number | null,
};

type Action = {
  setNav: (data: State["nav"]) => void,
  setMenuBarShown: (data: State["menuBarShown"]) => void,

  // GO Transit Actions
  setStops: (data: Stop[]) => void,
  setLines: (data: Line[]) => void,
  shouldRefetchStops: () => boolean,
  shouldRefetchLines: () => boolean,
};

export const useUserStore = create<State & Action>((set, get) => ({
  nav: null,
  menuBarShown: true,

  // GO Transit Data
  stops: [],
  stopsLastFetched: null,
  lines: [],
  linesLastFetched: null,

  setMenuBarShown: (data) => set(() => ({menuBarShown: data})),
  setNav: (data) => set(() => ({nav: data})),

  // GO Transit Actions
  setStops: (data) => set(() => ({
    stops: data,
    stopsLastFetched: Date.now()
  })),

  setLines: (data) => set(() => ({
    lines: data,
    linesLastFetched: Date.now()
  })),

  shouldRefetchStops: () => {
    const state = get();
    if (!state.stopsLastFetched || state.stops.length === 0) return true;
    return Date.now() - state.stopsLastFetched > CACHE_DURATION;
  },

  shouldRefetchLines: () => {
    const state = get();
    if (!state.linesLastFetched || state.lines.length === 0) return true;
    return Date.now() - state.linesLastFetched > CACHE_DURATION;
  },
}))
