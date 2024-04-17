import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1713338997594 implements MigrationInterface {
    name = 'Migration1713338997594'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`semester\` (\`id\` int NOT NULL AUTO_INCREMENT, \`semester_name\` enum ('1', '2') NOT NULL, \`school_year\` varchar(30) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`score_type\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(30) NOT NULL, \`factor\` enum ('1', '2', '3') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`score\` (\`id\` int NOT NULL AUTO_INCREMENT, \`score\` decimal(2,2) NOT NULL, \`score_type_id\` int NULL, \`studentScoreId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`account\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(30) NOT NULL, \`password\` varchar(30) NOT NULL, \`role\` enum ('1', '2', '3') NOT NULL, UNIQUE INDEX \`IDX_41dfcb70af895ddf9a53094515\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`student\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`address\` varchar(100) NOT NULL, \`email\` varchar(30) NOT NULL, \`phone\` varchar(30) NOT NULL, \`gender\` enum ('1', '2', '3') NOT NULL, \`date_of_birth\` date NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`accountId\` int NULL, \`classSchoolId\` int NULL, UNIQUE INDEX \`REL_627399e684b01d45317af43123\` (\`accountId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`student_score\` (\`id\` int NOT NULL AUTO_INCREMENT, \`classScoreId\` int NULL, \`studentId\` int NULL, \`semester_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`grade\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` int NOT NULL, UNIQUE INDEX \`IDX_3b476d2f648bed3dfb3087fe81\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`teacher\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`address\` varchar(100) NOT NULL, \`email\` varchar(30) NOT NULL, \`phone\` varchar(30) NOT NULL, \`gender\` enum ('1', '2', '3') NOT NULL, \`date_of_birth\` date NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`accountId\` int NULL, \`classSchoolId\` int NULL, UNIQUE INDEX \`REL_08360a55aad2be9ca95a631c7d\` (\`accountId\`), UNIQUE INDEX \`REL_25699ea06a236284c4630ff9ce\` (\`classSchoolId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`subject\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(30) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`class_score\` (\`id\` int NOT NULL AUTO_INCREMENT, \`classSchoolId\` int NULL, \`subjectId\` int NULL, \`semesterId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`class\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`status\` enum ('1', '2') NOT NULL DEFAULT '1', \`gradeId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`teaching\` (\`id\` int NOT NULL AUTO_INCREMENT, \`teacherId\` int NULL, \`subjectId\` int NULL, \`classSchoolId\` int NULL, \`semesterId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`staff\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`address\` varchar(100) NOT NULL, \`email\` varchar(30) NOT NULL, \`phone\` varchar(30) NOT NULL, \`gender\` enum ('1', '2', '3') NOT NULL, \`date_of_birth\` date NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`accountId\` int NULL, UNIQUE INDEX \`REL_0c22265b9f67020e4618c1bd4c\` (\`accountId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`class_schedule\` (\`id\` int NOT NULL AUTO_INCREMENT, \`class_id\` int NULL, \`semester_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`period_schedule\` (\`id\` int NOT NULL AUTO_INCREMENT, \`period\` enum ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10') NOT NULL, \`classScheduleId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`schedule\` (\`id\` int NOT NULL AUTO_INCREMENT, \`day\` enum ('1', '2', '3', '4', '5', '6') NOT NULL, \`periodScheduleId\` int NULL, \`teacher_id\` int NULL, \`subject_id\` int NULL, \`class_id\` int NULL, \`semester_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`grade_subjects_subject\` (\`gradeId\` int NOT NULL, \`subjectId\` int NOT NULL, INDEX \`IDX_1d1811a4a1c13a80497ba2bb41\` (\`gradeId\`), INDEX \`IDX_5ab19e2d53c5e1b4b8e1ce24fb\` (\`subjectId\`), PRIMARY KEY (\`gradeId\`, \`subjectId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`teacher_subjects_subject\` (\`teacherId\` int NOT NULL, \`subjectId\` int NOT NULL, INDEX \`IDX_f04e3ca58b17deac8a10cee02e\` (\`teacherId\`), INDEX \`IDX_d48634767383998ce761f62f78\` (\`subjectId\`), PRIMARY KEY (\`teacherId\`, \`subjectId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`score\` ADD CONSTRAINT \`FK_dad4462965f231dfcb6985c7e79\` FOREIGN KEY (\`score_type_id\`) REFERENCES \`score_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`score\` ADD CONSTRAINT \`FK_8134d0cc0626096be69117daeec\` FOREIGN KEY (\`studentScoreId\`) REFERENCES \`student_score\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`student\` ADD CONSTRAINT \`FK_627399e684b01d45317af431237\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`student\` ADD CONSTRAINT \`FK_a958908de55f883feb7ef6db1e9\` FOREIGN KEY (\`classSchoolId\`) REFERENCES \`class\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`student_score\` ADD CONSTRAINT \`FK_bc0c7429a6b56e917fe52b9812d\` FOREIGN KEY (\`classScoreId\`) REFERENCES \`class_score\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`student_score\` ADD CONSTRAINT \`FK_b0e478d09e304323a6de1019078\` FOREIGN KEY (\`studentId\`) REFERENCES \`student\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`student_score\` ADD CONSTRAINT \`FK_c3d6c4da5429fd5fa8914f500f1\` FOREIGN KEY (\`semester_id\`) REFERENCES \`semester\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teacher\` ADD CONSTRAINT \`FK_08360a55aad2be9ca95a631c7d1\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teacher\` ADD CONSTRAINT \`FK_25699ea06a236284c4630ff9ced\` FOREIGN KEY (\`classSchoolId\`) REFERENCES \`class\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`class_score\` ADD CONSTRAINT \`FK_b09b3439a7f7989dff768df74aa\` FOREIGN KEY (\`classSchoolId\`) REFERENCES \`class\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`class_score\` ADD CONSTRAINT \`FK_0dfbf0219d0f358eaffcf971f2b\` FOREIGN KEY (\`subjectId\`) REFERENCES \`subject\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`class_score\` ADD CONSTRAINT \`FK_5c1a65c8736305f3031d307eed3\` FOREIGN KEY (\`semesterId\`) REFERENCES \`semester\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`class\` ADD CONSTRAINT \`FK_d47b8ef131ce244d9aea2561cf3\` FOREIGN KEY (\`gradeId\`) REFERENCES \`grade\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teaching\` ADD CONSTRAINT \`FK_518b2e1bc970ec2b22bfa87395a\` FOREIGN KEY (\`teacherId\`) REFERENCES \`teacher\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teaching\` ADD CONSTRAINT \`FK_564ba2780553ddab59f2f45556d\` FOREIGN KEY (\`subjectId\`) REFERENCES \`subject\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teaching\` ADD CONSTRAINT \`FK_22568e43847c5520f78f791b76d\` FOREIGN KEY (\`classSchoolId\`) REFERENCES \`class\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teaching\` ADD CONSTRAINT \`FK_5ad86681a2eaf7881f957cc3e02\` FOREIGN KEY (\`semesterId\`) REFERENCES \`semester\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD CONSTRAINT \`FK_0c22265b9f67020e4618c1bd4c6\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`class_schedule\` ADD CONSTRAINT \`FK_0aa74ee427967d4c82f298511bc\` FOREIGN KEY (\`class_id\`) REFERENCES \`class\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`class_schedule\` ADD CONSTRAINT \`FK_2a8f017b7cf59f247e31df32b42\` FOREIGN KEY (\`semester_id\`) REFERENCES \`semester\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`period_schedule\` ADD CONSTRAINT \`FK_e55c3feb7fd2be069ab3135cd5c\` FOREIGN KEY (\`classScheduleId\`) REFERENCES \`class_schedule\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`schedule\` ADD CONSTRAINT \`FK_3ebd991413d6637a5ec7654ba74\` FOREIGN KEY (\`periodScheduleId\`) REFERENCES \`period_schedule\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`schedule\` ADD CONSTRAINT \`FK_cfacddd81efeda13acadb93d42b\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`teacher\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`schedule\` ADD CONSTRAINT \`FK_0d4aea6fb531a16d5f953f79000\` FOREIGN KEY (\`subject_id\`) REFERENCES \`subject\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`schedule\` ADD CONSTRAINT \`FK_9163c65684f39efd6fce48b857b\` FOREIGN KEY (\`class_id\`) REFERENCES \`class\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`schedule\` ADD CONSTRAINT \`FK_5acfbf79b6c8f92b17fa152667a\` FOREIGN KEY (\`semester_id\`) REFERENCES \`semester\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`grade_subjects_subject\` ADD CONSTRAINT \`FK_1d1811a4a1c13a80497ba2bb41b\` FOREIGN KEY (\`gradeId\`) REFERENCES \`grade\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`grade_subjects_subject\` ADD CONSTRAINT \`FK_5ab19e2d53c5e1b4b8e1ce24fb5\` FOREIGN KEY (\`subjectId\`) REFERENCES \`subject\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teacher_subjects_subject\` ADD CONSTRAINT \`FK_f04e3ca58b17deac8a10cee02e9\` FOREIGN KEY (\`teacherId\`) REFERENCES \`teacher\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`teacher_subjects_subject\` ADD CONSTRAINT \`FK_d48634767383998ce761f62f78a\` FOREIGN KEY (\`subjectId\`) REFERENCES \`subject\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teacher_subjects_subject\` DROP FOREIGN KEY \`FK_d48634767383998ce761f62f78a\``);
        await queryRunner.query(`ALTER TABLE \`teacher_subjects_subject\` DROP FOREIGN KEY \`FK_f04e3ca58b17deac8a10cee02e9\``);
        await queryRunner.query(`ALTER TABLE \`grade_subjects_subject\` DROP FOREIGN KEY \`FK_5ab19e2d53c5e1b4b8e1ce24fb5\``);
        await queryRunner.query(`ALTER TABLE \`grade_subjects_subject\` DROP FOREIGN KEY \`FK_1d1811a4a1c13a80497ba2bb41b\``);
        await queryRunner.query(`ALTER TABLE \`schedule\` DROP FOREIGN KEY \`FK_5acfbf79b6c8f92b17fa152667a\``);
        await queryRunner.query(`ALTER TABLE \`schedule\` DROP FOREIGN KEY \`FK_9163c65684f39efd6fce48b857b\``);
        await queryRunner.query(`ALTER TABLE \`schedule\` DROP FOREIGN KEY \`FK_0d4aea6fb531a16d5f953f79000\``);
        await queryRunner.query(`ALTER TABLE \`schedule\` DROP FOREIGN KEY \`FK_cfacddd81efeda13acadb93d42b\``);
        await queryRunner.query(`ALTER TABLE \`schedule\` DROP FOREIGN KEY \`FK_3ebd991413d6637a5ec7654ba74\``);
        await queryRunner.query(`ALTER TABLE \`period_schedule\` DROP FOREIGN KEY \`FK_e55c3feb7fd2be069ab3135cd5c\``);
        await queryRunner.query(`ALTER TABLE \`class_schedule\` DROP FOREIGN KEY \`FK_2a8f017b7cf59f247e31df32b42\``);
        await queryRunner.query(`ALTER TABLE \`class_schedule\` DROP FOREIGN KEY \`FK_0aa74ee427967d4c82f298511bc\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP FOREIGN KEY \`FK_0c22265b9f67020e4618c1bd4c6\``);
        await queryRunner.query(`ALTER TABLE \`teaching\` DROP FOREIGN KEY \`FK_5ad86681a2eaf7881f957cc3e02\``);
        await queryRunner.query(`ALTER TABLE \`teaching\` DROP FOREIGN KEY \`FK_22568e43847c5520f78f791b76d\``);
        await queryRunner.query(`ALTER TABLE \`teaching\` DROP FOREIGN KEY \`FK_564ba2780553ddab59f2f45556d\``);
        await queryRunner.query(`ALTER TABLE \`teaching\` DROP FOREIGN KEY \`FK_518b2e1bc970ec2b22bfa87395a\``);
        await queryRunner.query(`ALTER TABLE \`class\` DROP FOREIGN KEY \`FK_d47b8ef131ce244d9aea2561cf3\``);
        await queryRunner.query(`ALTER TABLE \`class_score\` DROP FOREIGN KEY \`FK_5c1a65c8736305f3031d307eed3\``);
        await queryRunner.query(`ALTER TABLE \`class_score\` DROP FOREIGN KEY \`FK_0dfbf0219d0f358eaffcf971f2b\``);
        await queryRunner.query(`ALTER TABLE \`class_score\` DROP FOREIGN KEY \`FK_b09b3439a7f7989dff768df74aa\``);
        await queryRunner.query(`ALTER TABLE \`teacher\` DROP FOREIGN KEY \`FK_25699ea06a236284c4630ff9ced\``);
        await queryRunner.query(`ALTER TABLE \`teacher\` DROP FOREIGN KEY \`FK_08360a55aad2be9ca95a631c7d1\``);
        await queryRunner.query(`ALTER TABLE \`student_score\` DROP FOREIGN KEY \`FK_c3d6c4da5429fd5fa8914f500f1\``);
        await queryRunner.query(`ALTER TABLE \`student_score\` DROP FOREIGN KEY \`FK_b0e478d09e304323a6de1019078\``);
        await queryRunner.query(`ALTER TABLE \`student_score\` DROP FOREIGN KEY \`FK_bc0c7429a6b56e917fe52b9812d\``);
        await queryRunner.query(`ALTER TABLE \`student\` DROP FOREIGN KEY \`FK_a958908de55f883feb7ef6db1e9\``);
        await queryRunner.query(`ALTER TABLE \`student\` DROP FOREIGN KEY \`FK_627399e684b01d45317af431237\``);
        await queryRunner.query(`ALTER TABLE \`score\` DROP FOREIGN KEY \`FK_8134d0cc0626096be69117daeec\``);
        await queryRunner.query(`ALTER TABLE \`score\` DROP FOREIGN KEY \`FK_dad4462965f231dfcb6985c7e79\``);
        await queryRunner.query(`DROP INDEX \`IDX_d48634767383998ce761f62f78\` ON \`teacher_subjects_subject\``);
        await queryRunner.query(`DROP INDEX \`IDX_f04e3ca58b17deac8a10cee02e\` ON \`teacher_subjects_subject\``);
        await queryRunner.query(`DROP TABLE \`teacher_subjects_subject\``);
        await queryRunner.query(`DROP INDEX \`IDX_5ab19e2d53c5e1b4b8e1ce24fb\` ON \`grade_subjects_subject\``);
        await queryRunner.query(`DROP INDEX \`IDX_1d1811a4a1c13a80497ba2bb41\` ON \`grade_subjects_subject\``);
        await queryRunner.query(`DROP TABLE \`grade_subjects_subject\``);
        await queryRunner.query(`DROP TABLE \`schedule\``);
        await queryRunner.query(`DROP TABLE \`period_schedule\``);
        await queryRunner.query(`DROP TABLE \`class_schedule\``);
        await queryRunner.query(`DROP INDEX \`REL_0c22265b9f67020e4618c1bd4c\` ON \`staff\``);
        await queryRunner.query(`DROP TABLE \`staff\``);
        await queryRunner.query(`DROP TABLE \`teaching\``);
        await queryRunner.query(`DROP TABLE \`class\``);
        await queryRunner.query(`DROP TABLE \`class_score\``);
        await queryRunner.query(`DROP TABLE \`subject\``);
        await queryRunner.query(`DROP INDEX \`REL_25699ea06a236284c4630ff9ce\` ON \`teacher\``);
        await queryRunner.query(`DROP INDEX \`REL_08360a55aad2be9ca95a631c7d\` ON \`teacher\``);
        await queryRunner.query(`DROP TABLE \`teacher\``);
        await queryRunner.query(`DROP INDEX \`IDX_3b476d2f648bed3dfb3087fe81\` ON \`grade\``);
        await queryRunner.query(`DROP TABLE \`grade\``);
        await queryRunner.query(`DROP TABLE \`student_score\``);
        await queryRunner.query(`DROP INDEX \`REL_627399e684b01d45317af43123\` ON \`student\``);
        await queryRunner.query(`DROP TABLE \`student\``);
        await queryRunner.query(`DROP INDEX \`IDX_41dfcb70af895ddf9a53094515\` ON \`account\``);
        await queryRunner.query(`DROP TABLE \`account\``);
        await queryRunner.query(`DROP TABLE \`score\``);
        await queryRunner.query(`DROP TABLE \`score_type\``);
        await queryRunner.query(`DROP TABLE \`semester\``);
    }

}
