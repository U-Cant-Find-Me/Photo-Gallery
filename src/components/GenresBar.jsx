import { usePathname, useRouter } from 'next/navigation';

const genres = [
  'Wallpaper',
  '3D Renders',
  'Film',
  'Nature',
  'Space',
  'People',
  'Animal',
  'Street Photography',
  'Travel',
  'Technology',
];

const getCategoryPath = (name) => `/category/${encodeURIComponent(name)}`;

const GenresBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="flex flex-grow ml-5 overflow-x-auto scrollbar-hide basis-auto md:flex-1">
      <ul className="flex w-full items-center justify-around flex-nowrap gap-4 whitespace-nowrap">
        {genres.map((cat) => {
            const link = getCategoryPath(cat);
            const isActive = pathname === link;
            const handleClick = (e) => {
              e.preventDefault();
              router.push(`/category/${encodeURIComponent(cat)}?q=${encodeURIComponent(cat)}`);
            };
            return (
                <li className="relative" key={cat}>
              <a href={`/category/${encodeURIComponent(cat)}?q=${encodeURIComponent(cat)}`} onClick={handleClick}>
                <span className={`font-bold text-base transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-white focus:text-white'}`}>{cat}
                  {isActive && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-2/3 h-0.5 bg-white animate-flicker2s rounded"></span>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GenresBar;