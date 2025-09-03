<template>
    <div className="container py-4">
        <h1 className="mb-4">Stock Entries</h1>

        <div className="mb-3 d-flex justify-content-end">
            <div className="input-group" style="max-width: 300px;">
                <input
                    v-model="search"
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                />
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
            </div>
        </div>

        <div ref="tableRef" style="height: 443px;"></div>
    </div>
</template>

<script>
import {ref, onMounted, watch} from "vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {TabulatorFull as Tabulator} from "tabulator-tables";
import axios from "../axios";
import "tabulator-tables/dist/css/tabulator.min.css";

export default {
    name: "StockList",
    setup() {
        const store         = useStore();
        const router        = useRouter();
        const search        = ref("");
        const tableRef      = ref(null);
        let table           = null;
        let debounceTimeout = null;

        const initTable = () => {
            table = new Tabulator(tableRef.value, {
                layout: "fitColumns",
                placeholder: "No Data Available",
                pagination: "remote",
                paginationSize: 10,
                ajaxURL: "http://localhost:8000/api/stock-entries",
                ajaxContentType: "json",

                ajaxRequestFunc: async(url, config, params) => {
                    try{
                        const res = await axios.get(url, {
                            headers: {Authorization: `Bearer ${store.state.token}`},
                            params: {
                                page: params.page || 1,
                                per_page: params.size || 10,
                                search: search.value || "",
                            },
                        });
                        return res.data;
                    } catch(err){
                        store.commit("showToast", { message: "Failed to fetch stock entries.", type: "error" });
                        return {data: [], last_page: 1, total: 0};
                    }
                },

                ajaxResponse: (url, params, response) => {
                    if(!response || !response.data){
                        console.error("Invalid API data", response);
                        return [];
                    }
                    return response.data;
                },

                paginationDataReceived: {
                    last_page: "last_page",
                    total_records: "total",
                },

                columns: [
                    {title: "Stock No", field: "stock_no"},
                    {title: "Item Code", field: "item_code"},
                    {title: "Item Name", field: "item_name"},
                    {title: "Quantity", field: "quantity"},
                    {title: "Location", field: "location"},
                    {
                        title: "Store",
                        field: "store",
                        sorter: (a, b) => {
                            const nameA = a?.name?.toLowerCase() || "";
                            const nameB = b?.name?.toLowerCase() || "";
                            return nameA.localeCompare(nameB);
                        },
                        formatter: (cell) => cell.getValue()?.name || "",
                    },
                    {title: "In-Stock Date", field: "in_stock_date"},
                    {title: "Status", field: "status"},
                    {
                        title: "Actions",
                        sorter: false,
                        formatter: (cell) => {
                            const btn     = document.createElement("button");
                            btn.innerText = "Delete";
                            btn.className = "btn btn-sm btn-danger";
                            btn.onclick   = () => confirmDelete(cell.getRow().getData().id);
                            return btn;
                        },
                    },
                ],
            });
        };

        const confirmDelete = async(id) => {
            if(!confirm("Are you sure you want to delete this stock entry?")) return;
            try{
                await axios.delete(`http://localhost:8000/api/stock-entries/${id}`, {
                    headers: {Authorization: `Bearer ${store.state.token}`},
                });
                if(table) table.setData();
                store.commit("showToast", { message: "Stock entry deleted successfully!", type: "success" });
            } catch(err){
                store.commit("showToast", { message: "Failed to delete stock entry.", type: "error" });
                console.error("Delete failed:", err);
            }
        };

        const logout = async() => {
            try{
                await store.dispatch("logout");
                router.push("/login");
                store.commit("showToast", { message: "Logged out successfully.", type: "success" });
            } catch(err){
                store.commit("showToast", { message: "Logout failed.", type: "error" });
                console.error("Logout failed:", err);
            }
        };

        watch(search, (newVal) => {
            if(debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                if(table){
                    table.setData("http://localhost:8000/api/stock-entries", {
                        page: 1,
                        per_page: 10,
                        search: newVal,
                    });
                }
            }, 400);
        });

        onMounted(() => {
            initTable();
        });

        const goBulkStock = () => {
            router.push("/bulk-stock");
        };

        return {logout, goBulkStock, search, tableRef};
    },
};
</script>
