import Hello from "@/components/hello";
import React from "react";
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {IEvent} from "@/database/event.model";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const Page = async () => {

    const response = await fetch(`${BASE_URL}/api/events`)
    console.log("loaded pafe")
    const {events} = await response.json();

    console.log('what is the home', response.json());

    return (
        <section>
            <h1 className="text-center">The Hub for Every Dev <br/> Event You Can't Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups and Conferences. All in One Place</p>
            <ExploreBtn/>
            <div className="mt-20 space-y-7">
                <h1>Fearured Events</h1>

                <ul className="events">
                    {/*{events && events.length > 0 && events.map((event: IEvent) => (*/}
                    {/*    <li key={event.title}>*/}
                    {/*        <EventCard {...event} />*/}
                    {/*    </li>*/}
                    {/*))}*/}
                </ul>

            </div>
        </section>
    )
}
export default Page
