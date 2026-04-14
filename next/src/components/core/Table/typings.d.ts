interface TableCell {
  align?: 'left' | 'center' | 'right';
  colspan?: number;
  content: string;
  rowspan?: number;
  scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';
  tag?: 'th' | 'td';
}

interface TableAttributes extends BlockAttributes {
  caption?: string;
  head: Array<{
    cells: Array<TableCell>;
  }>;
  foot: Array<{
    cells: Array<TableCell>;
  }>;
  body: Array<{
    cells: Array<TableCell>;
  }>;
}

interface TableProps extends TableAttributes {}
