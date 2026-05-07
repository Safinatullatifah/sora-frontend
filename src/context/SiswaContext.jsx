import { createContext, useContext } from 'react';

export const SiswaContext = createContext();

export const useSiswa = () => useContext(SiswaContext);