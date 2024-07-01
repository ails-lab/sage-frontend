export const hideOffcanvas = (offCanvasRef: any): void => {
  const { $bootstrap } = useNuxtApp();

  // Hide off canvas after saving dataset successfully
  // this is a "hack" because for some reason the _isShown variable was false even when
  // the offcanvas was open and consequently, the hide method did not work.
  // So, we changed the _isShown manually.

  let bsOffcanvas;
  if (offCanvasRef.value.canvasRef) {
    bsOffcanvas = new $bootstrap.Offcanvas(offCanvasRef.value.canvasRef);
  } else {
    bsOffcanvas = new $bootstrap.Offcanvas(offCanvasRef.value);
  }
  bsOffcanvas._isShown = true;
  bsOffcanvas.hide();
};

export const showCanvasById = (offCanvasId: string) => {
  // Another way to do it
  // const canvasToShow = document.getElementById("offcanvasNewAnnotator");
  // const bootstrapCanvas = new $bootstrap.Offcanvas(canvasToShow);
  // bootstrapCanvas.toggle();

  const canvasToShow = document.getElementById(offCanvasId);
  if (!canvasToShow) {
    return;
  }
  canvasToShow?.classList.add("show");
};
