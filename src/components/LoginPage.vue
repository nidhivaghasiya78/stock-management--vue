<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Login</h2>

            <form @submit.prevent="login">
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
                  class="bi"
                  :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
                  style="position: absolute; top: 75%; right: 1rem; transform: translateY(-50%); cursor: pointer;"
                  @click="toggleShowPassword"
                ></i>
              </div>

              <div class="d-grid">
                <button type="submit" class="btn btn-primary">Login</button>
              </div>
            </form>

            <p class="text-center mt-3">
              <router-link to="/register">Don't have an account? Sign up</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default {
  name: "LoginPage",
  setup() {
    const store = useStore();
    const router = useRouter();
    const form = ref({ email: "", password: "" });
    const showPassword = ref(false);

    const login = async () => {
      try {
        await store.dispatch("login", form.value);
        store.commit("showToast", { message: "Login successful!", type: "success" });
        router.push("/stock-list");
      } catch (err) {
        const msg = err.error || "Login failed. Please check your credentials.";
        store.commit("showToast", { message: msg, type: "error" });
      }
    };

    const toggleShowPassword = () => {
      showPassword.value = !showPassword.value;
    };

    return { form, login, showPassword, toggleShowPassword };
  },
};
</script>

<style>
body {
  font-family: "Inter", sans-serif;
  background-color: #f8f9fa;
}
</style>
