<template>
  <div class="login-register-box">
    <div class="login-register-header">
      <h1>
        {{ $t("account.sage_brand") }}
        {{ instance.label ? instance.label : "" }}
      </h1>
      <h2>{{ $t("account.signup.header") }}</h2>
      <p>
        {{ $t("account.signup.header_disclaimer") }}
      </p>
    </div>
    <!-- body-->
    <div class="login-register-body">
      <form class="sage-form" @submit="signup($event)">
        <!-- alert-->
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
          <div class="form-sublabel space">
            {{ $t("account.name_label") }}
          </div>
          <input
            v-model="fullName"
            class="form-control"
            type="text"
            aria-label="mappingName"
          />
        </div>
        <div class="field">
          <div class="form-sublabel space">
            {{ $t("account.email_address_label") }}
          </div>
          <input
            v-model="email"
            class="form-control"
            type="email"
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
        </div>
        <div class="field">
          <div class="form-sublabel space">
            {{ $t("account.repeat_password_label") }}
          </div>
          <input
            v-model="repeatPassword"
            class="form-control"
            type="password"
            aria-label="mappingName"
          />
        </div>
        <div v-if="error.length" class="field space">
          <p class="error-paragraph">
            {{ error }}
          </p>
        </div>
        <div class="field doublespace">
          <button
            class="btn btn-primary"
            type="submit"
            :disabled="
              email == '' ||
              password == '' ||
              repeatPassword == '' ||
              fullName == ''
            "
            @click="signup($event)"
          >
            {{ $t("account.signup.signup_button") }}
          </button>
        </div>
        <div class="field signup">
          {{ $t("account.signup.have_account") }}
          <NuxtLink to="signin">
            {{ $t("account.signup.signin_link") }}
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchInstance } = useCurrentInstanceInfoStore();
const { instance } = storeToRefs(useCurrentInstanceInfoStore());
const { register } = useAuthStore(); // use authenticateUser action from  auth store
const { errorRequest } = storeToRefs(useAuthStore()); // make authenticated state reactive with storeToRefs

definePageMeta({
  layout: "auth",
});

const fullName = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const repeatPassword = ref<string>("");
const error = ref<string>("");

onMounted(() => {
  fetchInstance();
});

const signup = async (e: Event) => {
  e.preventDefault();
  error.value = "";
  const validate = validateUserForm(password.value, repeatPassword.value);
  if (!validate.validated) {
    error.value = validate.error;
    return;
  }
  await register(fullName.value, email.value, password.value);
  if (errorRequest.value) {
    error.value = "An error occurred. Please try again.";
  }
  return navigateTo("/");
};
</script>

<style scoped>
.error-paragraph {
  color: #f02849;
  font-size: 14px;
}
</style>
