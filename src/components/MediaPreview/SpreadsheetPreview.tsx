'use client';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

interface SpreadsheetPreviewProps {
  src: string;
}

export default function SpreadsheetPreview({ src }: SpreadsheetPreviewProps) {
  const [sheets, setSheets] = useState<string[]>([]);
  const [currentSheet, setCurrentSheet] = useState<string>('');
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpreadsheet = async () => {
      try {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });

        const sheetNames = workbook.SheetNames;
        setSheets(sheetNames);
        setCurrentSheet(sheetNames[0]);

        loadSheet(workbook, sheetNames[0]);
      } catch (error) {
        console.error('Error loading spreadsheet:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpreadsheet();
  }, [src]);

  const loadSheet = (workbook: XLSX.WorkBook, sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
      setColumns([]);
      setRows([]);
      return;
    }

    // 第一行作为表头
    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1);

    const cols: GridColDef[] = headers.map((header, index) => ({
      field: `col_${index}`,
      headerName: header?.toString() || `列 ${index + 1}`,
      flex: 1,
      minWidth: 150,
    }));

    const rowsData = dataRows.map((row, rowIndex) => {
      const rowData: any = { id: rowIndex };
      headers.forEach((_, colIndex) => {
        rowData[`col_${colIndex}`] = row[colIndex]?.toString() || '';
      });
      return rowData;
    });

    setColumns(cols);
    setRows(rowsData);
  };

  const handleSheetChange = (sheetName: string) => {
    setCurrentSheet(sheetName);
    setLoading(true);
    // 重新加载工作簿
    fetch(src)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => {
        const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
        loadSheet(workbook, sheetName);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <div className="flex gap-2 p-2 bg-gray-100 border-b overflow-x-auto flex-shrink-0">
        {sheets.map(sheet => (
          <button
            key={sheet}
            onClick={() => handleSheetChange(sheet)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
              currentSheet === sheet
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            {sheet}
          </button>
        ))}
      </div>
      <div className="flex-1 p-4 min-h-0">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[20, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
          disableRowSelectionOnClick
          className="bg-white rounded shadow"
        />
      </div>
    </div>
  );
}
