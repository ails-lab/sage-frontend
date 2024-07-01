export default defineNuxtRouteMiddleware((to) => {
  const { authenticated } = storeToRefs(useAuthStore()); // make authenticated state reactive
  const token = useCookie("accessToken"); // get token from cookies

  if (token.value) {
    // check if value exists
    authenticated.value = true; // update the state to authenticated
  }

  // if token exists and url is /signin redirect to homepage
  if (token.value && to?.fullPath.startsWith("/signin")) {
    return navigateTo("/");
  }

  // if token doesn't exist redirect to log in
  if (
    !token.value &&
    !to?.fullPath.startsWith("/signin") &&
    !to?.fullPath.startsWith("/signup") &&
    !to?.fullPath.startsWith("/forgot-password") &&
    !to?.fullPath.startsWith("/reset-password")
  ) {
    abortNavigation();
    return navigateTo("/signin");
  }
});
