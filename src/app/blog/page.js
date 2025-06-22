import React from 'react'

const page = () => {
    return (
        <div>
            <h3 className="text-2xl font-bold text-center mt-10">Blog</h3>
            <p className="text-center mt-4">Currently, we are not accepting photo submissions.</p>
            <div className="flex items-center justify-center mt-6">
                <img src="/images/coming-soon.png" alt="Coming Soon" className="w-1/2 h-auto" />
            </div>
        </div>
    )
}

export default page;