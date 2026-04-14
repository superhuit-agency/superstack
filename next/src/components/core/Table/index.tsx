import './styles.css';

export default function Table(props: TableProps) {
  return (
    <figure className="supt-table">
      <table>
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
      </table>
      {props.caption && <figcaption>{props.caption}</figcaption>}
    </figure>
  );
}
