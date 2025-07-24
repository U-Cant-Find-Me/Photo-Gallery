'use client';
// import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import SecondaryBar from '@/components/SecondaryBar';
import UnsplashAPI from '@/backend/api/UnsplashAPI';
import PixabayAPI from '@/backend/api/PixabayAPI';
import PicsumAPI from '@/backend/api/PicsumAPI';
import PexelsAPI from '@/backend/api/PexelsAPI';
import useProgressiveLoading from '@/components/useProgressiveLoading';

const CategoryPageContent = ({ params }) => {
  const searchParams = useSearchParams();
  // const { name } = use(params);
  const { name } = params;
  const q = searchParams.get('q') || name;
  const totalComponents = 4;

  const {
    loadedComponents,
    componentProgress,
    isLoading,
    setComponentRef,
    getLoadingStatus,
    manuallyLoadNext,
    config
  } = useProgressiveLoading(totalComponents);

  const renderComponent = (index) => {
    if (!loadedComponents.includes(index)) {
      return (
        <li 
          key={`placeholder-${index}`}
          className="flex items-center justify-center h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300"
        >
          <div className="text-center">
            {config.PERFORMANCE.SHOW_LOADING_ANIMATIONS && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
            )}
            <p className="text-gray-500">Loading...</p>
            {isLoading && index === Math.max(...loadedComponents) + 1 && (
              <p className="text-xs text-gray-400 mt-1">Preparing to load...</p>
            )}
            <button 
              onClick={() => manuallyLoadNext()}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Load Now
            </button>
          </div>
        </li>
      );
    }

    const components = [
      <UnsplashAPI key="unsplash" category={q} />, // pass category as prop
      <PixabayAPI key="pixabay" category={q} />,  // pass category as prop
      <PicsumAPI key="picsum" category={q} />,    // pass category as prop
      <PexelsAPI key="pexels" category={q} />     // pass category as prop
    ];

    return (
      <div 
        key={`component-${index}`}
        ref={el => setComponentRef(index, el)}
        className="contents"
      >
        {components[index]}
      </div>
    );
  };

  return (
    <>
      <SecondaryBar />
      <div className="min-h-screen py-10 px-4 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-400 mb-8 drop-shadow-lg">{decodeURIComponent(name)} Images</h1>
        <ul className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {Array.from({ length: totalComponents }, (_, index) => renderComponent(index))}
        </ul>
      </div>
    </>
  );
};

const CategoryPage = ({ params }) => {
  return (
    <Suspense fallback={
      <>
        <SecondaryBar />
        <div className="min-h-screen py-10 px-4 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-400 mb-8 drop-shadow-lg">Loading Category...</h1>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading images...</p>
          </div>
        </div>
      </>
    }>
      <CategoryPageContent params={params} />
    </Suspense>
  );
};

export default CategoryPage;