---
layout: ../../layouts/post.astro
title: How to create Google Maps clone with Next.js, Prisma, and Postgres.
description: Learn how to create a Google Maps clone with Next.js, Prisma, and Postgres. This guide covers the entire process, from setting up your project and database to integrating Google Maps API for displaying markers based on your Postgres data.
dateFormatted: 2022-06-10
---

This article is a documentation of my process of implementing a map on my website that displays markers at certain points stored in a Postgres database through Next.js and Prisma.

To start this project I created a Next.js project with the command:

`npx create-next-app@latest`

Next I created a Postgres database hosted on Heroku following these steps: [](https://dev.to/prisma/how-to-setup-a-free-postgresql-database-on-heroku-1dc1).

Then I needed to connect my Next project to my Postgres database through Prisma. The first step was to install Prisma with the following command:

`npm install prisma --save-dev`

Then I initialized the Prisma project by running

`npx prisma init`

This adds a prisma.schema file which is where you define your schema. It also creates a .env file where you can define your environment variables. In my .env file I defined my database link. You can find this by following step 4 of the link to setup a postgres database.

`DATABASE_URL="postgresql:blahblahblah"`

Then I created my schema in the prisma.schema file. Make sure to include an address field in the schema because that is how our program will know where to place the markers. I also included other information I wanted to provide the user in the info window.

```prisma
//prisma.schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Location {
  id        String     @default(cuid()) @id
  title     String
  address   String?
  website   String?
  phone     String?
}
```

Push the schema to your database

`npx prisma db push`

Install prisma client

`npm install @prisma/client`

Updata your prisma client

`npx prisma generate`

Create a new directory called lib and a prisma.js file in it.

In the prisma.js file you have to create an instance of the Prisma client.

Then you can import your instance of the Prisma client into any file you need.

```js
//prisma.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export default prisma;
```

Run `npx prisma studio` to open the Prisma studio, I added a few entries to play around with.

Now that I have my project connected with my database I can start building the webpage.

I created a new file in the pages directory called maps.js. First I imported all of the packages that we need to use. We need useState and useRef from React to manage the state.
We also need to import a few things from the @react-google-maps/api package which is a package designed to connect the google maps api to our react application.
We also need a few things from the react-places-autocomplete package which makes it easy for us to implement a google places api searchbar into our application.
I also imported my prisma instance from my prisma.js file, and the script package from next/script.

```jsx
import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";

import Script from "next/script";
import prisma from "../lib/prisma";

const libraries = ["places"];
```

After we have all of this imported then we can query our database for our data.

```jsx
export const getServerSideProps = async () => {
  const locations = await prisma.location.findMany();
  return { props: { locations } };
};
```

Then we can create a new functional component with our quereyed data as a prop.

```jsx
const App = ({ locations }) => {};
```

Then we are going to create some state. I created a lot of state and this can probably done in a more efficient way but it works so I will go with it.

```jsx
const App = ({ locations }) => {
  const [center, setCenter] = useState({
    lat: 0,
    lng: 0,
  });

  const [address, setAddress] = useState("");

  const [coords, setCoords] = useState([]);

  const [mapRef, setMapRef] = useState(null);

  const [selected, setSelected] = useState(null);

  const mapRef2 = useRef();

  const options = {
    disableDefaultUI: true,
    zoomControl: true,
  };
};
```

The mapRef2 is pretty stupid but who cares.

Next we need to connect to the google maps api. We do this through the useLoadScript function we imported earlier. The first step is to get a google maps api key. The instructions to do so can be found here. [](https://developers.google.com/maps/documentation/embed/get-api-key#:~:text=Go%20to%20the%20Google%20Maps%20Platform%20%3E%20Credentials%20page.&text=On%20the%20Credentials%20page%2C%20click,Click%20Close.)

The second step is to create a .env.local file in the root directory. You might be able to use the .env file that Prisma created but this is the way that I did it. In the .env.local file add the following line and insert your API Key.

`NEXT_PUBLIC_MAPS_API_KEY=your-api-key`

You can then use this api key in your component with the following function:

```jsx
const { isLoaded } = useLoadScript({
  googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY,
  libraries,
});
```

The libraries line at the end importants the places library.

Now we need to define a few functions that will be called later on in our code.

The first function takes the address that the user selects from the places autocomplete dropdown and it converts the address to latitude and longitude. It also sets the center to the new latitude and longitude.

```jsx
const handleSelect = async (value) => {
  const results = await geocodeByAddress(value);
  const latLng = await getLatLng(results[0]);
  setAddress(value);
  setCenter(latLng);
};
```

The next function is the convertAddress function which is called onMapLoad and converts all of the addresses stored in the database to latitude and longitude points so that we can use those coordinates to display markers later on.

```jsx
const convertAddress = async (value) => {
  const results = await geocodeByAddress(value.address);
  const latLng = await getLatLng(results[0]);
  const locationData = {
    title: value.title,
    address: value.address,
    website: value.website,
    phone: value.phone,
    lat: latLng.lat,
    lng: latLng.lng,
  };
  setCoords((coords) => [...coords, locationData]);
};
```

The next function is called when someone clicks on a marker. What this function does is set the center of the map to whatever the current center is. It gets the current center through calling getCenter() on the mapRef.

```jsx
const onCenterChanged = () => {
  if (mapRef) {
    const newCenter = mapRef.getCenter();
    console.log(newCenter);
    setCenter({
      lat: mapRef.getCenter().lat(),
      lng: mapRef.getCenter().lng(),
    });
  }
};
```

The next function is called when the map loads, and it initializes the map as well as converts all of our addresses into latitude and longitude as mentioned earlier.

```jsx
const onCenterChanged = () => {
  if (mapRef) {
    const newCenter = mapRef.getCenter();
    console.log(newCenter);
    setCenter({
      lat: mapRef.getCenter().lat(),
      lng: mapRef.getCenter().lng(),
    });
  }
};
```

The final function just pans the map to a certain lat and long.

```jsx
const panTo = React.useCallback(({ lat, lng }) => {
  mapRef2.current.panTo({ lat, lng });
}, []);
```

Overall our component looks like this right now:

```jsx
const App = ({ locations }) => {

  const [center, setCenter] = useState({
    lat: 0,
    lng: 0,
  });

  const [address, setAddress] = useState("");

  const [coords, setCoords] = useState([]);

  const [mapRef, setMapRef] = useState(null);

  const [selected, setSelected] = useState(null);

  const mapRef2 = useRef();

  const options = {
    disableDefaultUI: true,
    zoomControl: true,
  }

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY,
    libraries,
  })

  const handleSelect = async (value) => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    setAddress(value);
    setCenter(latLng);
  };

  const convertAddress = async (value) => {
    const results = await geocodeByAddress(value.address);
    const latLng = await getLatLng(results[0]);
    const locationData = {
      title: value.title,
      address: value.address,
      website: value.website,
      phone: value.phone,
      lat: latLng.lat,
      lng: latLng.lng
    }
    setCoords(coords => [...coords, locationData])
  };

  const onCenterChanged = () => {
    if (mapRef) {
      const newCenter = mapRef.getCenter();
      console.log(newCenter);
      setCenter({
        lat: mapRef.getCenter().lat(),
        lng: mapRef.getCenter().lng()
      })
    }
  }



  const onMapLoad = (map) => {
    mapRef2.current = map
    setMapRef(map);
    {locations.map(location => {
      convertAddress(location)
    })}
  }

  const panTo = React.useCallback(({lat, lng}) => {
    mapRef2.current.panTo({lat, lng});
  }, [])
```

The first thing I did was create a button that got the coordinates of the user and panned the map to those coordinates.

```jsx
<button
  className="locate"
  onClick={() => {
    setAddress("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => null
    );
  }}
>
  Locate
</button>
```

Then I created the map itself. Inside the map I mapped through the different coordinates that had been converted from our database, and I displayed a marker at each place. I also included an info window that displays the information of each place.

```jsx
<GoogleMap
          zoom={10}
          {% raw %}
          center={{lat: center.lat, lng: center.lng}}
          {% endraw %}
          mapContainerClassName='map-container'
          options={options}
          onLoad={onMapLoad}
          // onBoundsChanged={onCenterChanged}
        >
          {coords.map(coord => {
            return(
              <Marker
                key={coord.lat}
                {% raw %}
                position={{ lat: parseFloat(coord.lat), lng: parseFloat(coord.lng) }}
                {% endraw %}
                onClick={() => {
                  onCenterChanged()
                  setSelected(coord);
                }}
              />
            )
          })}
          {selected ? (
            <InfoWindow
              {% raw %}
              position={{ lat: selected.lat, lng: selected.lng }}
              {% endraw %}
              onCloseClick={() => {
                setSelected(null);
              }}
            >
              <div>
                <h2>
                  {selected.title}
                </h2>
                <p>{selected.address}</p>
              </div>
            </InfoWindow>
          ) : null
          }



        </GoogleMap>
```

Finally I added the places autocomplete searchbox. I also loaded the google maps places api through the script tag.

```jsx
        <PlacesAutocomplete
          value={address}
          onChange={setAddress}
          onSelect={handleSelect}
        >
          {({ getInputProps, suggestions, getSuggestionItemProps }) => (
            <div>
              <input {...getInputProps({ placeholder: "Type address" })} />

              <div>
                {suggestions.map(suggestion => {
                  const style = {
                    backgroundColor: suggestion.active ? "#41b6e6" : "#fff"
                  };

                  return (
                    <div {...getSuggestionItemProps(suggestion, { style })}>
                      {suggestion.description}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PlacesAutocomplete>
        <Script
          src="https://maps.googleapis.com/maps/api/js?key=key"
          strategy="beforeInteractive"
        ></Script>
```

That is pretty much it. Keep in mind that this code is far from perfect. Also this code has literally zero styling so it is very ugly. It works though which is pretty cool. All in all this is the final code.

```js
//maps.js

import React, {useState, useRef} from 'react';
import {GoogleMap, useLoadScript, Marker, InfoWindow,} from "@react-google-maps/api";
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from 'react-places-autocomplete'

import Script from "next/script";
import prisma from "../lib/prisma";

const libraries = ['places']

export const getServerSideProps = async () => {
  const locations = await prisma.location.findMany();
  return { props: { locations } };
}

const App = ({ locations }) => {

  const [center, setCenter] = useState({
    lat: 0,
    lng: 0,
  });

  const [address, setAddress] = useState("");

  const [coords, setCoords] = useState([]);

  const [mapRef, setMapRef] = useState(null);

  const [selected, setSelected] = useState(null);

  const mapRef2 = useRef();

  const options = {
    disableDefaultUI: true,
    zoomControl: true,
  }

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY,
    libraries,
  })

  const handleSelect = async (value) => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    setAddress(value);
    setCenter(latLng);
  };

  const convertAddress = async (value) => {
    const results = await geocodeByAddress(value.address);
    const latLng = await getLatLng(results[0]);
    const locationData = {
      title: value.title,
      address: value.address,
      website: value.website,
      phone: value.phone,
      lat: latLng.lat,
      lng: latLng.lng
    }
    setCoords(coords => [...coords, locationData])
  };

  const onCenterChanged = () => {
    if (mapRef) {
      const newCenter = mapRef.getCenter();
      console.log(newCenter);
      setCenter({
        lat: mapRef.getCenter().lat(),
        lng: mapRef.getCenter().lng()
      })
    }
  }



  const onMapLoad = (map) => {
    mapRef2.current = map
    setMapRef(map);
    {locations.map(location => {
      convertAddress(location)
    })}
  }

  const panTo = React.useCallback(({lat, lng}) => {
    mapRef2.current.panTo({lat, lng});
  }, [])

  if (!isLoaded) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    )
  }

  if (isLoaded) {
    return(
      <div>
        <button className='locate' onClick={() => {
          setAddress('')
          navigator.geolocation.getCurrentPosition((position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
            setCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          }, () => null);
        }}>Locate</button>

        <GoogleMap
          zoom={10}
          {% raw %}
          center={{lat: center.lat, lng: center.lng}}
          {% endraw %}
          mapContainerClassName='map-container'
          options={options}
          onLoad={onMapLoad}
          // onBoundsChanged={onCenterChanged}
        >
          {coords.map(coord => {
            return(
              <Marker
                key={coord.lat}
                {% raw %}
                position={{ lat: parseFloat(coord.lat), lng: parseFloat(coord.lng) }}
                {% endraw %}
                onClick={() => {
                  onCenterChanged()
                  setSelected(coord);
                }}
              />
            )
          })}
          {selected ? (
            <InfoWindow
              {% raw %}
              position={{ lat: selected.lat, lng: selected.lng }}
              {% endraw %}
              onCloseClick={() => {
                setSelected(null);
              }}
            >
              <div>
                <h2>
                  {selected.title}
                </h2>
                <p>{selected.address}</p>
              </div>
            </InfoWindow>
          ) : null
          }

        </GoogleMap>

        <PlacesAutocomplete
          value={address}
          onChange={setAddress}
          onSelect={handleSelect}
        >
          {({ getInputProps, suggestions, getSuggestionItemProps }) => (
            <div>
              <input {...getInputProps({ placeholder: "Type address" })} />

              <div>
                {suggestions.map(suggestion => {
                  const style = {
                    backgroundColor: suggestion.active ? "#41b6e6" : "#fff"
                  };

                  return (
                    <div {...getSuggestionItemProps(suggestion, { style })}>
                      {suggestion.description}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PlacesAutocomplete>



        <Script
          src="https://maps.googleapis.com/maps/api/js?key=key&libraries=places"
          strategy="beforeInteractive"
        ></Script>
      </div>
    )
  }
}


export default App;
```

Also there is an error on line 168 because I didn't include a key. It is not breaking but you can just add a key to solve it.

Booh yah.
