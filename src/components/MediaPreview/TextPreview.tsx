'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TextPreviewProps {
  content: string;
  fileType: string;
}

export default function TextPreview({ content, fileType }: TextPreviewProps) {
  const getLanguage = () => {
    switch (fileType) {
      case 'json':
        return 'json';
      case 'csv':
        return 'csv';
      case 'html':
        return 'html';
      case 'xml':
        return 'xml';
      case 'javascript':
      case 'js':
        return 'javascript';
      case 'typescript':
      case 'ts':
        return 'typescript';
      default:
        return 'text';
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 p-4 min-h-0">
      {fileType === 'csv' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              {content.split('\n').map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.split(',').map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <SyntaxHighlighter
          language={getLanguage()}
          style={tomorrow}
          customStyle={{ margin: 0, borderRadius: '0.5rem', minHeight: '100%' }}
          wrapLines={true}
          showLineNumbers={true}
        >
          {content}
        </SyntaxHighlighter>
      )}
    </div>
  );
}
