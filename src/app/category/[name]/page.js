import SecondaryBar from '@/components/SecondaryBar';

const CategoryPage = async ({ params }) => {
  const { name } = await params;
  return (
    <>
      <SecondaryBar />
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800">{decodeURIComponent(name)}</h1>
      </div>
    </>
  );
};

export default CategoryPage;