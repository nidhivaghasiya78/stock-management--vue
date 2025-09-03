<template>
    <div class="container py-4">
        <h2 class="mb-4">Manage Branches</h2>

        <form @submit.prevent="saveBranch" class="row g-3 mb-4">
            <div class="col-md-6">
                <input
                    v-model="form.name"
                    type="text"
                    class="form-control"
                    placeholder="Enter branch name"
                    required
                />
            </div>
            <div class="col-md-6 d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                    {{ editing ? "Update Branch" : "Add Branch" }}
                </button>
                <button v-if="editing" type="button" @click="resetForm" class="btn btn-secondary">
                    Cancel
                </button>
            </div>
        </form>

        <table class="table table-bordered">
            <thead class="table-light">
            <tr>
                <th>#</th>
                <th>Branch Name</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(branch, index) in branches" :key="branch.id">
                <td>{{ index + 1 }}</td>
                <td>{{ branch.name }}</td>
                <td>
                    <button @click="editBranch(branch)" class="btn btn-sm btn-warning me-2">
                        Edit
                    </button>
                    <button @click="deleteBranch(branch.id)" class="btn btn-sm btn-danger">
                        Delete
                    </button>
                </td>
            </tr>
            <tr v-if="branches.length === 0">
                <td colspan="3" class="text-center">No branches found</td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "../axios";
import { useStore } from "vuex";

export default {
    name: "BranchManager",
    setup() {
        const store = useStore();
        const branches = ref([]);
        const form = ref({ id: null, name: "" });
        const editing = ref(false);

        const getBranches = async () => {
            try {
                const res = await axios.get("/branch", {
                    headers: { Authorization: `Bearer ${store.state.token}` },
                });
                branches.value = res.data;
            } catch (err) {
                store.commit("showToast", { message: "Failed to fetch branches", type: "error" });
            }
        };

        const saveBranch = async () => {
            try {
                if (editing.value) {
                    await axios.post(
                        "/branch/update",
                        { id: form.value.id, name: form.value.name },
                        { headers: { Authorization: `Bearer ${store.state.token}` } }
                    );
                    store.commit("showToast", { message: "Branch updated successfully!", type: "success" });
                } else {
                    await axios.post(
                        "/branch",
                        { name: form.value.name },
                        { headers: { Authorization: `Bearer ${store.state.token}` } }
                    );
                    store.commit("showToast", { message: "Branch added successfully!", type: "success" });
                }
                await getBranches();
                resetForm();
            } catch (err) {
                store.commit("showToast", { message: "Save failed. Please try again.", type: "error" });
            }
        };

        const editBranch = (branch) => {
            form.value = { ...branch };
            editing.value = true;
        };

        const deleteBranch = async (id) => {
            if (!confirm("Are you sure you want to delete this branch?")) return;
            try {
                await axios.delete(`/branch/${id}`, {
                    headers: { Authorization: `Bearer ${store.state.token}` },
                });
                await getBranches();
                store.commit("showToast", { message: "Branch deleted successfully!", type: "success" });
            } catch (err) {
                store.commit("showToast", { message: "Delete failed. Please try again.", type: "error" });
            }
        };

        const resetForm = () => {
            form.value = { id: null, name: "" };
            editing.value = false;
        };

        onMounted(() => {
            getBranches();
        });

        return {
            branches,
            form,
            editing,
            getBranches,
            saveBranch,
            editBranch,
            deleteBranch,
            resetForm,
        };
    },
};
</script>
