import Search from './Search'

const CenterPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/30 shadow-lg p-8 flex flex-col items-center justify-center">
                <span className='text-2xl font-bold text-white'>Photo Gallery</span>
                <span className='text-lg text-center text-white/80 mt-2 mb-2'>Discover, search and save stunning images from around the world!</span>
                <span className='text-lg text-center text-white/80 mb-4'>A seamless platform to explore and collect high-quality images</span>
                <div className="min-w-0 w-full md:w-2xl">
                    <Search />
                </div>
            </div>
        </div>
    )
}

export default CenterPage;