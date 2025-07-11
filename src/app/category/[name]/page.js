import React from 'react';
import SecoundaryBar from '@/components/SecoundaryBar';

const CategoryPage = async ({ params }) => {
  const { name } = await params;
  return (
    <>
      <SecoundaryBar />
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800">{decodeURIComponent(name)}</h1>
      </div>
    </>
  );z
};

export default CategoryPage;

// https://source.unsplash.com/random/520x600/?travel,adventure,nature,car
// https://picsum.photos/520/600/