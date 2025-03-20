import { LoaderEventType, processTask, WorkerAdapter } from '@devrev/ts-adaas';

import { HttpClient } from '../../external-system/http-client';

interface LoadItemTypesResponse {
  reports: any;
  processed_files: any;
  gong_data: any;
}

// Extend adapter to include loadItemTypesResponse method
interface MyAdapter extends WorkerAdapter<unknown> {
  loadItemTypesResponse: () => Promise<LoadItemTypesResponse>;
}

processTask({
  task: async ({ adapter }) => {
    const event = adapter.event || {};
    const httpClient = new HttpClient(event);

    // Cast adapter to MyAdapter to avoid TypeScript error
    const { reports, processed_files, gong_data } = await (adapter as MyAdapter).loadItemTypesResponse();

    // existing code
    console.log(reports, processed_files, gong_data);
  },
  onTimeout: async ({ adapter }) => {
    await adapter.postState();
    await adapter.emit(LoaderEventType.DataLoadingProgress, {
      reports: adapter.reports,
      processed_files: adapter.processedFiles,
    });
  },
});

export const loadData = async () => {
  // Your loading logic here
};

export const anotherFunction = () => {
  // Another function logic here
};
