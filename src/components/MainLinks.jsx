import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainLinks = [
  'Editorial',
  'Following',
];

const getCategoryPath = (name) => `/category/${encodeURIComponent(name)}`;

const MainLinks = () => {
  const pathname = usePathname();
  return (
    <div className="ml-2 w-full md:w-1/7 flex items-center">
      <ul className="flex w-full gap-4 items-center justify-around flex-nowrap">
        {mainLinks.map((text) => {
          const link = getCategoryPath(text);
          const isActive = pathname === link;
          return (
            <li className="flex-1 relative" key={text}>
              <Link href={link}>
                <span className={`block w-full text-center font-bold text-base transition-colors py-2 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white focus:text-white'}`}>{text}
                  {isActive && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-2/3 h-0.5 bg-white animate-flicker2s rounded"></span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MainLinks;