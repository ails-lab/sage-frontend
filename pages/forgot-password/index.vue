<template>
  <div class="login-register-box">
    <!-- wrap-->
    <div class="login-register-header">
      <h1>
        {{ $t("account.sage_brand") }}
        {{ instance.label ? instance.label : "" }}
      </h1>
      <h2>{{ $t("account.forgot.header") }}</h2>
      <p>
        {{ $t("account.forgot.header_disclaimer") }}
      </p>
    </div>
    <!-- body-->
    <div class="login-register-body">
      <form class="sage-form" @submit="retrievePasswordClicked($event)">
        <div class="field">
          <div class="form-sublabel">{{ $t("account.email_label") }}</div>
          <input
            v-model="email"
            class="form-control"
            type="text"
            aria-label="mappingName"
          />
        </div>

        <div v-if="errorRequest" class="field">
          <p class="error-paragraph">
            {{ errorMessage }}
          </p>
        </div>
        <div v-else-if="submitted" class="field">
          <p class="success-paragraph">
            {{ $t("account.forgot.email_sent") }}
          </p>
        </div>
        <div class="field space">
          <button
            class="btn btn-primary"
            :disabled="!email.length"
            type="submit"
            @click="retrievePasswordClicked($event)"
          >
            {{ $t("account.forgot.forgot_button") }}
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
  </div>
</template>

<script setup lang="ts">
const { fetchInstance } = useCurrentInstanceInfoStore();
const { instance } = storeToRefs(useCurrentInstanceInfoStore());
const { retrievePassword } = useAuthStore(); // use authenticateUser action from  auth store
const { errorRequest, errorMessage } = storeToRefs(useAuthStore()); // make authenticated state reactive with storeToRefs

definePageMeta({
  layout: "auth",
});

const email = ref<string>("");
const submitted = ref<boolean>(false);

onMounted(() => {
  fetchInstance();
});

const retrievePasswordClicked = async (e: Event) => {
  e.preventDefault();
  await retrievePassword(email.value);
  submitted.value = true;
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
