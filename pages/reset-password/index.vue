<template>
  <div class="login-register-box">
    <!-- wrap-->
    <div class="login-register-header">
      <h1>
        {{ $t("account.sage_brand") }}
        {{ instance.label ? instance.label : "" }}
      </h1>
      <h2>{{ $t("account.reset_password.header") }}</h2>
      <p>
        {{ $t("account.reset_password.header_disclaimer") }}
      </p>
    </div>
    <!-- body-->
    <div class="login-register-body">
      <form class="sage-form" @submit="resetPasswordClicked($event)">
        <div class="alert alert-success fade show">
          <div class="alert-ic">
            <img class="ic" src="@images/ic-info-blue.svg" alt="sage_logo" />
          </div>
          <div class="alert-message">
            {{ $t("account.signup.password_disclaimer_line_1") }}
            <ul>
              <li>{{ $t("account.signup.password_disclaimer_line_2") }}</li>
              <li>{{ $t("account.signup.password_disclaimer_line_3") }}</li>
              <li>{{ $t("account.signup.password_disclaimer_line_4") }}</li>
            </ul>
          </div>
        </div>
        <div class="field">
          <div class="form-sublabel">{{ $t("account.password_label") }}</div>
          <input
            v-model="password"
            class="form-control"
            type="password"
            aria-label="mappingName"
          />
        </div>
        <div class="field">
          <div class="form-sublabel">
            {{ $t("account.repeat_password_label") }}
          </div>
          <input
            v-model="repeatPassword"
            class="form-control"
            type="password"
            aria-label="mappingName"
          />
        </div>

        <div v-if="error.length" class="field">
          <p class="error-paragraph">
            {{ error }}
          </p>
        </div>
        <div class="field space">
          <button
            class="btn btn-primary"
            :disabled="!password.length || !repeatPassword.length"
            type="submit"
            @click="resetPasswordClicked($event)"
          >
            {{ $t("account.reset_password.reset_password_button") }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchInstance } = useCurrentInstanceInfoStore();
const { instance } = storeToRefs(useCurrentInstanceInfoStore());
const { resetPassword } = useAuthStore(); // use authenticateUser action from  auth store
const { errorRequest, errorMessage } = storeToRefs(useAuthStore()); // make authenticated state reactive with storeToRefs
const route = useRoute();

definePageMeta({
  layout: "auth",
});

const token = route.query.token as string | null;
const password = ref<string>("");
const repeatPassword = ref<string>("");
const error = ref<string>("");

onMounted(() => {
  fetchInstance();
});

const resetPasswordClicked = async (e: Event) => {
  e.preventDefault();
  error.value = "";
  const validate = validateUserForm(password.value, repeatPassword.value);
  if (!validate.validated) {
    error.value = validate.error;
    return;
  }

  await resetPassword(password.value, token);
  if (errorRequest.value) {
    error.value = errorMessage.value;
    return;
  }

  return navigateTo("/signin");
};
</script>

<style scoped>
.form-select {
  cursor: pointer;
}
.error-paragraph {
  color: #f02849;
  font-size: 14px;
}
.success-paragraph {
  color: hwb(112deg 10.19% 43.3%);
  font-size: 14px;
}
</style>
