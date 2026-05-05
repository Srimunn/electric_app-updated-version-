const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'itsme', 'OneDrive', 'Documents', 'electric app', 'app', 'parking.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace imports
content = content.replace("import { ResizeMode, Video } from 'expo-av';", "import { useVideoPlayer, VideoView } from 'expo-video';");

// Insert player
content = content.replace(
  "const progressAnim = useRef(new Animated.Value(0.25)).current;",
  `const progressAnim = useRef(new Animated.Value(0.25)).current;

  const player = useVideoPlayer(require('../assets/images/animation.mp4'), (p) => {
    p.loop = true;
    p.play();
    p.muted = true;
  });`
);

// Replace Video component
content = content.replace(
  /<Video[^>]*source={require\('\.\.\/assets\/images\/animation\.mp4'\)}[^>]*\/>/s,
  `<VideoView
                player={player}
                style={styles.parkingVideo}
                contentMode="cover"
              />`
);

fs.writeFileSync(filePath, content);
console.log('Fixed parking.tsx');
