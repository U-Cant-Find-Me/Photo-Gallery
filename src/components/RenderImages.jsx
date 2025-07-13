import React from 'react'
import PicsumAPI from '@/backend/api/PicsumAPI';
import PixabayAPI from '@/backend/api/PixabayAPI';
import UnsplashAPI from '@/backend/api/UnsplashAPI';
import PexelsAPI from '@/backend/api/PexelsAPI';

const RenderImages = () => {
    return (
        <div className="min-h-screen py-10 px-4 flex flex-col items-center">
            <h1 className="text-4xl font-bold text-gray-400 mb-8 drop-shadow-lg">Popular Images</h1>
            <ul className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                <PixabayAPI />
                <UnsplashAPI />
                <PicsumAPI />
                <PexelsAPI />
            </ul>
        </div>
    )
}

export default RenderImages;