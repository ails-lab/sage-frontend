<template>
  <div class="sidebar-menu single">
    <!-- second-->
    <div class="col nav-second">
      <div class="content">
        <!-- wrap-->
        <div class="wrap">
          <!-- subsite-->
          <h1 class="subsite">SAGE {{ props.instanceName }}</h1>
          <!-- menu -->
          <div class="account-sidebar">
            <span class="welcome">
              {{ $t("sidebar_menu_account.welcome") }},
            </span>
            <div class="name">{{ props.user.name }}</div>
          </div>
          <!-- deac-->
          <div class="account-menu">
            <ul>
              <!-- menu-->
              <li :class="{ selected: route.path == '/account' }">
                <NuxtLink to="account">
                  {{ $t("sidebar_menu_account.my_profile") }}
                </NuxtLink>
              </li>
              <li :class="{ selected: route.path == '/account-password' }">
                <NuxtLink to="account-password">
                  {{ $t("sidebar_menu_account.password") }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink @click="emit('logout')">
                  {{ $t("sidebar_menu_account.sign_out") }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const emit = defineEmits(["logout"]);
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  instanceName: {
    type: String,
    required: true,
  },
});
const route = useRoute();
</script>

<style lang="scss">
a {
  cursor: pointer;
}
</style>
