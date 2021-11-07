# Bill of Materials

## Raspberry PI

### Common Stuff

- Pimoroni Unicorn Hat HD
  - [Adafruit](https://www.adafruit.com/product/3580)
  - [Pimoroni (UK)](https://shop.pimoroni.com/products/unicorn-hat-hd)
- Micro SD (16 GB)
  - [Amazon](https://www.amazon.com/SanDisk-Ultra-tarjeta-memoria-Gris/dp/B073K14CVB)

### Simple / Tested / Budget

- Raspberry PI 3 Model B
  - [Adafruit](https://www.adafruit.com/product/3055)
  - [Amazon](https://smile.amazon.com/Raspberry-PI-Model-Single-Board-Computer/dp/B085DPFR3N) (Plenty of options)
- Power supply (IMPORTANT: >=2.5A)
  - Tip: Get a cable with a switch or use a [switch extender](https://www.amazon.com/LoveRPi-MicroUSB-Switch-Raspberry-Female/dp/B018BFWLRU), it's super convenient for using the RPi itself
  - [Amazon](https://www.amazon.com/gp/product/B073JDFML5) (Cable has switch)
- Pimoroni Pibow Case (Nice because end result is a single box containing everything)
  - [Pimoroni](https://shop.pimoroni.com/products/pibow-for-raspberry-pi-3-b-plus?variant=2601126395914)
  - [Adafruit](https://www.adafruit.com/product/2081)

### State Of The Art / (untested) / Splurge

If you plan to use the RPi for any other stuff. However, the RPi 4 dissipates a lot of heat, thermal management is advisable, either though fans (plenty of choices), or cases with passive heat sinks (plenty of options too), but will probably collide with the display on this project.

- Raspberry PI 4 Model B - 8GB
  - [Adafruit](https://www.adafruit.com/product/4564)
  - [Amazon](https://www.amazon.com/Raspberry-USB-C-Adapters-Vilros-Quickstart/dp/B089ZSGF8M) - Particularly nice because of the included HDMI to MicroHDMI adapter. **Important: For this project, don't assemble the heat sinks!**)
- Power supply (IMPORTANT: >=3A)
  - [Amazon](https://www.amazon.com/dp/B082PLB4QB) (Cable has switch)
- Case
  - [Amazon - anidees](https://www.amazon.com/anidees-Aluminum-Extra-Raspberry-Model/dp/B07WYPC5HT) - Tall variants may have room for some cooling. All seem to have a clear/smoked top.
  - [Amazon - Geekworm](https://www.amazon.com/Geekworm-Raspberry-Ultra-Thin-Aluminum-Compatible/dp/B07X5Y81C6) - The entire case is a passive cooler. Display is outside.
  - [Pimoroni Pibow Coupé Case](https://www.adafruit.com/product/4318) - Display is outside.

### Control devices

Personal note: I had a Powermate USB laying around, it's my preferred device to interact with the project. The Powermate Bluetooth works reliably (for me) but has some adjustment time.

- Adafruit Rotary Trinkey - easy to acquire, currently supported, no dangling wires!
  - [Adafruit](https://www.adafruit.com/product/4964)
- Griffin Powermate Bluetooth - not officially supported anymore, but available at a very cheap price
  - [Amazon](https://smile.amazon.com/Griffin-PowerMate-Programmable-Multimedia-Controller/dp/B0859MKZ1B)
- Griffin Powermate USB - not supported or available anymore)
  - [Facebook Marketplace](https://www.facebook.com/marketplace/item/503937456977367)

### Optional

- [Pibow Modification Layers](https://shop.pimoroni.com/products/pibow-modification-layers?variant=1048948309)
  - Include LEGO compatible base, super useful to add a stand
  - Diffusion layers, can be used as replacements to the diffuser that comes with the display
- [Left Angle Adapter](https://www.amazon.com/Ksmile%C2%AE-Right-Degree-Female-Adapters/dp/B01C6031MA) - useful if the power cable coming out of the Raspberry Pi doesn't fit well with the entire setup

### Needed for setup, and only for setup

- USB Keyboard
- HDMI cable - Note that the RPi 4 has Micro HDMI connectors, so, an adapter may be necessary
- Any display to connect at the other end of that cable

## Notes

Because it's frequent to reboot the Raspberry Pi, having a cable with a switch or a switch extension for the charger saves a lot of time by not having to plug and unplug the power cable, letting it fall under the desk, having to crawl under to find it, then making sure the right end stays on the desk...
