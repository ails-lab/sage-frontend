<template>
  <div class="user dropdown">
    <a
      v-if="props.user.id"
      id="dropdown-user"
      ref="dropdownUser"
      href="#"
      role="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      data-bs-auto-close="outside"
      @click="toggleUserDropdown(dropdownUser.getAttribute('aria-expanded'))"
    >
      <i class="fa-solid thumb fa-chevron-down"></i>
      <div class="info">
        <span class="username">{{ props.user.name }}</span>
        <span class="role">{{ props.user.role }}</span>
      </div>
    </a>
    <ul
      ref="dropdownUserMenu"
      class="dropdown-menu"
      aria-labelledby="dropdown-user"
    >
      <li>
        <NuxtLink class="dropdown-item" @click="goToAccountClicked">
          <img src="@images/ic-menu-user.svg" />
          <span class="dropdown-text">
            {{ $t("navbar_user.account_settings") }}
          </span>
        </NuxtLink>
      </li>
      <li v-if="props.user.roles && props.user.roles.length > 1">
        <a
          class="dropdown-item"
          data-bs-toggle="collapse"
          href="#role-selector"
          role="button"
          @click="toggleSwitchRoleCollapse($event)"
        >
          <img src="@images/ic-menu-role.svg" />
          <span class="dropdown-text">
            {{ $t("navbar_user.switch_role") }}
          </span>
        </a>
        <div id="role-selector" class="selector collapse">
          <select
            v-model="selectedRole"
            class="form-select"
            @change="selectRole($event)"
          >
            <option v-for="role of props.user.roles" :key="role" :value="role">
              {{ role }}
            </option>
          </select>
        </div>
      </li>
      <li v-if="switchingRoles">
        <hr class="dropdown-divider" />
      </li>
      <li v-if="switchingRoles" class="password-field">
        <input type="text" class="hidden-input" />
        <input
          v-model="password"
          :placeholder="$t('navbar_user.enter_password')"
          class="form-control"
          type="password"
          aria-label="mappingName"
          @keydown.enter="switchRole()"
        />
        <i
          class="btn-submit fa-solid fa-circle-chevron-right"
          @click="switchRole()"
        >
        </i>
      </li>
      <li>
        <hr class="dropdown-divider" />
      </li>
      <li>
        <NuxtLink class="dropdown-item" @click="emit('logout')">
          <img src="@images/ic-menu-logout.svg" />
          <span class="dropdown-text">
            {{ $t("navbar_user.sign_out") }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["goToAccountClicked", "switchRole", "logout"]);
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});
const dropdownUser = ref(null);
const dropdownUserMenu = ref(null);
const selectedRole = ref<String>("");
const switchingRoles = ref<Boolean>(false);
const password = ref<String>("");

watchEffect(() => {
  // Update selectedRole when finished fetching currentUser in default layout
  if (props.user) {
    selectedRole.value = props.user.role;
  }
});

const toggleUserDropdown = (dropdownExpanded: Boolean) => {
  if (dropdownExpanded) {
    selectedRole.value = props.user.role;
    switchingRoles.value = false;
  }
};

const toggleSwitchRoleCollapse = (event) => {
  if (!event.target.getAttribute("aria-expanded")) {
    selectedRole.value = props.user.role;
    switchingRoles.value = false;
  }
};

const goToAccountClicked = () => {
  dropdownUser.value.className = "";
  dropdownUser.value.ariaExpanded = "false";
  dropdownUserMenu.value.className = "dropdown-menu";
  dropdownUserMenu.value.style = "";
  emit("goToAccountClicked");
};

const selectRole = (event) => {
  // Display the password-input-field only when selected role is different from the current role
  switchingRoles.value = event.target.value !== props.user.role;
};

const switchRole = () => {
  emit("switchRole", {
    email: props.user.email,
    pass: password.value,
    role: selectedRole.value,
  });
};
</script>

<style lang="scss" scoped>
#dropdown-user[aria-expanded="true"] {
  i {
    transform: rotate(180deg);
    transition: transform 250ms linear;
  }
}
#dropdown-user[aria-expanded="false"] {
  i {
    transform: rotate(0deg);
    transition: transform 250ms linear;
  }
}
a.dropdown-item:active,
a.dropdown-item:focus {
  background-color: unset;
}
a.dropdown-item:hover {
  background-color: #0e4481;
}
.hidden-input {
  position: absolute;
  height: 0;
  padding: 0;
  border: 0;
}
.password-field {
  padding: 15px;
  opacity: 0.8;
  input {
    font-size: 13px;
    line-height: 13px;
    padding-right: 32px;
  }
}
.btn-submit {
  float: right;
  color: #ff9900;
  font-size: 17px;
  margin-right: 8px;
  margin-top: -26px;
  position: relative;
  cursor: pointer;
}
</style>
