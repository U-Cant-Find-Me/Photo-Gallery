import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const LazyImage = ({ src, alt, width, height }) => {
    const [isVisible, setIsVisible] = useState(false);
    const imgRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 1 }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef}>
            {isVisible ? (
                <Image className="w-full h-[450px] object-cover transition-transform duration-300 group-hover:scale-105" style={{ minWidth: '380px' }}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    loading="eager"
                />
            ) : (
                <div
                    style={{
                        width: { width },
                        height: { height },
                        backgroundColor: '#f0f0f0'
                    }}
                />
            )}
        </div>
    );
}

export default LazyImage;