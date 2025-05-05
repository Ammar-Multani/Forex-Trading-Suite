# iOS Simulator Build Guide

This guide explains how to create, transfer, and run iOS simulator builds on another Mac.

## Building an iOS Simulator App

1. Run the simulator build command:

   ```
   yarn build:ios:simulator
   ```

2. EAS Build will create a simulator build and provide a URL where you can download it once complete.

3. Download the `.tar.gz` file from the URL provided by EAS.

## Transferring to Another Mac

### Option 1: Direct Download

1. Share the download URL provided by EAS with the person who needs to test on another Mac.
2. They can directly download the `.tar.gz` file.

### Option 2: Manual Transfer

1. Download the `.tar.gz` file to your computer.
2. Transfer the file to the other Mac using:
   - Cloud storage (Dropbox, Google Drive, etc.)
   - USB drive
   - Direct file transfer via AirDrop (if both machines are Macs)
   - Email (if the file is not too large)

## Installing on Another Mac

1. On the target Mac, extract the `.tar.gz` file:

   ```
   tar -xvzf your-app-simulator-build.tar.gz
   ```

2. This will extract a `.app` file.

3. Move the `.app` file to a location where you'll remember it (like the Desktop).

## Running on iOS Simulator

1. Make sure Xcode is installed on the target Mac.

2. Open iOS Simulator by:

   - Opening Xcode > Develop > Simulator
   - Or through Spotlight: Press Cmd+Space and type "Simulator"

3. Once the simulator is running, drag and drop the `.app` file onto the simulator window.
4. The app will install and launch automatically.

## Troubleshooting

If you encounter issues:

1. **Simulator Version**: Make sure the simulator is running a compatible iOS version (iOS 14.0 or newer).

2. **App won't install**: Check if the build is for the correct architecture (arm64 for Apple Silicon Macs).

3. **App crashes on launch**: Check the console logs in Xcode > Window > Devices and Simulators.

4. **Build size too large**: Consider using a cloud storage service or splitting the file if needed.

## Notes for Windows Users

If you're on Windows and want to build for iOS:

1. The iOS simulator build can only be run on macOS.
2. You'll need access to a Mac to run iOS simulator builds.
3. Consider using a Mac cloud service like MacStadium or MacinCloud if you don't have access to physical Mac hardware.
