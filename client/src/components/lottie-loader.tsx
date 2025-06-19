import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

// Space-themed Lottie animation data for loading states
const spaceLoadingAnimation = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 90,
  "w": 400,
  "h": 400,
  "nm": "Space Loading",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Circle",
      "sr": 1,
      "ks": {
        "o": {"a": 0, "k": 100},
        "r": {
          "a": 1,
          "k": [
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [0]},
            {"t": 90, "s": [360]}
          ]
        },
        "p": {"a": 0, "k": [200, 200, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {"a": 0, "k": [100, 100, 100]}
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "d": 1,
              "ty": "el",
              "s": {"a": 0, "k": [80, 80]},
              "p": {"a": 0, "k": [0, 0]}
            },
            {
              "ty": "st",
              "c": {"a": 0, "k": [0.067, 0.725, 0.537, 1]},
              "o": {"a": 0, "k": 100},
              "w": {"a": 0, "k": 4}
            },
            {
              "ty": "tr",
              "p": {"a": 0, "k": [0, 0]},
              "a": {"a": 0, "k": [0, 0]},
              "s": {"a": 0, "k": [100, 100]},
              "r": {"a": 0, "k": 0},
              "o": {"a": 0, "k": 100}
            }
          ]
        }
      ],
      "ip": 0,
      "op": 90,
      "st": 0,
      "bm": 0
    },
    {
      "ddd": 0,
      "ind": 2,
      "ty": 4,
      "nm": "Dots",
      "sr": 1,
      "ks": {
        "o": {
          "a": 1,
          "k": [
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [0]},
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 15, "s": [100]},
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 75, "s": [100]},
            {"t": 90, "s": [0]}
          ]
        },
        "r": {"a": 0, "k": 0},
        "p": {"a": 0, "k": [200, 200, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {"a": 0, "k": [100, 100, 100]}
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "d": 1,
              "ty": "el",
              "s": {"a": 0, "k": [8, 8]},
              "p": {"a": 0, "k": [30, 0]}
            },
            {
              "ty": "fl",
              "c": {"a": 0, "k": [1, 1, 1, 1]},
              "o": {"a": 0, "k": 100}
            },
            {
              "ty": "tr",
              "p": {"a": 0, "k": [0, 0]},
              "a": {"a": 0, "k": [0, 0]},
              "s": {"a": 0, "k": [100, 100]},
              "r": {"a": 0, "k": 0},
              "o": {"a": 0, "k": 100}
            }
          ]
        },
        {
          "ty": "rp",
          "c": {"a": 0, "k": 8},
          "o": {"a": 0, "k": 0},
          "tr": {
            "ty": "tr",
            "p": {"a": 0, "k": [0, 0]},
            "a": {"a": 0, "k": [0, 0]},
            "s": {"a": 0, "k": [100, 100]},
            "r": {"a": 0, "k": 45},
            "so": {"a": 0, "k": 100},
            "eo": {"a": 0, "k": 100}
          }
        }
      ],
      "ip": 0,
      "op": 90,
      "st": 0,
      "bm": 0
    }
  ]
};

interface LottieLoaderProps {
  size?: number;
  className?: string;
}

