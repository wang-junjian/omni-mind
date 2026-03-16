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
      <div className="flex-1 flex items-center justify-center">
        <ReactPlayer
          url={src}
          controls
          width="100%"
          height="100%"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
              },
            },
          }}
        />
      </div>
      <div className="bg-gray-900 text-white p-4">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
    </div>
  );
}
