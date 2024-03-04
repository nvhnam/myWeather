import { useState } from "react";

export function useLocation() {
  const [position, setPosition] = useState({});
  const [isFindingCurrentLocation, setIsFindingCurrentLocation] =
    useState(false);

  function getPosition() {
    if (!navigator.geolocation) {
      return window.alert("Can't find device location");
    }

    setIsFindingCurrentLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          long: pos.coords.longitude,
          lat: pos.coords.latitude,
        });
      },
      (error) => {
        window.alert(error.message);
      }
    );
    setIsFindingCurrentLocation(false);
  }

  console.log(position);

  return { position, isFindingCurrentLocation, getPosition, setPosition };
}