export function LottieLoader({ size = 80, className = "" }: LottieLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie
        animationData={spaceLoadingAnimation}
        loop={true}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

// Cosmic pulse animation for skeleton states
const cosmicPulseAnimation = {
  "v": "5.7.4",
  "fr": 24,
  "ip": 0,
  "op": 48,
  "w": 200,
  "h": 200,
  "nm": "Cosmic Pulse",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Pulse",
      "sr": 1,
      "ks": {
        "o": {
          "a": 1,
          "k": [
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [30]},
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 24, "s": [100]},
            {"t": 48, "s": [30]}
          ]
        },
        "r": {"a": 0, "k": 0},
        "p": {"a": 0, "k": [100, 100, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {
          "a": 1,
          "k": [
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [80, 80, 100]},
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 24, "s": [120, 120, 100]},
            {"t": 48, "s": [80, 80, 100]}
          ]
        }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "d": 1,
              "ty": "el",
              "s": {"a": 0, "k": [60, 60]},
              "p": {"a": 0, "k": [0, 0]}
            },
            {
              "ty": "gf",
              "o": {"a": 0, "k": 100},
              "r": 1,
              "bm": 0,
              "g": {
                "p": 3,
                "k": {
                  "a": 0,
                  "k": [0, 0.067, 0.725, 0.537, 0.5, 0.8, 0.4, 0.9, 1, 0.925, 0.325, 0.6]
                }
              },
              "s": {"a": 0, "k": [0, 0]},
              "e": {"a": 0, "k": [60, 0]}
            },
            {
              "ty": "tr",
              "p": {"a": 0, "k": [0, 0]},
              "a": {"a": 0, "k": [0, 0]},
              "s": {"a": 0, "k": [100, 100]},
              "r": {"a": 0, "k": 0},
              "o": {"a": 0, "k": 100}
            }
          ]
        }
      ],
      "ip": 0,
      "op": 48,
      "st": 0,
      "bm": 0
    }
  ]
};

export function CosmicPulse({ size = 40, className = "" }: LottieLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie
        animationData={cosmicPulseAnimation}
        loop={true}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

// Satellite orbit animation
const satelliteOrbitAnimation = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 120,
  "w": 300,
  "h": 300,
  "nm": "Satellite Orbit",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Orbit",
      "sr": 1,
      "ks": {
        "o": {"a": 0, "k": 30},
        "r": {
          "a": 1,
          "k": [
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [0]},
            {"t": 120, "s": [360]}
          ]
        },
        "p": {"a": 0, "k": [150, 150, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {"a": 0, "k": [100, 100, 100]}
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "d": 1,
              "ty": "el",
              "s": {"a": 0, "k": [200, 200]},
              "p": {"a": 0, "k": [0, 0]}
            },
            {
              "ty": "st",
              "c": {"a": 0, "k": [0.067, 0.725, 0.537, 1]},
              "o": {"a": 0, "k": 100},
              "w": {"a": 0, "k": 2}
            },
            {
              "ty": "tr",
              "p": {"a": 0, "k": [0, 0]},
              "a": {"a": 0, "k": [0, 0]},
              "s": {"a": 0, "k": [100, 100]},
              "r": {"a": 0, "k": 0},
              "o": {"a": 0, "k": 100}
            }
          ]
        }
      ],
      "ip": 0,
      "op": 120,
      "st": 0,
      "bm": 0
    },
    {
      "ddd": 0,
      "ind": 2,
      "ty": 4,
      "nm": "Satellite",
      "sr": 1,
      "ks": {
        "o": {"a": 0, "k": 100},
        "r": {
          "a": 1,
          "k": [
            {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [0]},
            {"t": 120, "s": [360]}
          ]
        },
        "p": {"a": 0, "k": [150, 150, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {"a": 0, "k": [100, 100, 100]}
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "rc",
              "d": 1,
              "s": {"a": 0, "k": [12, 8]},
              "p": {"a": 0, "k": [100, 0]},
              "r": {"a": 0, "k": 2}
            },
            {
              "ty": "fl",
              "c": {"a": 0, "k": [1, 1, 1, 1]},
              "o": {"a": 0, "k": 100}
            },
            {
              "ty": "tr",
              "p": {"a": 0, "k": [0, 0]},
              "a": {"a": 0, "k": [0, 0]},
              "s": {"a": 0, "k": [100, 100]},
              "r": {"a": 0, "k": 0},
              "o": {"a": 0, "k": 100}
            }
          ]
        }
      ],
      "ip": 0,
      "op": 120,
      "st": 0,
      "bm": 0
    }
  ]
};

export function SatelliteOrbit({ size = 60, className = "" }: LottieLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie
        animationData={satelliteOrbitAnimation}
        loop={true}
        style={{ width: size, height: size }}
      />
    </div>
  );
}