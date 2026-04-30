- Firefox Mobile
    1. Base guide `https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/`
    2. Enable `usb debugging` for android device under `developer` options
    3. Enable `remote usb debugging` in firefox apps settings
    4. Within unzipped built extension run with updated device id `web-ext run -t firefox-android --adb-device <YOUR_DEVICE_ID> --firefox-apk org.mozilla.fenix`
