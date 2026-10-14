import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1716080000000 implements MigrationInterface {
  name = 'InitialSchema1716080000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS players (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        UNIQUE INDEX UQ_players_name (name),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS decks (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        commander VARCHAR(255) NOT NULL,
        playerId INT NOT NULL,
        INDEX IDX_decks_player (playerId),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id INT NOT NULL AUTO_INCREMENT,
        winningTurn INT NOT NULL,
        winnerId INT NOT NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX IDX_matches_winner (winnerId),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS match_participants (
        id INT NOT NULL AUTO_INCREMENT,
        seatOrder INT NOT NULL,
        matchId INT NOT NULL,
        playerId INT NOT NULL,
        deckId INT NOT NULL,
        UNIQUE INDEX UQ_match_player (matchId, playerId),
        INDEX IDX_match_participants_match (matchId),
        INDEX IDX_match_participants_player (playerId),
        INDEX IDX_match_participants_deck (deckId),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      ALTER TABLE decks
      ADD CONSTRAINT FK_decks_player
      FOREIGN KEY (playerId)
      REFERENCES players(id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE matches
      ADD CONSTRAINT FK_matches_winner
      FOREIGN KEY (winnerId)
      REFERENCES players(id)
      ON DELETE RESTRICT
      ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE match_participants
      ADD CONSTRAINT FK_match_participants_match
      FOREIGN KEY (matchId)
      REFERENCES matches(id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE match_participants
      ADD CONSTRAINT FK_match_participants_player
      FOREIGN KEY (playerId)
      REFERENCES players(id)
      ON DELETE RESTRICT
      ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE match_participants
      ADD CONSTRAINT FK_match_participants_deck
      FOREIGN KEY (deckId)
      REFERENCES decks(id)
      ON DELETE RESTRICT
      ON UPDATE NO ACTION;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE match_participants DROP FOREIGN KEY FK_match_participants_deck;');
    await queryRunner.query('ALTER TABLE match_participants DROP FOREIGN KEY FK_match_participants_player;');
    await queryRunner.query('ALTER TABLE match_participants DROP FOREIGN KEY FK_match_participants_match;');
    await queryRunner.query('ALTER TABLE matches DROP FOREIGN KEY FK_matches_winner;');
    await queryRunner.query('ALTER TABLE decks DROP FOREIGN KEY FK_decks_player;');

    await queryRunner.query('DROP TABLE IF EXISTS match_participants;');
    await queryRunner.query('DROP TABLE IF EXISTS matches;');
    await queryRunner.query('DROP TABLE IF EXISTS decks;');
    await queryRunner.query('DROP TABLE IF EXISTS players;');
  }
}
