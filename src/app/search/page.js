"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LazyImage from '@/components/LazyImage';
import ErrorMessage from '@/components/ErrorHandling/ErrorMessage';
import axios from 'axios';
import SecondaryBar from '@/components/SecondaryBar';

const fetchPexels = async (query, page = 1) => {
    const apiKey = process.env.NEXT_PUBLIC_API_PEXELS;
    if (!apiKey) throw new Error('Pexels API key missing');
    const res = await axios.get('https://api.pexels.com/v1/search', {
        headers: { Authorization: apiKey },
        params: { query, per_page: 12, page },
    });
    return res.data.photos || [];
};

const fetchPixabay = async (query, page = 1) => {
    const apiKey = process.env.NEXT_PUBLIC_API_PIXABAY;
    if (!apiKey) throw new Error('Pixabay API key missing');
    const res = await axios.get('https://pixabay.com/api/', {
        params: { key: apiKey, q: query, image_type: 'photo', per_page: 12, page },
    });
    return res.data.hits || [];
};

const fetchUnsplash = async (query, page = 1) => {
    const apiKey = process.env.NEXT_PUBLIC_API_UNSPLASH;
    if (!apiKey) throw new Error('Unsplash API key missing');
    const res = await axios.get('https://api.unsplash.com/search/photos', {
        params: { client_id: apiKey, query, per_page: 12, page },
    });
    return res.data.results || [];
};

const apiList = [
    { name: 'Unsplash', fetcher: fetchUnsplash },
    { name: 'Pixabay', fetcher: fetchPixabay },
    { name: 'Pexels', fetcher: fetchPexels },
];

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pages, setPages] = useState({ Unsplash: 1, Pixabay: 1, Pexels: 1, Picsum: 1 });
    const [hasMore, setHasMore] = useState({ Unsplash: true, Pixabay: true, Pexels: true, Picsum: true });
    const loaderRef = useRef(null);

    // Initial fetch
    useEffect(() => {
        if (!query) return;
        setLoading(true);
        setError(null);
        setPages({ Unsplash: 1, Pixabay: 1, Pexels: 1, Picsum: 1 });
        setHasMore({ Unsplash: true, Pixabay: true, Pexels: true, Picsum: true });
        Promise.all(
            apiList.map(api =>
                api.fetcher(query, 1)
                    .then(data => ({ name: api.name, data }))
                    .catch(e => ({ name: api.name, error: e.message }))
            )
        ).then(resArr => {
            const resObj = {};
            resArr.forEach(r => {
                resObj[r.name] = r.error ? { error: r.error } : { data: r.data };
            });
            setResults(resObj);
            setLoading(false);
        });
    }, [query]);

    // Infinite scroll observer
    useEffect(() => {
        if (!query) return;
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                apiList.forEach(api => {
                    if (hasMore[api.name] && !loading) {
                        const nextPage = pages[api.name] + 1;
                        api.fetcher(query, nextPage)
                            .then(data => {
                                if (data.length === 0) {
                                    setHasMore(prev => ({ ...prev, [api.name]: false }));
                                    return;
                                }
                                setResults(prev => ({
                                    ...prev,
                                    [api.name]: {
                                        data: [...(prev[api.name]?.data || []), ...data]
                                    }
                                }));
                                setPages(prev => ({ ...prev, [api.name]: nextPage }));
                            })
                            .catch(e => {
                                setResults(prev => ({
                                    ...prev,
                                    [api.name]: { error: e.message }
                                }));
                                setHasMore(prev => ({ ...prev, [api.name]: false }));
                            });
                    }
                });
            }
        }, { threshold: 1 });
        const current = loaderRef.current;
        if (current) observer.observe(current);
        return () => {
            if (current) observer.unobserve(current);
        };
    }, [query, pages, hasMore, loading]);

    if (!query) {
        return <div className="p-8 text-center text-gray-500">Enter a search term above.</div>;
    }

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading results...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center">
            {/* Sticky search bar */}
            <SecondaryBar />
            <div className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm py-4 px-4 flex flex-col items-center">
                <h1 className="text-4xl font-bold text-gray-400 mb-2 drop-shadow-lg">Search Results for &quot;{query}&quot;</h1>
            </div>
            <div className="w-full max-w-6xl px-2 md:px-0 mt-8">
                {apiList.map(api => (
                    <div key={api.name} className="mb-16">
                        {results[api.name]?.error ? (
                            <ErrorMessage title={`Error from ${api.name}`} message={results[api.name].error} />
                        ) : (
                            <ul className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {(results[api.name]?.data || []).map((img, idx) => {
                                    let src = '';
                                    let alt = '';
                                    if (api.name === 'Unsplash') {
                                        src = img.urls?.regular;
                                        alt = img.alt_description || img.description || 'Unsplash image';
                                    } else if (api.name === 'Pixabay') {
                                        src = img.webformatURL;
                                        alt = img.tags || 'Pixabay image';
                                    } else if (api.name === 'Pexels') {
                                        src = img.src?.large;
                                        alt = img.alt || 'Pexels image';
                                    } else if (api.name === 'Picsum') {
                                        src = img.download_url;
                                        alt = img.author || 'Picsum image';
                                    }
                                    return (
                                        <li key={src + idx} className="relative group overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white w-full max-w-[420px] mx-auto transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl">
                                            <LazyImage
                                                src={src}
                                                alt={alt}
                                                width={420}
                                                height={450}
                                                className="w-full h-[450px] object-cover transition-transform duration-300 group-hover:scale-105"
                                                style={{ minWidth: '380px' }}
                                                priority={idx < 3}
                                            />
                                            {alt && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-center p-3 text-base font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    {alt}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                ))}
                {/* Loader for infinite scroll */}
                <div ref={loaderRef} className="h-16 w-full flex items-center justify-center">
                    {Object.values(hasMore).some(Boolean) ? (
                        <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                            <span className="inline-block w-4 h-4 rounded-full bg-blue-400" />
                            <span className="font-medium">Loading more...</span>
                        </div>
                    ) : (
                        <span className="text-gray-400 font-medium">No more results.</span>
                    )}
                </div>
            </div>
            <style jsx global>{`
                body { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%); }
            `}</style>
        </div>
    );
}

export default function SearchResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center">
                <SecondaryBar />
                <div className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm py-4 px-4 flex flex-col items-center">
                    <h1 className="text-4xl font-bold text-gray-400 mb-2 drop-shadow-lg">Loading Search Results...</h1>
                </div>
                <div className="p-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
                    Loading...
                </div>
            </div>
        }>
            <SearchResultsContent />
        </Suspense>
    );
}