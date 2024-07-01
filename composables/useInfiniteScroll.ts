export const useInfiniteScroll = (
  scrollingEl: Ref<HTMLElement | null>, // scrolling area
  targetRef: Ref<HTMLElement | null>, // end of the area
  callback: (page: number) => any,
  reset?: (...args: any) => any,
  distance?: number
) => {
  const page = ref(0);
  const targetIsVisible = useElementVisibility(targetRef);
  const shouldStop = ref(false);

  useInfiniteScrollVueUse(
    scrollingEl,
    () => {
      // ref target is set to the last item of the current list
      // when this item becomes visible we load next page
      if (targetIsVisible.value && !shouldStop.value) {
        page.value++;
        callback(page.value);
      }
    },
    { distance }
  );

  const resetScroll = (...args: any) => {
    page.value = 0;
    shouldStop.value = false;
    reset?.(...args);
  };

  const stopScroll = () => {
    shouldStop.value = true;
  };

  return { resetScroll, stopScroll };
};
