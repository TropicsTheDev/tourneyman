import type { Store, EventObject, StoreSnapshot } from "@xstate/store";
import type { ShallowRef } from "vue";

type StoreContextType<T> = T extends Store<infer C, any, any> ? C : never;
type StoreTriggerType<T> = T extends Store<any, any, any>
  ? T["trigger"]
  : never;
export default function use_store<TStore extends Store<any, any, any>>(
  store: TStore
): {
  state: ShallowRef<StoreContextType<TStore>>;
  triggers: StoreTriggerType<TStore>;
} {
  type TContext = StoreContextType<TStore>;
  const state: ShallowRef<StoreContextType<TStore>> = shallowRef(
    store.get().context
  );

  const unsubscribe = store.subscribe((snapshot: StoreSnapshot<TContext>) => {
    state.value = snapshot.context;
  });

  onUnmounted(unsubscribe);

  return {
    state,
    triggers: store.trigger as StoreTriggerType<TStore>,
  };
}
