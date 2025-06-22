"use client"

import MdAndBelowScreenNav from './subcomponent/MdAndBelowScreenNav';
import LgScreenNav from './subcomponent/LgScreenNav';
import AboveLgScreenNav from './subcomponent/AboveLgScreenNav';

const Navbar = () => {
    return (
        <div>
            {/* Show on md and below */}
            <section className="block md:hidden">
                <MdAndBelowScreenNav />
            </section>
            {/* Show on large screens only */}
            <section className="hidden md:flex lg:hidden">
                <LgScreenNav />
            </section>
            {/* Show on above large screens only */}
            <section className="hidden lg:flex">
                <AboveLgScreenNav />
            </section>
        </div>
    )
}

export default Navbar;