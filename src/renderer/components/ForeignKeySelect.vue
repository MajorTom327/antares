<template>
   <select
      ref="editField"
      class="form-select pl-1 pr-4"
      :class="{'small-select': size === 'small'}"
      @change="onChange"
      @blur="$emit('blur')"
   >
      <option v-if="!isValidDefault" :value="value">
         {{ value }} - {{ $t('message.invalidDefault') }}
      </option>
      <option
         v-for="row in foreignList"
         :key="row.foreignColumn"
         :value="row.foreignColumn"
         :selected="row.foreignColumn === value"
      >
         {{ row.foreignColumn }} {{ 'foreignDescription' in row ? ` - ${row.foreignDescription}` : '' | cutText }}
      </option>
   </select>
</template>

<script>
import Tables from '@/ipc-api/Tables';
import { mapGetters, mapActions } from 'vuex';
import { TEXT, LONG_TEXT } from 'common/fieldTypes';
export default {
   name: 'ForeignKeySelect',
   filters: {
      cutText (val) {
         if (typeof val !== 'string') return val;
         return val.length > 15 ? `${val.substring(0, 15)}...` : val;
      }
   },
   props: {
      value: [String, Number],
      keyUsage: Object,
      size: {
         type: String,
         default: ''
      }
   },
   data () {
      return {
         foreignList: []
      };
   },
   computed: {
      ...mapGetters({
         selectedWorkspace: 'workspaces/getSelected'
      }),
      isValidDefault () {
         return this.foreignList.some(foreign => foreign.foreignColumn.toString() === this.value.toString());
      }
   },
   async created () {
      let firstTextField;
      const params = {
         uid: this.selectedWorkspace,
         schema: this.keyUsage.refSchema,
         table: this.keyUsage.refTable
      };

      try { // Field data
         const { status, response } = await Tables.getTableColumns(params);
         if (status === 'success')
            firstTextField = response.find(field => [...TEXT, ...LONG_TEXT].includes(field.type)).name || false;
         else
            this.addNotification({ status: 'error', message: response });
      }
      catch (err) {
         this.addNotification({ status: 'error', message: err.stack });
      }

      try { // Foregn list
         const { status, response } = await Tables.getForeignList({
            ...params,
            column: this.keyUsage.refField,
            description: firstTextField
         });

         if (status === 'success')
            this.foreignList = response.rows;
         else
            this.addNotification({ status: 'error', message: response });
      }
      catch (err) {
         this.addNotification({ status: 'error', message: err.stack });
      }
   },
   methods: {
      ...mapActions({
         addNotification: 'notifications/addNotification'
      }),
      onChange () {
         this.$emit('update:value', this.$refs.editField.value);
      }
   }
};
</script>
