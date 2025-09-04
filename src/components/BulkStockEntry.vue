<template>
    <div class="container py-4">
        <h1 class="mb-4">Bulk Stock Entry</h1>

        <div class="d-flex gap-2 mb-4">
            <button
                @click="addRow"
                class="btn btn-success"
                :disabled="!initialized"
            >
                Add New Record
            </button>
            <button
                @click="saveEntries"
                class="btn btn-primary"
                :disabled="!initialized"
            >
                Save
            </button>
        </div>

        <ag-grid-vue
            style="height: 500px; width: 100%;"
            theme="legacy"
            class="ag-theme-alpine"
            :columnDefs="columnDefs"
            :rowData="rowData"
            :defaultColDef="defaultColDef"
            @grid-ready="onGridReady"
            @cell-value-changed="onCellValueChanged"
        ></ag-grid-vue>
    </div>
</template>

<script>
import {ref, onMounted} from "vue";
import {useStore} from "vuex";
import {AgGridVue} from "ag-grid-vue3";
import axios from "../axios";
import moment from "moment";

export default {
    name: "BulkStockEntry",
    components: {AgGridVue},
    setup() {
        const store       = useStore();
        const gridApi     = ref(null);
        const rowData     = ref([]);
        const stores      = ref([]);
        const nextStockNo = ref(null);
        const initialized = ref(false);

        const columnDefs = [
            {headerName: "Stock No", field: "stock_no", editable: false},
            {headerName: "Item Code", field: "item_code", editable: true},
            {headerName: "Item Name", field: "item_name", editable: true},
            {headerName: "Quantity", field: "quantity", editable: true},
            {headerName: "Location", field: "location", editable: true},
            {
                headerName: "Store Name",
                field: "store_id",
                editable: true,
                cellEditor: "agSelectCellEditor",
                cellEditorParams: () => {
                    return {values: stores.value.map((s) => String(s.id))};
                },
                valueFormatter: (params) => {
                    const storeItem = stores.value.find(
                        (s) => String(s.id) === String(params.value)
                    );
                    return storeItem ? storeItem.name : "(Invalid Store)";
                },
                valueParser: (params) => {
                    const storeId   = String(params.newValue);
                    const storeItem = stores.value.find((s) => String(s.id) === storeId);
                    return storeItem ? storeId : params.oldValue || null;
                },
            },
            {
                headerName: "In-Stock Date",
                field: "in_stock_date",
                editable: true,
                cellEditor: "agTextCellEditor",
                valueFormatter: (params) =>
                    params.value ? moment(params.value).format("YYYY-MM-DD") : "",
            },
        ];

        const defaultColDef = {
            flex: 1,
            minWidth: 100,
        };

        const onGridReady = (params) => {
            gridApi.value = params.api;
        };

        const onCellValueChanged = (params) => {
            gridApi.value.refreshCells({rowNodes: [params.node], force: true});
        };

        const addRow = () => {
            if(!initialized.value){
                alert("Please wait, data is still loading...");
                return;
            }

            if(!stores.value.length){
                store.commit("showToast", {
                    message: "Cannot add row: No stores available.",
                    type: "error",
                });
                return;
            }

            const newRow = {
                stock_no: nextStockNo.value++,
                item_code: "",
                item_name: "",
                quantity: 0,
                location: "",
                store_id: String(stores.value[0].id),
                in_stock_date: moment().format("YYYY-MM-DD"),
            };

            rowData.value = [...rowData.value, newRow];

            if(gridApi.value){
                gridApi.value.refreshCells({force: true});
            }
        };

        const saveEntries = async() => {
            const cleanedRows = rowData.value.map((r) => ({...r}));

            const invalidRow = cleanedRows.find((r) => {
                const isInvalid = {
                    item_code: !r.item_code || !String(r.item_code).trim(),
                    item_name: !r.item_name || !String(r.item_name).trim(),
                    quantity: r.quantity === null || r.quantity < 0,
                    store_id: !r.store_id,
                    location: !r.location,
                };
                return Object.values(isInvalid).some((v) => v);
            });

            if(invalidRow){
                store.commit("showToast", {
                    message: "Please fill all required fields!",
                    type: "error",
                });
                return;
            }

            try{
                await axios.post(
                    "http://localhost:8000/api/stock-entries/store",
                    {stocks: cleanedRows},
                    {headers: {Authorization: `Bearer ${store.state.token}`}}
                );

                rowData.value = [];

                store.commit("showToast", {
                    message: "Stock entries saved successfully!",
                    type: "success",
                });
            } catch(error){
                store.commit("showToast", {
                    message: "Failed to save stock entries.",
                    type: "error",
                });
            }
        };

        onMounted(async() => {
            try{
                const res    = await axios.get("http://localhost:8000/api/branch", {
                    headers: {Authorization: `Bearer ${store.state.token}`},
                });
                stores.value = Array.isArray(res.data)
                               ? res.data
                               : res.data.data || [];

                if(!stores.value.length){
                    store.commit("showToast", {
                        message: "No stores available. Please check the branch API.",
                        type: "warning",
                    });
                }

                const lastRes = await axios.get(
                    "http://localhost:8000/api/stock-entries/last-id",
                    {headers: {Authorization: `Bearer ${store.state.token}`}}
                );

                nextStockNo.value = lastRes.data.last_stock_id
                                    ? parseInt(lastRes.data.last_stock_id)
                                    : 1001;
                initialized.value = true;

                if(gridApi.value){
                    gridApi.value.refreshCells({force: true});
                }
            } catch(error){
                store.commit("showToast", {
                    message: "Failed to initialize page.",
                    type: "error",
                });
            }
        });

        return {
            columnDefs,
            rowData,
            defaultColDef,
            onGridReady,
            onCellValueChanged,
            addRow,
            saveEntries,
            initialized,
        };
    },
};
</script>
