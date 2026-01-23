import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddLinkedinFieldsToResearchSubmissions1737805000002 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
