<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Register</h2>

            <form @submit.prevent="register">
              <div class="mb-3">
                <label for="name" class="form-label">Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  id="name"
                  class="form-control"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  id="email"
                  class="form-control"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div class="mb-3 position-relative">
                <label for="password" class="form-label">Password</label>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  id="password"
                  class="form-control"
                  placeholder="Enter your password"
                  required
                />
                <i
                  class="bi toggle-icon"
                  :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
                  @click="toggleShowPassword"
                ></i>
              </div>

              <div class="mb-3 position-relative">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="form.confirmPassword"
                  id="confirmPassword"
                  class="form-control"
                  placeholder="Confirm your password"
                  required
                />
                <i
                  class="bi toggle-icon"
                  :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"
                  @click="toggleShowConfirmPassword"
                ></i>
              </div>

              <div class="d-grid">
                <button type="submit" class="btn btn-primary">Register</button>
              </div>
            </form>

            <p class="text-center mt-3">
              Already have an account? <router-link to="/login">Login</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "../axios";
import { useStore } from "vuex";

export default {
  name: "RegisterPage",
  setup() {
    const router = useRouter();
    const store = useStore();
    const form = ref({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    const showPassword = ref(false);
    const showConfirmPassword = ref(false);

    const toggleShowPassword = () => (showPassword.value = !showPassword.value);
    const toggleShowConfirmPassword = () =>
      (showConfirmPassword.value = !showConfirmPassword.value);

    const register = async () => {
      if (form.value.password !== form.value.confirmPassword) {
        store.commit("showToast", {
          message: "Passwords do not match.",
          type: "error",
        });
        return;
      }

      try {
        await axios.post("/register", {
          name: form.value.name,
          email: form.value.email,
          password: form.value.password,
        });

        store.commit("showToast", {
          message: "Registration successful! Please log in.",
          type: "success",
        });
        router.push("/login");
      } catch (err) {
        const msg =
          err.response?.data?.error || "Registration failed. Please try again.";
        store.commit("showToast", { message: msg, type: "error" });
      }
    };

    return {
      form,
      register,
      showPassword,
      showConfirmPassword,
      toggleShowPassword,
      toggleShowConfirmPassword,
    };
  },
};
</script>

<style>
body {
  font-family: "Inter", sans-serif;
  background-color: #f8f9fa;
}

.toggle-icon {
  position: absolute;
  top: 75%;
  right: 1rem;
  transform: translateY(-50%);
  cursor: pointer;
}
</style>
