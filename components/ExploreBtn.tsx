'use client'

import Image from "next/image";

const ExploreBtn = () => {
    return (
        <button type='button' id='explore-btn' onClick={ExploreBtn} className='mt-7 mx-auto'>
            <a href="#events">
                Explore events
                <Image src='/icons/arrow-down.svg' alt='arrow-down' width={24} height={24}/>
            </a>
        </button>
    )
}
export default ExploreBtn
