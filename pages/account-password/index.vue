<template>
  <div class="wrap">
    <!-- profile-->
    <div class="account-profile">
      <!-- header-->
      <div class="account-profile-header">
        <div class="account-profile-info">
          <h4 class="account-profile-title">{{ $t("account.password") }}</h4>
          <p class="account-profile-description">
            {{ $t("account.password_page_text") }}
          </p>
        </div>
        <!-- button action-->
        <ul class="account-profile-action">
          <li class="main">
            <NuxtLink @click="saveNewPassword">{{ $t("save") }}</NuxtLink>
          </li>
        </ul>
      </div>
      <!-- header-->
      <div class="account-profile-body">
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
        <!-- form-->
        <div class="sage-form narrow">
          <!-- field name-->
          <div class="field row">
            <div class="col-12">
              <div class="form-sublabel">
                {{ $t("account.old_password_label") }}
              </div>
              <input
                v-model="oldPassword"
                class="form-control"
                type="password"
                aria-label="mappingName"
              />
              <div class="form-sublabel space">
                {{ $t("account.new_password_label") }}
              </div>
              <input
                v-model="newPassword"
                class="form-control"
                type="password"
                aria-label="mappingName"
              />
              <div class="form-sublabel space">
                {{ $t("account.new_password_repeat_label") }}
              </div>
              <input
                v-model="newPasswordRepeat"
                class="form-control"
                type="password"
                aria-label="mappingName"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { toaster } = useToaster();

const oldPassword = ref<string>("");
const newPassword = ref<string>("");
const newPasswordRepeat = ref<string>("");

const saveNewPassword = async () => {
  const validate = validateUserForm(newPassword.value, newPasswordRepeat.value);
  if (!validate.validated) {
    toaster.error(validate.error);
    return;
  }
  const { error } = await useNuxtApp().$userUpdate({
    oldPassword,
    password: newPassword,
  });
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }
  toaster.success("You have successfully changed your password");
  newPassword.value = "";
  oldPassword.value = "";
  newPasswordRepeat.value = "";
};
</script>

<style scoped>
.error-paragraph {
  color: #f02849;
  font-size: 14px;
}
</style>
