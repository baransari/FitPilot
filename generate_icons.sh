#!/bin/bash

# Icon generation script for React Native app
# Source icon path
SOURCE_ICON="app/assets/icon.png"

echo "🎨 Generating app icons from $SOURCE_ICON..."

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Source icon not found: $SOURCE_ICON"
    exit 1
fi

# iOS Icons
echo "📱 Generating iOS icons..."

# Create iOS icon directory if it doesn't exist
IOS_ICON_DIR="ios/NewAIHealthApp/Images.xcassets/AppIcon.appiconset"

# iOS icon generation
echo "  Creating AppIcon-20@2x.png (40x40)"
magick "$SOURCE_ICON" -resize "40x40" "$IOS_ICON_DIR/AppIcon-20@2x.png"

echo "  Creating AppIcon-20@3x.png (60x60)"
magick "$SOURCE_ICON" -resize "60x60" "$IOS_ICON_DIR/AppIcon-20@3x.png"

echo "  Creating AppIcon-29@2x.png (58x58)"
magick "$SOURCE_ICON" -resize "58x58" "$IOS_ICON_DIR/AppIcon-29@2x.png"

echo "  Creating AppIcon-29@3x.png (87x87)"
magick "$SOURCE_ICON" -resize "87x87" "$IOS_ICON_DIR/AppIcon-29@3x.png"

echo "  Creating AppIcon-40@2x.png (80x80)"
magick "$SOURCE_ICON" -resize "80x80" "$IOS_ICON_DIR/AppIcon-40@2x.png"

echo "  Creating AppIcon-40@3x.png (120x120)"
magick "$SOURCE_ICON" -resize "120x120" "$IOS_ICON_DIR/AppIcon-40@3x.png"

echo "  Creating AppIcon-60@2x.png (120x120)"
magick "$SOURCE_ICON" -resize "120x120" "$IOS_ICON_DIR/AppIcon-60@2x.png"

echo "  Creating AppIcon-60@3x.png (180x180)"
magick "$SOURCE_ICON" -resize "180x180" "$IOS_ICON_DIR/AppIcon-60@3x.png"

echo "  Creating AppIcon-1024@1x.png (1024x1024)"
magick "$SOURCE_ICON" -resize "1024x1024" "$IOS_ICON_DIR/AppIcon-1024@1x.png"

# Update iOS Contents.json with filenames
cat > "$IOS_ICON_DIR/Contents.json" << 'EOF'
{
  "images" : [
    {
      "filename" : "AppIcon-20@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "AppIcon-20@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "filename" : "AppIcon-29@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "AppIcon-29@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "filename" : "AppIcon-40@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "AppIcon-40@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "filename" : "AppIcon-60@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "filename" : "AppIcon-60@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "filename" : "AppIcon-1024@1x.png",
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

# Android Icons
echo "🤖 Generating Android icons..."

# Android mipmap-mdpi (48x48)
echo "  Creating ic_launcher.png in mipmap-mdpi (48x48)"
magick "$SOURCE_ICON" -resize "48x48" "android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
magick "$SOURCE_ICON" -resize "48x48" "android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"

# Android mipmap-hdpi (72x72)
echo "  Creating ic_launcher.png in mipmap-hdpi (72x72)"
magick "$SOURCE_ICON" -resize "72x72" "android/app/src/main/res/mipmap-hdpi/ic_launcher.png"
magick "$SOURCE_ICON" -resize "72x72" "android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"

# Android mipmap-xhdpi (96x96)
echo "  Creating ic_launcher.png in mipmap-xhdpi (96x96)"
magick "$SOURCE_ICON" -resize "96x96" "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"
magick "$SOURCE_ICON" -resize "96x96" "android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"

# Android mipmap-xxhdpi (144x144)
echo "  Creating ic_launcher.png in mipmap-xxhdpi (144x144)"
magick "$SOURCE_ICON" -resize "144x144" "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"
magick "$SOURCE_ICON" -resize "144x144" "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"

# Android mipmap-xxxhdpi (192x192)
echo "  Creating ic_launcher.png in mipmap-xxxhdpi (192x192)"
magick "$SOURCE_ICON" -resize "192x192" "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
magick "$SOURCE_ICON" -resize "192x192" "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"

echo "✅ Icon generation completed!"
echo "📝 Next steps:"
echo "   1. Clean and rebuild your project"
echo "   2. For iOS: npx react-native run-ios"
echo "   3. For Android: npx react-native run-android" 