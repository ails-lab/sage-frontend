<template>
  <div class="wrap">
    <!-- profile-->
    <div class="account-profile">
      <!-- header-->
      <div class="account-profile-header">
        <div class="account-profile-info">
          <h4 class="account-profile-title">
            {{ $t("sidebar_menu_account.my_profile") }}
          </h4>
          <p class="account-profile-description">
            {{ $t("sidebar_menu_account.basic_info") }}
          </p>
        </div>
        <!-- button action-->
        <ul class="account-profile-action">
          <li class="main">
            <NuxtLink @click="saveAccountDetails">{{ $t("save") }}</NuxtLink>
          </li>
        </ul>
      </div>
      <!-- header-->
      <div class="account-profile-body">
        <!-- form-->
        <div class="sage-form">
          <!-- field name-->
          <div class="field row">
            <div class="col-12">
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
          </div>
          <!-- field name-->
          <div class="field row">
            <div class="col-12">
              <div class="form-sublabel space">
                {{ $t("account.email_label") }}
              </div>
              <input
                v-model="email"
                class="form-control"
                type="text"
                aria-label="mappingName"
              />
            </div>
          </div>
          <!-- field name-->
          <div class="field row">
            <div class="col-12">
              <div class="form-sublabel space">
                {{ $t("account.assigned_roles") }}
              </div>
              <ul class="roles">
                <li
                  v-for="role of currentUser.roles"
                  :key="role"
                  :class="role != 'ADMINISTRATOR' ? 'purple' : ''"
                >
                  {{ role }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { toaster } = useToaster();

const { fetchCurrentUser } = useAuthStore(); // use authenticateUser action from  auth store
const { currentUser } = storeToRefs(useAuthStore());
const fullName = ref<string>("");
const email = ref<string>("");

onMounted(async () => {
  if (!currentUser.value.id) {
    // fetch user just in case that we do not already have fetched
    await nextTick();
    await fetchCurrentUser();
  }
  fullName.value = currentUser.value.name;
  email.value = currentUser.value.email;
});

const saveAccountDetails = async () => {
  if (
    currentUser.value.name === fullName.value &&
    currentUser.value.email === email.value
  ) {
    return;
  }
  const { error } = await useNuxtApp().$userUpdate({
    name: fullName.value,
    email: email.value,
  });
  if (error.value) {
    toaster.error(error.value.data.message);
    return;
  }
  toaster.success("You have successfully changed your account details.");
  await fetchCurrentUser();
  fullName.value = currentUser.value.name;
  email.value = currentUser.value.email;
};
</script>

<style scoped></style>
