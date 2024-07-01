<template>
  <!--  Page -->
  <main role="main">
    <!-- container-->
    <div class="container-fluid">
      <!-- info-->
      <div class="login-info">
        {{ $t("account.footer_disclaimer") }}
        <a
          href="https://datoptron.com/"
          target="_blank"
          class="text-decoration-underline"
        >
          Datoptron &copy; {{ new Date().getFullYear() }}
        </a>
      </div>
      <!-- wrap-->
      <div class="login-register">
        <div class="wrap">
          <!-- form-->
          <div class="row">
            <div class="col-2 logo">
              <img src="@images/ic-logo-blue.png" alt="sage_logo" />
            </div>
            <div class="col-10">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <SimpleToast />
</template>

<script setup lang="ts">
const route = useRoute();
const error = useError();

const pageTitle = computed(() => {
  if (error.value) {
    return "Error | SAGE";
  }
  const pathNodes = route.path.split("/").slice(1);
  const title =
    pathNodes[0] === "data" || pathNodes[0] === "scheme"
      ? camelcaseString(pathNodes[1], "-")
      : camelcaseString(pathNodes[0], "-");
  return title.length ? `${title} | SAGE` : "SAGE";
});

useHead({
  title: pageTitle,
});
</script>

<style lang="scss">
@use "~/assets/styles/main.scss";
</style>
