import { ImSearch } from 'react-icons/im'
import { SiGooglelens } from 'react-icons/si';

const Search = () => {
    return (
        <div className="flex flex-row flex-1 items-center justify-around pl-4 pr-4 border border-gray-700 rounded-full bg-gray-100 focus-within:bg-white focus-within:border-gray-300 h-full min-h-[40px]">
            <ImSearch className="text-lg" />
            <input className="bg-gray-100 text-red-500 w-full h-full pl-2 text-base border-none focus:outline-none focus:bg-white" type="text" placeholder='Search...' />
            <SiGooglelens className="text-lg" />
        </div>
    )
}

export default Search;