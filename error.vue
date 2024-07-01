<template>
  <NuxtLayout name="auth">
    <div class="login-register-box">
      <div class="login-register-header">
        <h1>{{ $t("error.sage_brand") }}</h1>
        <h2>{{ $t("error.header") }}</h2>
        <p>
          {{ $t("error.status_code") }}:
          <span class="font-weight-toned">{{ error.statusCode }}</span>
        </p>
        <p>
          {{ $t("error.message") }}:
          <span class="font-weight-toned">{{ error.statusMessage }}</span>
        </p>
      </div>
      <div class="login-register-body">
        <div class="sage-form">
          <div class="field space">
            <NuxtLink class="btn btn-primary" to="/">
              {{ $t("error.go_home") }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
defineProps({
  error: {
    type: Object,
    default: null,
  },
});
</script>
<style lang="scss" scoped>
.btn-primary {
  max-width: fit-content;
  padding: 7px 25px !important;
}
.font-weight-toned {
  font-weight: 500;
}
</style>
