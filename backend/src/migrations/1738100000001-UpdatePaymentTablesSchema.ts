import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdatePaymentTablesSchema1738100000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update action_prices table
    const actionPricesTable = await queryRunner.getTable('action_prices');

    if (actionPricesTable) {
      // Add missing columns if they don't exist
      if (
        !actionPricesTable.findColumnByName('bonus_multiplier')
      ) {
        await queryRunner.addColumn(
          'action_prices',
          new TableColumn({
            name: 'bonus_multiplier',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 1.0,
            isNullable: false,
          })
        );
      }

      if (!actionPricesTable.findColumnByName('description')) {
        await queryRunner.addColumn(
          'action_prices',
          new TableColumn({
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          })
        );
      }

      // Rename columns if needed
      const roleCol = actionPricesTable.findColumnByName('role');
      if (roleCol && roleCol.name === 'role') {
        // Column already named correctly
      }
    }

    // Update payment_records table
    const paymentRecordsTable = await queryRunner.getTable('payment_records');

    if (paymentRecordsTable) {
      if (!paymentRecordsTable.findColumnByName('category')) {
        await queryRunner.addColumn(
          'payment_records',
          new TableColumn({
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: true,
          })
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const actionPricesTable = await queryRunner.getTable('action_prices');
    if (actionPricesTable) {
      if (actionPricesTable.findColumnByName('bonus_multiplier')) {
        await queryRunner.dropColumn('action_prices', 'bonus_multiplier');
      }
      if (actionPricesTable.findColumnByName('description')) {
        await queryRunner.dropColumn('action_prices', 'description');
      }
    }

    const paymentRecordsTable = await queryRunner.getTable('payment_records');
    if (paymentRecordsTable) {
      if (paymentRecordsTable.findColumnByName('category')) {
        await queryRunner.dropColumn('payment_records', 'category');
      }
    }
  }
}
