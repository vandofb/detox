#!/bin/bash -e

if [ `uname` == "Darwin" ]; then
  echo -e "\nPackaging Detox iOS sources"
  rm -fr Detox-ios-src.tbz
  #Prepare Earl Grey without building
  ios/EarlGrey/Scripts/setup-earlgrey.sh > /dev/null
  find ./ios -name Build -type d -exec rm -rf {} \; > /dev/null

  cd ios
  
  INSTRUMENTS_APP_PATH=$(mdfind kMDItemCFBundleIdentifier="com.LeoNatan.DetoxInstruments" | head -n 1)
  if [ ! -d "$INSTRUMENTS_APP_PATH" ] then
	echo -e "\nDetox Instruments is not installed on this machine"
	exit -1
  fi
  PROFILER_FRAMEWORK_PATH="${INSTRUMENTS_APP_PATH}/Contents/SharedSupport/ProfilerFramework/DTXProfiler.framework"
  if [ "${INSTRUMENTS_APP_PATH}" -a -d "${PROFILER_FRAMEWORK_PATH}" ]; then
    cp -R "$PROFILER_FRAMEWORK_PATH" .
  else
	echo -e "\nDetox Instruments is installed, but DTXProfiler.framework does not exist at $PROFILER_FRAMEWORK_PATH"
	exit -1
  fi

  tar -cjf ../Detox-ios-src.tbz .
  cd ..
fi

if [ "$1" == "android" -o "$2" == "android" ] ; then
	echo -e "\nBuilding Detox aars"
	rm -fr detox-oldOkhttp-debug.aar
        rm -fR detox-newOkhttp-debug.aar
        rm -fR detox-oldOkhttp-release.aar
        rm -fR detox-newOkhttp-release.aar
	cd android
	./gradlew assembleDebug
	./gradlew assembleRelease
	cd ..
	cp -fR android/detox/build/outputs/aar/detox-oldOkhttp-debug.aar .
        cp -fR android/detox/build/outputs/aar/detox-newOkhttp-debug.aar .
	cp -fR android/detox/build/outputs/aar/detox-oldOkhttp-release.aar .
        cp -fR android/detox/build/outputs/aar/detox-newOkhttp-release.aar .
fi
