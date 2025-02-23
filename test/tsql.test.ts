import dedent from 'dedent-js';

import { format as originalFormat, FormatFn } from 'src/sqlFormatter';
import TSqlFormatter from 'src/languages/tsql/tsql.formatter';
import behavesLikeSqlFormatter from './behavesLikeSqlFormatter';

import supportsCreateTable from './features/createTable';
import supportsDropTable from './features/dropTable';
import supportsAlterTable from './features/alterTable';
import supportsStrings from './features/strings';
import supportsBetween from './features/between';
import supportsOperators from './features/operators';
import supportsJoin from './features/join';
import supportsConstraints from './features/constraints';
import supportsDeleteFrom from './features/deleteFrom';
import supportsComments from './features/comments';
import supportsIdentifiers from './features/identifiers';
import supportsParams from './options/param';
import supportsWindow from './features/window';
import supportsSetOperations from './features/setOperations';
import supportsLimiting from './features/limiting';
import supportsInsertInto from './features/insertInto';
import supportsUpdate from './features/update';
import supportsTruncateTable from './features/truncateTable';
import supportsMergeInto from './features/mergeInto';
import supportsCreateView from './features/createView';

describe('TSqlFormatter', () => {
  const language = 'tsql';
  const format: FormatFn = (query, cfg = {}) => originalFormat(query, { ...cfg, language });

  behavesLikeSqlFormatter(format);
  supportsComments(format);
  supportsCreateView(format, { materialized: true });
  supportsCreateTable(format);
  supportsDropTable(format, { ifExists: true });
  supportsConstraints(format);
  supportsAlterTable(format, {
    dropColumn: true,
  });
  supportsDeleteFrom(format);
  supportsInsertInto(format, { withoutInto: true });
  supportsUpdate(format, { whereCurrentOf: true });
  supportsTruncateTable(format);
  supportsMergeInto(format);
  supportsStrings(format, ["N''", "''"]);
  supportsIdentifiers(format, [`""`, '[]']);
  supportsBetween(format);
  supportsOperators(
    format,
    TSqlFormatter.operators.filter(op => op !== '::')
  );
  supportsJoin(format, { without: ['NATURAL'], supportsUsing: false, supportsApply: true });
  supportsSetOperations(format, ['UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT']);
  supportsParams(format, { named: ['@'], quoted: ['@""', '@[]'] });
  supportsWindow(format);
  supportsLimiting(format, { offset: true, fetchFirst: true, fetchNext: true });

  // TODO: The following are duplicated from StandardSQLFormatter test

  it('formats INSERT without INTO', () => {
    const result = format(
      "INSERT Customers (ID, MoneyBalance, Address, City) VALUES (12,-123.4, 'Skagen 2111','Stv');"
    );
    expect(result).toBe(dedent`
      INSERT
        Customers (ID, MoneyBalance, Address, City)
      VALUES
        (12, -123.4, 'Skagen 2111', 'Stv');
    `);
  });

  it('recognizes @, $, # as part of identifiers', () => {
    const result = format('SELECT from@bar, where#to, join$me FROM tbl;');
    expect(result).toBe(dedent`
      SELECT
        from@bar,
        where#to,
        join$me
      FROM
        tbl;
    `);
  });

  it('allows @ and # at the start of identifiers', () => {
    const result = format('SELECT @bar, #baz, @@some, ##flam FROM tbl;');
    expect(result).toBe(dedent`
      SELECT
        @bar,
        #baz,
        @@some,
        ##flam
      FROM
        tbl;
    `);
  });

  it('formats ALTER TABLE ... ALTER COLUMN', () => {
    expect(format(`ALTER TABLE t ALTER COLUMN foo INT NOT NULL DEFAULT 5;`)).toBe(dedent`
      ALTER TABLE
        t
      ALTER COLUMN
        foo INT NOT NULL DEFAULT 5;
    `);
  });
});
