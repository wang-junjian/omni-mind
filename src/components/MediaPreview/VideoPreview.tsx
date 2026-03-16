'use client';

import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

interface VideoPreviewProps {
  src: string;
  title: string;
}

export default function VideoPreview({ src, title }: VideoPreviewProps) {
  return (
    <div className="w-full h-full bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="w-full h-full max-h-full flex items-center justify-center">
          <ReactPlayer
            url={src}
            controls
            width="100%"
            height="100%"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                },
              },
            }}
          />
        </div>
      </div>
      <div className="bg-gray-900 text-white p-4 flex-shrink-0">
        <h3 className="text-lg font-medium truncate" title={title}>{title}</h3>
      </div>
    </div>
  );
}
