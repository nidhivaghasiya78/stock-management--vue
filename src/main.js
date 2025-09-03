import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// MDB Vue styles
import 'mdb-vue-ui-kit/css/mdb.min.css';
import 'tabulator-tables/dist/css/tabulator.min.css';

const app = createApp(App);
app.use(store);
app.use(router);
app.mount('#app');
