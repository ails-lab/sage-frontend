<template>
  <div class="login-register-box">
    <!-- wrap-->
    <div class="login-register-header">
      <h1>
        {{ $t("account.sage_brand") }}
        {{ instance.label ? instance.label : "" }}
      </h1>
      <h2>{{ $t("account.signin.header") }}</h2>
      <p>
        {{ $t("account.signin.header_disclaimer") }}
      </p>
    </div>
    <!-- body-->
    <transition name="switch" mode="out-in">
      <div v-if="signinMode" class="login-register-body">
        <form class="sage-form" @submit="login($event)">
          <div class="field">
            <div class="form-sublabel">
              {{ $t("account.email_label") }}
            </div>
            <input
              v-model="email"
              class="form-control"
              type="text"
              aria-label="mappingName"
            />
          </div>
          <div class="field">
            <div class="form-sublabel space">
              {{ $t("account.password_label") }}
            </div>
            <input
              v-model="password"
              class="form-control"
              type="password"
              aria-label="mappingName"
            />
            <!-- notify-->
            <div class="form-notify">
              <NuxtLink to="forgot-password">
                {{ $t("account.signin.forgot_password") }}
              </NuxtLink>
            </div>
          </div>
          <div v-if="errorRequest" class="field">
            <p class="error-paragraph">
              {{ $t("account.signin.wrong_credentials") }}
            </p>
          </div>
          <div class="field space">
            <button
              class="btn btn-primary"
              type="submit"
              :disabled="email == '' || password == ''"
              @click="login($event)"
            >
              {{ $t("account.signin.signin_button") }}
            </button>
          </div>
          <div class="field signup">
            {{ $t("account.signin.no_account") }}
            <NuxtLink to="signup">
              {{ $t("account.signin.signup_link") }}
            </NuxtLink>
          </div>
        </form>
      </div>
      <div v-else class="login-register-body">
        <form class="sage-form" @submit="loginWithRole($event)">
          <div class="field">
            <!-- <div class="form-sublabel">{{ $t("ROLE") }}</div> -->
            <select
              v-model="selectedRole"
              class="form-select"
              aria-label="Default select example"
            >
              <option selected value="">
                {{ $t("account.signin.choose_role") }}
              </option>
              <option v-for="role of pendingRoles" :key="role" :value="role">
                {{ role }}
              </option>
            </select>
          </div>
          <div class="field space">
            <button
              class="btn btn-primary"
              type="submit"
              :disabled="!selectedRole.length"
              @click="loginWithRole($event)"
            >
              {{ $t("account.signin.continue") }}
            </button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
const { fetchInstance } = useCurrentInstanceInfoStore();
const { instance } = storeToRefs(useCurrentInstanceInfoStore());
const { authenticateUser, authenticateUserWithRole } = useAuthStore(); // use authenticateUser action from  auth store
const { errorRequest, pendingRoles } = storeToRefs(useAuthStore()); // make authenticated state reactive with storeToRefs

definePageMeta({
  layout: "auth",
});

const signinMode = ref<boolean>(true);
const email = ref<string>("");
const password = ref<string>("");
const selectedRole = ref<string>("");

onMounted(() => {
  fetchInstance();
});

const login = async (e: Event) => {
  e.preventDefault();
  await authenticateUser(email.value, password.value); // call authenticateUser and pass the user object
  if (errorRequest.value) {
    return;
  }
  if (pendingRoles.value.length) {
    signinMode.value = false;
    return;
  }

  return navigateTo("/");
};

const loginWithRole = async (e: Event) => {
  e.preventDefault();
  await authenticateUserWithRole(
    email.value,
    password.value,
    selectedRole.value
  ); // call authenticateUser and pass the user object
  if (errorRequest.value) {
    signinMode.value = true;
    password.value = "";
    email.value = "";
    return;
  }

  return navigateTo("/");
};
</script>

<style scoped>
.form-select {
  cursor: pointer;
}
.switch-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}
.switch-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
.switch-enter-active {
  transition: all 0.5s ease;
}
.switch-leave-active {
  transition: all 0.5s ease;
  width: 100%;
}
.error-paragraph {
  color: #f02849;
  font-size: 14px;
}
</style>
