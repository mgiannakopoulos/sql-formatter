import dedent from 'dedent-js';

import { FormatFn } from 'src/sqlFormatter';

export default function supportsCase(format: FormatFn) {
  it('formats CASE ... WHEN with a blank expression', () => {
    const result = format(
      "CASE WHEN option = 'foo' THEN 1 WHEN option = 'bar' THEN 2 WHEN option = 'baz' THEN 3 ELSE 4 END;"
    );

    expect(result).toBe(dedent`
      CASE
        WHEN option = 'foo' THEN 1
        WHEN option = 'bar' THEN 2
        WHEN option = 'baz' THEN 3
        ELSE 4
      END;
    `);
  });

  it('formats CASE ... WHEN with an expression', () => {
    const result = format(
      "CASE trim(sqrt(2)) WHEN 'one' THEN 1 WHEN 'two' THEN 2 WHEN 'three' THEN 3 ELSE 4 END;"
    );

    expect(result).toBe(dedent`
      CASE
        trim(sqrt(2))
        WHEN 'one' THEN 1
        WHEN 'two' THEN 2
        WHEN 'three' THEN 3
        ELSE 4
      END;
    `);
  });

  it('formats CASE ... WHEN inside SELECT', () => {
    const result = format(
      "SELECT foo, bar, CASE baz WHEN 'one' THEN 1 WHEN 'two' THEN 2 ELSE 3 END FROM tbl;"
    );

    expect(result).toBe(dedent`
      SELECT
        foo,
        bar,
        CASE
          baz
          WHEN 'one' THEN 1
          WHEN 'two' THEN 2
          ELSE 3
        END
      FROM
        tbl;
    `);
  });

  it('recognizes lowercase CASE ... END', () => {
    const result = format("case when option = 'foo' then 1 else 2 end;");

    expect(result).toBe(dedent`
      case
        when option = 'foo' then 1
        else 2
      end;
    `);
  });

  // Regression test for issue #43
  it('ignores words CASE and END inside other strings', () => {
    const result = format('SELECT CASEDATE, ENDDATE FROM table1;');

    expect(result).toBe(dedent`
      SELECT
        CASEDATE,
        ENDDATE
      FROM
        table1;
    `);
  });

  it('properly converts to uppercase in case statements', () => {
    const result = format(
      "case trim(sqrt(my_field)) when 'one' then 1 when 'two' then 2 when 'three' then 3 else 4 end;",
      { keywordCase: 'upper' }
    );
    expect(result).toBe(dedent`
      CASE
        TRIM(SQRT(my_field))
        WHEN 'one' THEN 1
        WHEN 'two' THEN 2
        WHEN 'three' THEN 3
        ELSE 4
      END;
    `);
  });

  it('handles edge case of ending inline block with END', () => {
    const result = format(dedent`select sum(case a when foo then bar end) from quaz`);

    expect(result).toBe(dedent`
      select
        sum(
          case
            a
            when foo then bar
          end
        )
      from
        quaz
    `);
  });
}
