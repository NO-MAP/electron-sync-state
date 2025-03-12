import { SyncStateConfig } from "../types";
import { ref, watch, type Ref } from "@vue/reactivity";

const createSyncState = <T>(data: T, config: SyncStateConfig): Ref<T> => {
  const state = ref(data) as Ref<T>;
  const channels = {

  }
  watch(
    () => state.value,
    (value) => {
      console.log("state changed", value);
    },
    {
      deep: true,
    }
  );
  console.log("createSyncState", data, config);
  return state;
};

export { type SyncStateConfig, createSyncState };
