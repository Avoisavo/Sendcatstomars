# Spline-Related Files Moved from pet-pet

This directory contains all Spline 3D viewer related files and components moved from the pet-pet project.

## Directory Structure

```
/Users/zwavo/cureMe/
├── components/
│   ├── InstructionsModal.js              # Instructions modal for SplineViewer
│   ├── room/
│   │   ├── SplineViewer/                 # Main Spline 3D viewer component (modular)
│   │   │   ├── index.js                  # Main component with UI and state management
│   │   │   ├── helpers.js                # Utility functions (event emission, object finding)
│   │   │   ├── dogMovement.js            # Random dog movement logic
│   │   │   ├── dogFeeding.js             # Feed sequence (walk to bowl, eat)
│   │   │   ├── dogPlaying.js             # Play animation trigger
│   │   │   └── README.md                 # Component documentation
│   │   ├── RoomHeader.js                 # Room page header component
│   │   ├── RoomObjectsList.js            # Room objects list component
│   │   └── CustomizationOptions.js       # Room customization options
│   └── ui/
│       ├── background-gradient-animation.tsx  # Animated background
│       ├── button.jsx                    # Button UI component
│       └── card.jsx                      # Card UI component
└── pages/
    └── room.js                           # Main room page that uses SplineViewer

```

## How Spline is Used

### 1. **Spline Scene Loading**
- Loads a 3D scene from Spline URL: `https://prod.spline.design/E0hO4wxfp4CCDNLm/scene.splinecode`
- Uses `@splinetool/react-spline` package for React integration
- Dynamic import with SSR disabled for better performance

### 2. **Programmatic Control**
The author controls the 3D dog avatar programmatically via:
- **Event emission**: `mouseDown` (walk/run), `mouseUp` (idle)
- **Keyboard events**: 
  - `=` key for eating animation
  - `-` key for playing animation
- **Manual position/rotation updates**: JavaScript directly updates the dog's 3D transform

### 3. **Animation States**
Managed with React refs for performance:
- `isWalkingRef` - Walking/running state
- `isFeedingRef` - Feeding state
- `isPlayingRef` - Playing state
- `feedQueuedRef` / `playQueuedRef` - Queued actions

### 4. **Key Features**
- Random autonomous dog movement within room bounds
- Walk to food bowl and eat on command
- Play animation on command
- Action queuing system (if dog is busy)
- Keyboard shortcuts (1: walk, 2: run, 4/5: feed, 6: play)
- Fullscreen mode, zoom control, sound toggle
- Seamless animation transitions

## Implementation Details

### SplineViewer Component Structure

**Main Component** (`index.js`):
- Renders Spline canvas with controls
- Manages UI state (loading, fullscreen, sound, notifications)
- Handles scene initialization and animation cycling
- Coordinates between modular helper files

**Helper Modules**:
- `helpers.js` - Event emission, angle normalization, object finding
- `dogMovement.js` - Random movement with boundary detection and smooth motion
- `dogFeeding.js` - Complete feed sequence with queueing
- `dogPlaying.js` - Play animation with seamless idle transition

### Usage Example

```javascript
import SplineViewer from '@/components/room/SplineViewer';

<SplineViewer 
  sceneUrl={sceneUrl}
  maxStepDistance={36}
  showNotification={showNotification}
  notificationMessage={notificationMessage}
  onFeedReady={(feedFunc) => setFeedDogFunction(() => feedFunc)}
  onPlayReady={(playFunc) => setPlayDogFunction(() => playFunc)}
  onWalkReady={(walkFunc) => setWalkDogFunction(() => walkFunc)}
  onRunReady={(runFunc) => setRunDogFunction(() => runFunc)}
/>
```

## Dependencies Required

Make sure to install these packages in your project:

```json
{
  "@splinetool/react-spline": "^4.1.0",
  "@splinetool/runtime": "^1.10.84"
}
```

## UI Components Used

The SplineViewer uses these UI components:
- Button (from `@/components/ui/button`)
- Card, CardContent, CardHeader, CardTitle (from `@/components/ui/card`)
- Background Gradient Animation (from `@/components/ui/background-gradient-animation`)
- Icons from `lucide-react`

## Room Page Implementation

The `pages/room.js` file demonstrates how to:
1. Import and use SplineViewer
2. Pass callback functions to receive action handlers
3. Display notification messages
4. Integrate with other room components
5. Apply gradient background animations

## Original Source

These files were copied from: `/Users/zwavo/pet-pet/`

Date copied: November 1, 2025


