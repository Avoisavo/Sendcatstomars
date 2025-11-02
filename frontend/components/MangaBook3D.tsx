"use client";

import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import {
  Bone,
  BoxGeometry,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
  Group,
  Texture,
} from "three";
import { easing } from "maath";

// Page configuration
const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

// Animation parameters
const easingFactor = 0.5;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

// Create page geometry with bone weights
const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes: number[] = [];
const skinWeights: number[] = [];

for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i);
  const x = vertex.x;
  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
  const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndexes, 4)
);
pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

// Page materials
const whiteColor = "#ffffff";
const pageMaterials = [
  new MeshStandardMaterial({ color: whiteColor }), // sides
  new MeshStandardMaterial({ color: whiteColor }), // top
  new MeshStandardMaterial({ color: whiteColor }), // bottom
  new MeshStandardMaterial({ color: whiteColor }), // back
];

interface PageProps {
  number: number;
  opened: boolean;
  imageTexture?: Texture | null;
  textCanvas?: Texture | null;
  onClick?: () => void;
}

const Page = ({
  number,
  opened,
  imageTexture,
  textCanvas,
  onClick,
}: PageProps) => {
  const group = useRef<Group>(null!);
  const skinnedMeshRef = useRef<SkinnedMesh>(null!);
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

  // Create skinned mesh with bones
  const manualSkinnedMesh = useMemo(() => {
    const bones: Bone[] = [];

    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }
      if (i > 0) {
        bones[i - 1].add(bone);
      }
    }
    const skeleton = new Skeleton(bones);

    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        map: imageTexture || null,
        color: whiteColor,
        roughness: 1,
        metalness: 0,
        flatShading: true,
      }),
      new MeshStandardMaterial({
        map: textCanvas || null,
        color: whiteColor,
        roughness: 1,
        metalness: 0,
        flatShading: true,
      }),
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [imageTexture, textCanvas]);

  // Animation loop
  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return;

    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }

    let turningTime =
      Math.min(400, new Date().getTime() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    const targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    const bones = skinnedMeshRef.current.skeleton.bones;

    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];
      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;

      const rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;

      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );
    }
  });

  return (
    <group
      ref={group}
      position-z={-number * PAGE_DEPTH}
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
        document.body.style.cursor = "default";
      }}
      onPointerOver={() => {
        if (onClick) {
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        if (onClick) {
          document.body.style.cursor = "default";
        }
      }}
    >
      <primitive object={manualSkinnedMesh} ref={skinnedMeshRef} />
    </group>
  );
};

interface MangaBook3DProps {
  leftPageImage: string;
  rightPageText: string;
  rightPageDate?: string;
  rightPageDayOfWeek?: string;
  opened: boolean;
  onBookClick?: () => void;
  onLeftPageClick?: () => void;
  onRightPageClick?: () => void;
}

export const MangaBook3D = ({
  leftPageImage,
  rightPageText,
  rightPageDate = "",
  rightPageDayOfWeek = "",
  opened,
  onBookClick,
  onLeftPageClick,
  onRightPageClick,
}: MangaBook3DProps) => {
  const groupRef = useRef<Group>(null!);

  // Load textures
  const imageTexture = useTexture(leftPageImage);
  const coverTexture = useTexture("/cover.png");

  // Set color space after textures load
  useEffect(() => {
    if (imageTexture) {
      // eslint-disable-next-line
      imageTexture.colorSpace = SRGBColorSpace;
      imageTexture.needsUpdate = true;
    }
    if (coverTexture) {
      // eslint-disable-next-line
      coverTexture.colorSpace = SRGBColorSpace;
      coverTexture.needsUpdate = true;
    }
  }, [imageTexture, coverTexture]);

  // Create text canvas for right page
  const textCanvas = useMemo(() => {
    if (typeof window === "undefined") return null;

    console.log("📖 MangaBook3D rendering with:", {
      rightPageDate,
      rightPageDayOfWeek,
      rightPageText: rightPageText?.substring(0, 50) + "...",
    });

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1365;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add margin and border - increased left margin to avoid fold
    const margin = 60;
    const leftMargin = 180; // Larger left margin to avoid the fold area
    ctx.strokeStyle = "#e0e0d8";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      leftMargin,
      margin,
      canvas.width - leftMargin - margin,
      canvas.height - margin * 2
    );

    // Title - show date and day if available
    const titleText = rightPageDate || "AI Summary";
    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 36px 'Press Start 2P', 'Orbitron', 'VT323', monospace";
    ctx.textAlign = "center";
    const titleX = leftMargin + (canvas.width - leftMargin - margin) / 2;

    // If we have date and day, show both
    if (rightPageDate && rightPageDayOfWeek) {
      ctx.fillText(rightPageDate, titleX, 130);
      ctx.font = "bold 32px 'Orbitron', 'VT323', monospace";
      ctx.fillStyle = "#555";
      ctx.fillText(rightPageDayOfWeek, titleX, 175);
    } else {
      ctx.fillText(titleText, titleX, 150);
    }

    // Underline - adjusted for new margins
    ctx.strokeStyle = "#34495e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    const underlineY = rightPageDate && rightPageDayOfWeek ? 200 : 180;
    ctx.moveTo(leftMargin + 80, underlineY);
    ctx.lineTo(canvas.width - margin - 80, underlineY);
    ctx.stroke();

    // Body text - adjusted for new margins
    ctx.fillStyle = "#333";
    ctx.font = "28px 'Orbitron', 'VT323', monospace";
    ctx.textAlign = "left";

    const words = rightPageText.split(" ");
    let line = "";
    let y = rightPageDate && rightPageDayOfWeek ? 280 : 260;
    const maxWidth = canvas.width - leftMargin - margin - 60;
    const lineHeight = 48;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), leftMargin + 30, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
      if (y > canvas.height - margin - 60) break;
    }
    if (line && y < canvas.height - margin - 60) {
      ctx.fillText(line.trim(), leftMargin + 30, y);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, [rightPageText, rightPageDate, rightPageDayOfWeek]);

  return (
    <group
      ref={groupRef}
      rotation-y={-Math.PI / 2}
      rotation-x={-Math.PI / 8}
      position={[0, 0.5, 0]}
      scale={1.7}
      onClick={(e) => {
        e.stopPropagation();
        if (onBookClick) {
          onBookClick();
        }
      }}
      onPointerOver={() => {
        if (!opened) {
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      {/* Cover page - shows when book is closed */}
      {!opened && (
        <Page
          number={0}
          opened={false}
          imageTexture={coverTexture}
          textCanvas={null}
        />
      )}

      {/* Content pages - show when book is opened */}
      {opened && (
        <>
          {/* Left page - shows image on its back when flipped */}
          <Page
            number={0}
            opened={opened}
            imageTexture={null}
            textCanvas={imageTexture}
            onClick={onLeftPageClick}
          />
          {/* Right page - shows text on its front */}
          <Page
            number={1}
            opened={false}
            imageTexture={textCanvas}
            textCanvas={null}
            onClick={onRightPageClick}
          />
        </>
      )}
    </group>
  );
};
