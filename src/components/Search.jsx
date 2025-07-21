"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ImSearch } from 'react-icons/im'
import { SiGooglelens } from 'react-icons/si';

const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const Search = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inputRef = useRef();
    const [inputValue, setInputValue] = useState('');

    // Sync input value with URL query param 'q'
    useEffect(() => {
        const q = searchParams.get('q') || '';
        setInputValue(q);
    }, [searchParams]);

    const handleSearch = useCallback(
        debounce((value) => {
            if (value && value.trim().length > 0) {
                router.push(`/search?q=${encodeURIComponent(value.trim())}`);
            } else {
                router.push(`/search`);
            }
        }, 500),
        [router]
    );

    const onInputChange = (e) => {
        setInputValue(e.target.value);
        handleSearch(e.target.value);
    };

    return (
        <div className="flex flex-row flex-1 items-center justify-around pl-4 pr-4 border border-gray-700 rounded-full bg-gray-100 focus-within:bg-white focus-within:border-gray-300 h-full min-h-[40px]">
            <ImSearch className="text-lg" />
            <input
                className="bg-gray-100 text-red-500 w-full h-full pl-2 text-base border-none focus:outline-none focus:bg-white"
                type="text"
                placeholder='Search...'
                onChange={onInputChange}
                value={inputValue}
                ref={inputRef}
            />
            <SiGooglelens className="text-lg" />
        </div>
    )
}

export default Search;