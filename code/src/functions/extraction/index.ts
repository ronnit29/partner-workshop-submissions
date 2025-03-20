import { AirdropEvent, EventType, spawn } from '@devrev/ts-adaas';

interface WorkdayExtractorState {
  hrData: { completed: boolean };
  financeData: { completed: boolean };
  users: { completed: boolean };
  attachments: { completed: boolean };
}

const initialState: WorkdayExtractorState = {
  hrData: { completed: false },
  financeData: { completed: false },
  users: { completed: false },
  attachments: { completed: false },
};

function getWorkerPerExtractionPhase(event: AirdropEvent) {
  let path;
  switch (event.payload.event_type) {
    case EventType.ExtractionExternalSyncUnitsStart:
      path = __dirname + '/workers/external-sync-units-extraction';
      break;
    case EventType.ExtractionMetadataStart:
      path = __dirname + '/workers/metadata-extraction';
      break;
    case EventType.ExtractionDataStart:
    case EventType.ExtractionDataContinue:
      path = __dirname + '/workers/data-extraction';
      break;
    case EventType.ExtractionAttachmentsStart:
    case EventType.ExtractionAttachmentsContinue:
      path = __dirname + '/workers/attachments-extraction';
      break;
  }
  return path;
}

const run = async (events: AirdropEvent[]) => {
  for (const event of events) {
    const file = getWorkerPerExtractionPhase(event);
    await spawn<WorkdayExtractorState>({
      event,
      initialState,
      workerPath: file,
    });
  }
};

export default run;
