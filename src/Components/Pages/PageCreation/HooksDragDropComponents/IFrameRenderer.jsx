import { useEffect, useRef } from 'react';

export default function IFrameRenderer({ data }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!data?.src) return;

    const handleMessage = event => {
      if (event.data?.type === 'IFRAME_HEIGHT' && iframeRef.current) {
        iframeRef.current.style.height = `${event.data.height}px`;
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => window.removeEventListener('message', handleMessage);
  }, [data?.src]);

  if (!data?.src) return null;

  const {
    src,
    width = '100%',
    height = 600,
    title = 'Iframe',
    sandbox,
    allow,
    scrolling = 'auto'
  } = data;

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      width={width}
      height={height}
      sandbox={sandbox}
      allow={allow}
      scrolling={scrolling}
      style={{ border: 'none', display: 'block' }}
    />
  );
}
