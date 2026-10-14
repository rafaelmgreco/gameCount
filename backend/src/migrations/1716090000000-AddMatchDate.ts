import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMatchDate1716090000000 implements MigrationInterface {
  name = 'AddMatchDate1716090000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE matches
      ADD COLUMN matchDate DATE NOT NULL DEFAULT (CURRENT_DATE);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE matches
      DROP COLUMN matchDate;
    `);
  }
}
