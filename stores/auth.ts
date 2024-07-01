import { defineStore } from "pinia";
import type { User } from "@/types/User";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    currentUser: {} as User,
    authenticated: false,
    pendingRoles: [] as string[],
    errorRequest: false,
    errorMessage: "" as string,
  }),
  actions: {
    async register(name: string, email: string, password: string) {
      this.$reset();

      const { $registerUser } = useNuxtApp();

      const { error }: any = await $registerUser(name, email, password);

      if (error.value) {
        this.errorRequest = true;
        return;
      }
      await this.authenticateUser(email, password);
    },
    async authenticateUser(email: string, password: string) {
      this.$reset();

      const { $signinUser } = useNuxtApp();

      const { data, error }: any = await $signinUser(email, password);

      if (error.value) {
        this.errorRequest = true;
        return;
      }
      if (data.value.data.roles) {
        this.pendingRoles = data.value.data.roles;
        return;
      }
      if (data.value) {
        const token = useCookie("accessToken");
        token.value = data?.value?.data.token.accessToken;
        this.authenticated = true;
      }
    },
    async authenticateUserWithRole(
      email: string,
      password: string,
      role: string
    ) {
      const { $signinUserWithRole } = useNuxtApp();

      const { data, error }: any = await $signinUserWithRole(
        email,
        password,
        role
      );

      if (error.value) {
        this.errorRequest = true;
        return;
      }
      if (data.value.data.roles) {
        this.pendingRoles = data.value.data.roles;
        return;
      }
      if (data.value) {
        const token = useCookie("accessToken");
        token.value = data?.value?.data.token.accessToken;
        this.authenticated = true;
      }
    },
    async retrievePassword(email: string) {
      this.$reset();

      const { $retrievePassword } = useNuxtApp();

      const { error }: any = await $retrievePassword(email);

      if (error.value) {
        this.errorRequest = true;
        this.errorMessage = "Email not found";
      }
    },
    async resetPassword(password: string, token: string | null) {
      this.$reset();

      const { $resetPassword } = useNuxtApp();

      const { error }: any = await $resetPassword(password, token);

      if (error.value) {
        this.errorRequest = true;
        this.errorMessage =
          "Something wrong with your token. Please make sure that you clicked the correct link in your email.";
      }
    },
    async logUserOut() {
      this.$reset();

      const { $signOutUser } = useNuxtApp();

      const { error }: any = await $signOutUser();
      if (error.value) {
        this.errorRequest = true;
        this.errorMessage = "User logout failed. Please try again.";
      }

      const token = useCookie("accessToken");
      this.authenticated = false;
      token.value = null;
      return navigateTo("/signin");
    },
    async fetchCurrentUser() {
      const { $getCurrentUser } = useNuxtApp();

      const { data, error } = await $getCurrentUser();
      if (error.value || !data.value) {
        this.errorRequest = true;
        this.errorMessage =
          "You have been logged out. You need to sign in again.";
      }
      if (data.value) this.currentUser = data.value.data;
    },
  },
});
