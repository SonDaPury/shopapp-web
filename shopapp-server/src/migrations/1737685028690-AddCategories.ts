import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategories1737685028690 implements MigrationInterface {
    name = 'AddCategories1737685028690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`parentId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`category\` ADD CONSTRAINT \`FK_d5456fd7e4c4866fec8ada1fa10\` FOREIGN KEY (\`parentId\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`category\` DROP FOREIGN KEY \`FK_d5456fd7e4c4866fec8ada1fa10\``);
        await queryRunner.query(`DROP TABLE \`category\``);
    }

}
