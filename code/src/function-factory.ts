import extraction from './functions/extraction';
import install_initial_domain_mapping from './functions/install_initial_domain_mapping';
import { loadData } from './functions/loading/workers/load-data';

export const functionFactory = {
  extraction,
  install_initial_domain_mapping,
  loading: loadData,
} as const;

export type FunctionFactoryType = keyof typeof functionFactory;
