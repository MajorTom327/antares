
import { ipcMain } from 'electron';

export default connections => {
   ipcMain.handle('create-database', async (event, params) => {
      try {
         const query = `CREATE DATABASE \`${params.name}\` COLLATE ${params.collation}`;
         await connections[params.uid].raw(query);

         return { status: 'success' };
      }
      catch (err) {
         return { status: 'error', response: err.toString() };
      }
   });

   ipcMain.handle('update-database', async (event, params) => {
      try {
         const query = `ALTER DATABASE \`${params.name}\` COLLATE ${params.collation}`;
         await connections[params.uid].raw(query);

         return { status: 'success' };
      }
      catch (err) {
         return { status: 'error', response: err.toString() };
      }
   });

   ipcMain.handle('delete-database', async (event, params) => {
      try {
         const query = `DROP DATABASE \`${params.database}\``;
         await connections[params.uid].raw(query);

         return { status: 'success' };
      }
      catch (err) {
         return { status: 'error', response: err.toString() };
      }
   });

   ipcMain.handle('get-database-collation', async (event, params) => { // TODO: move to mysql class
      try {
         const query = `SELECT \`DEFAULT_COLLATION_NAME\` FROM \`information_schema\`.\`SCHEMATA\` WHERE \`SCHEMA_NAME\`='${params.database}'`;
         const collation = await connections[params.uid].raw(query);

         return { status: 'success', response: collation.rows.length ? collation.rows[0].DEFAULT_COLLATION_NAME : '' };
      }
      catch (err) {
         return { status: 'error', response: err.toString() };
      }
   });

   ipcMain.handle('get-structure', async (event, params) => {
      try {
         const structure = await connections[params.uid].getStructure(params.schemas);

         return { status: 'success', response: structure };
      }
      catch (err) {
         return { status: 'error', response: err.toString() };
      }
   });

   ipcMain.handle('get-collations', async (event, uid) => {
      try {
         const result = await connections[uid].getCollations();

         return { status: 'success', response: result };
      }
      catch (err) {
         return { status: 'error', response: err.toString() };
      }
   });

   ipcMain.handle('get-variables', async (event, uid) => {
      try {
         const result = await connections[uid].getVariables();

         return { status: 'success', response: result };
      }
      catch (err) {
         return { status: 'error', response: err.toString() };
      }
   });

   ipcMain.handle('get-engines', async (event, uid) => {
      try {
         const result = await connections[uid].getEngines();

         return { status: 'success', response: result };
      }
      catch (err) {
         return { status: 'error', response: err.toString() };
      }
   });

   ipcMain.handle('get-version', async (event, uid) => {
      try {
         const result = await connections[uid].getVersion();

         return { status: 'success', response: result };
      }
      catch (err) {
         return { status: 'error', response: err.toString() };
      }
   });

   ipcMain.handle('use-schema', async (event, { uid, schema }) => {
      if (!schema) return;

      try {
         await connections[uid].use(schema);
         return { status: 'success' };
      }
      catch (err) {
         return { status: 'error', response: err.toString() };
      }
   });

   ipcMain.handle('raw-query', async (event, { uid, query, schema }) => {
      if (!query) return;

      try {
         const result = await connections[uid].raw(query, { nest: true, details: true });

         return { status: 'success', response: result };
      }
      catch (err) {
         return { status: 'error', response: err.toString() };
      }
   });
};
