import React from 'react';
import SecoundaryBar from '@/components/SecoundaryBar';

const CategoryPage = ({ params }) => {
  const { name } = params;
  return (
    <>
      <SecoundaryBar />
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800">{decodeURIComponent(name)}</h1>
      </div>
    </>
  );
};

export default CategoryPage;
