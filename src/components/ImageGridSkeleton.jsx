import React from "react";

export default function ImageGridSkeleton({ count = 9 }) {
    return (
        <div className="p-8 flex flex-col items-center">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                {Array.from({ length: count }).map((_, idx) => (
                    <div key={idx} className="animate-pulse bg-gray-200 rounded-2xl shadow-xl border border-gray-200 w-full max-w-[420px] h-[450px] mx-auto flex flex-col justify-end relative overflow-hidden">
                        <div className="absolute top-2 right-2 w-10 h-10 bg-gray-300 rounded-full" />
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-300 to-transparent" />
                    </div>
                ))}
            </div>
            <div className="mt-8 text-gray-400 font-medium">Loading results...</div>
        </div>
    );
}
