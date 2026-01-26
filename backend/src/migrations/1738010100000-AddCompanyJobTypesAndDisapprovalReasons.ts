import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddCompanyJobTypesAndDisapprovalReasons1738010100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create company_types table
    await queryRunner.createTable(
      new Table({
        name: 'company_types',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create job_types table
    await queryRunner.createTable(
      new Table({
        name: 'job_types',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create disapproval_reasons table
    await queryRunner.createTable(
      new Table({
        name: 'disapproval_reasons',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'reason',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'applicableTo',
            type: 'varchar',
            default: "'both'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Insert some default company types
    await queryRunner.query(`
      INSERT INTO company_types (name, description) VALUES
      ('Solar Lighting EPC', 'Solar and lighting engineering, procurement and construction'),
      ('SaaS', 'Software as a Service companies'),
      ('Manufacturing', 'Manufacturing and production companies'),
      ('Consulting', 'Consulting and professional services'),
      ('Individual / Freelancer', 'Individual contractors and freelancers')
    `);

    // Insert some default job types
    await queryRunner.query(`
      INSERT INTO job_types (name, description) VALUES
      ('CEO', 'Chief Executive Officer'),
      ('Project Manager', 'Project management roles'),
      ('Engineering Manager', 'Engineering and technical management'),
      ('Operations Manager', 'Operations and logistics management'),
      ('Sales Manager', 'Sales and business development')
    `);

    // Insert some default disapproval reasons
    await queryRunner.query(`
      INSERT INTO disapproval_reasons (reason, description, "applicableTo") VALUES
      ('Incomplete Information', 'Missing required data or information', 'both'),
      ('Invalid URL', 'URL is not accessible or incorrect', 'research'),
      ('Poor Screenshot Quality', 'Screenshot is unclear or not showing required information', 'inquiry'),
      ('Suspicious Activity', 'Potential fraudulent or suspicious behavior', 'both')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('disapproval_reasons');
    await queryRunner.dropTable('job_types');
    await queryRunner.dropTable('company_types');
  }
}
