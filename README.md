![](docs/hero.png)
## Why this extension?
Being a passionate biker I use the Calimoto mobile app a lot for my rides. I always prepare these rides on the Calimoto web app but this one has some annoying lacks. The service is good enough that I have been subscribed to the paid offer for several years but the rare upgrades of the web platform led me to do it myself.

## How did you built it?
I had a lot of trouble with this extension because it's not just cosmetic changes. I needed data from the map (marker coordinates) and it was hard to not being able to access the states of the React components from the outside. I did a lot of reverse engineering and fortunately I know about map data. Luckily I found a console.log that contained all datas I needed 😅 otherwise, I would had to catch XHR queries sent by the app. All I had to do was to make my extension communicate with a script injected in the page. Hell yes! Web extensions doesn't have access to the page's `window`, so it was impossible to intercept the original console.log.

I know writing this here will potentially causing my loss if they patch it... But, hey! Let's share the
