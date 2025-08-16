"use client";
import { useUser, SignInButton } from '@clerk/nextjs';
import { useCollection } from '@/components/CollectionContext';

const CollectionPage = () => {
    const { isSignedIn, user } = useUser();
    const { collection, removeFromCollection } = useCollection();

    if (!isSignedIn) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-200">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center animate-fadeIn">
                    <h1 className="text-3xl font-bold text-gray-600 mb-4 drop-shadow-lg">Sign In Required</h1>
                    <p className="text-gray-500 mb-6 text-center">You must be signed in to view your collections.</p>
                    <SignInButton mode="modal">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors">Sign In</button>
                    </SignInButton>
                </div>
                <style jsx>{`
                    .animate-fadeIn {
                        animation: fadeInModal 0.25s cubic-bezier(0.4,0,0.2,1);
                    }
                    @keyframes fadeInModal {
                        from { opacity: 0; transform: scale(0.97); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-200">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full flex flex-col items-center animate-fadeIn">
                <h1 className="text-4xl font-bold text-blue-600 mb-4 drop-shadow-lg">{user?.firstName ? `${user.firstName}'s Collection` : 'Your Collection'}</h1>
                <p className="text-gray-500 mb-6 text-center">Here you can view and manage your saved images and collections.</p>
                {collection.length === 0 ? (
                    <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                        <span className="text-gray-400 text-lg">No images in your collection yet.</span>
                    </div>
                ) : (
                    (() => {
                        // Split collection into rows of 3
                        const rows = [];
                        for (let i = 0; i < collection.length; i += 3) {
                            rows.push(collection.slice(i, i + 3));
                        }
                        return (
                            <div className="w-full flex flex-col gap-6">
                                {rows.map((row, rowIdx) => (
                                    <div
                                        key={rowIdx}
                                        className={`flex gap-6 w-full ${row.length < 3 ? 'justify-center' : ''}`}
                                    >
                                        {row.map((img) => (
                                            <div key={img.id + img.source} className="bg-gray-100 rounded-xl shadow p-4 flex flex-col items-center" style={{ maxHeight: '320px', overflow: 'hidden' }}>
                                                <img src={img.url} alt={img.alt || ''} className="rounded-lg mb-2 max-h-48 object-contain" />
                                                <div className="text-gray-700 font-medium mb-1 truncate-ellipsis" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.alt || 'Untitled'}</div>
                                                <div className="text-gray-500 text-sm mb-2">By {img.photographer} ({img.source})</div>
                                                <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm" onClick={() => removeFromCollection(img.id, img.source)}>Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        );
                    })()
                )}
            </div>
            <style jsx>{`
                .animate-fadeIn {
                    animation: fadeInModal 0.25s cubic-bezier(0.4,0,0.2,1);
                }
                @keyframes fadeInModal {
                    from { opacity: 0; transform: scale(0.97); }
                    to { opacity: 1; transform: scale(1); }
                }
                .truncate-ellipsis {
                    max-width: 200px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            `}</style>
        </div>
    );
}

export default CollectionPage;