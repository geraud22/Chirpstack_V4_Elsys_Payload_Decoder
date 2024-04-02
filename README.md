This repository contains an updated version of the [Generic Elsys Codec](https://www.elsys.se/en/elsys-payload/), to be compatible with Chirpstack V4.
The decodeUplink() function has been edited to appropriately access the payload data - "input.bytes".
The decodeUplink() function returns the decoded payload in the expected format - "return{ data:{}}".
As outlined in the [Chirpstack V4 Docs](https://www.chirpstack.io/docs/chirpstack/use/device-profiles.html?highlight=payload#codec)