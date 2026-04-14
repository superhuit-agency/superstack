import './styles.css';

export default function Table(props: TableProps) {
  return (
    <figure className="supt-table">
      <table>
        {props.head && (
          <thead>
            {props.head.map((cell, index) => {
              return (
                <tr key={index}>
                  {cell.cells.map((cell, index) => {
                    return (
                      <th
                        key={index}
                        colSpan={cell.colspan}
                        rowSpan={cell.rowspan}
                        scope={cell.scope}
                        align={cell.align}
                      >
                        {cell.content}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
        )}
        <tbody>
          {props.body.map((row, index) => (
            <tr key={index}>
              {row.cells.map((cell, index) => {
                const Tag = cell.tag === 'th' ? 'th' : 'td';
                return (
                  <Tag
                    key={index}
                    colSpan={cell.colspan}
                    rowSpan={cell.rowspan}
                    scope={cell.scope}
                    align={cell.align}
                  >
                    {cell.content}
                  </Tag>
                );
              })}
            </tr>
          ))}
        </tbody>
        {props.foot && (
          <tfoot>
            {props.foot.map((cell, index) => {
              return (
                <tr key={index}>
                  {cell.cells.map((cell, index) => {
                    return (
                      <th
                        key={index}
                        colSpan={cell.colspan}
                        rowSpan={cell.rowspan}
                        scope={cell.scope}
                        align={cell.align}
                      >
                        {cell.content}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </tfoot>
        )}
      </table>
      {props.caption && <figcaption>{props.caption}</figcaption>}
    </figure>
  );
}
