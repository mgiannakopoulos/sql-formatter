import { expandPhrases } from 'src/expandPhrases';
import Formatter from 'src/formatter/Formatter';
import Tokenizer from 'src/lexer/Tokenizer';
import { functions } from './db2.functions';
import { keywords } from './db2.keywords';

const reservedCommands = expandPhrases([
  // queries
  'WITH',
  'SELECT [ALL | DISTINCT]',
  'FROM',
  'WHERE',
  'GROUP BY',
  'HAVING',
  'ORDER BY [INPUT SEQUENCE]',
  'FETCH FIRST',
  // Data modification
  // - insert:
  'INSERT INTO',
  'VALUES',
  // - update:
  'UPDATE',
  'SET',
  'WHERE CURRENT OF',
  'WITH {RR | RS | CS | UR}',
  // - delete:
  'DELETE FROM',
  // - truncate:
  'TRUNCATE [TABLE]',
  // - merge:
  'MERGE INTO',
  'WHEN [NOT] MATCHED [THEN]',
  'UPDATE SET',
  'INSERT',
  // Data definition
  'CREATE [OR REPLACE] VIEW',
  'CREATE [GLOBAL TEMPORARY] TABLE',
  'DROP TABLE [HIERARCHY]',
  // alter table:
  'ALTER TABLE',
  'ADD [COLUMN]',
  'DROP [COLUMN]',
  'RENAME [COLUMN]',
  'ALTER [COLUMN]',
  'SET DATA TYPE', // for alter column
  'SET NOT NULL', // for alter column
  'DROP {IDENTITY | EXPRESSION | DEFAULT | NOT NULL}', // for alter column

  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=statements-list-supported
  'ALLOCATE CURSOR',
  'ALTER DATABASE',
  'ALTER FUNCTION',
  'ALTER INDEX',
  'ALTER MASK',
  'ALTER PERMISSION',
  'ALTER PROCEDURE',
  'ALTER SEQUENCE',
  'ALTER STOGROUP',
  'ALTER TABLESPACE',
  'ALTER TRIGGER',
  'ALTER TRUSTED CONTEXT',
  'ALTER VIEW',
  'ASSOCIATE LOCATORS',
  'BEGIN DECLARE SECTION',
  'CALL',
  'CLOSE',
  'COMMENT',
  'COMMIT',
  'CONNECT',
  'CREATE ALIAS',
  'CREATE AUXILIARY TABLE',
  'CREATE DATABASE',
  'CREATE FUNCTION',
  'CREATE GLOBAL TEMPORARY TABLE',
  'CREATE INDEX',
  'CREATE LOB TABLESPACE',
  'CREATE MASK',
  'CREATE PERMISSION',
  'CREATE PROCEDURE',
  'CREATE ROLE',
  'CREATE SEQUENCE',
  'CREATE STOGROUP',
  'CREATE SYNONYM',
  'CREATE TABLESPACE',
  'CREATE TRIGGER',
  'CREATE TRUSTED CONTEXT',
  'CREATE TYPE',
  'CREATE VARIABLE',
  'DECLARE CURSOR',
  'DECLARE GLOBAL TEMPORARY TABLE',
  'DECLARE STATEMENT',
  'DECLARE TABLE',
  'DECLARE VARIABLE',
  'DESCRIBE CURSOR',
  'DESCRIBE INPUT',
  'DESCRIBE OUTPUT',
  'DESCRIBE PROCEDURE',
  'DESCRIBE TABLE',
  'DROP',
  'END DECLARE SECTION',
  'EXCHANGE',
  'EXECUTE',
  'EXECUTE IMMEDIATE',
  'EXPLAIN',
  'FETCH',
  'FREE LOCATOR',
  'GET DIAGNOSTICS',
  'GRANT',
  'HOLD LOCATOR',
  'INCLUDE',
  'LABEL',
  'LOCK TABLE',
  'OPEN',
  'PREPARE',
  'REFRESH',
  'RELEASE',
  'RELEASE SAVEPOINT',
  'RENAME',
  'REVOKE',
  'ROLLBACK',
  'SAVEPOINT',
  'SELECT INTO',
  'SET CONNECTION',
  'SET CURRENT ACCELERATOR',
  'SET CURRENT APPLICATION COMPATIBILITY',
  'SET CURRENT APPLICATION ENCODING SCHEME',
  'SET CURRENT DEBUG MODE',
  'SET CURRENT DECFLOAT ROUNDING MODE',
  'SET CURRENT DEGREE',
  'SET CURRENT EXPLAIN MODE',
  'SET CURRENT GET_ACCEL_ARCHIVE',
  'SET CURRENT LOCALE LC_CTYPE',
  'SET CURRENT MAINTAINED TABLE TYPES FOR OPTIMIZATION',
  'SET CURRENT OPTIMIZATION HINT',
  'SET CURRENT PACKAGE PATH',
  'SET CURRENT PACKAGESET',
  'SET CURRENT PRECISION',
  'SET CURRENT QUERY ACCELERATION',
  'SET CURRENT QUERY ACCELERATION WAITFORDATA',
  'SET CURRENT REFRESH AGE',
  'SET CURRENT ROUTINE VERSION',
  'SET CURRENT RULES',
  'SET CURRENT SQLID',
  'SET CURRENT TEMPORAL BUSINESS_TIME',
  'SET CURRENT TEMPORAL SYSTEM_TIME',
  'SET ENCRYPTION PASSWORD',
  'SET PATH',
  'SET SCHEMA',
  'SET SESSION TIME ZONE',
  'SIGNAL',
  'VALUES INTO',
  'WHENEVER',
  // other
  'AFTER',
  'GO',
  'SET CURRENT SCHEMA',
]);

const reservedSetOperations = expandPhrases(['UNION [ALL]', 'EXCEPT [ALL]', 'INTERSECT [ALL]']);

const reservedJoins = expandPhrases([
  'JOIN',
  '{LEFT | RIGHT | FULL} [OUTER] JOIN',
  '{INNER | CROSS} JOIN',
]);

const reservedPhrases = ['ON DELETE', 'ON UPDATE'];

// https://www.ibm.com/support/knowledgecenter/en/ssw_ibm_i_72/db2/rbafzintro.htm
export default class Db2Formatter extends Formatter {
  static operators = ['**', '¬=', '¬>', '¬<', '!>', '!<', '||'];

  tokenizer() {
    return new Tokenizer({
      reservedCommands,
      reservedSetOperations,
      reservedJoins,
      reservedDependentClauses: ['WHEN', 'ELSE', 'ELSEIF'],
      reservedPhrases,
      reservedKeywords: keywords,
      reservedFunctionNames: functions,
      stringTypes: [{ quote: "''", prefixes: ['G', 'N', 'X', 'BX', 'GX', 'UX', 'U&'] }],
      identTypes: [`""`],
      positionalParams: true,
      namedParamTypes: [':'],
      paramChars: { first: '@#$', rest: '@#$' },
      operators: Db2Formatter.operators,
    });
  }
}
