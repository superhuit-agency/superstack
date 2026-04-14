interface TableAttributes extends BlockAttributes {
  caption?: string;
  body: Array<{
    cells: Array<{
      align?: 'left' | 'center' | 'right';
      colspan?: number;
      content: string;
      rowspan?: number;
      scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';
      tag?: 'th' | 'td';
    }>;
  }>;
}

interface TableProps extends TableAttributes {}
