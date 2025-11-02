"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

interface BookshelfProps {
  onClose?: () => void;
  onMangaClick?: () => void;
}

export default function Bookshelf({ onClose, onMangaClick }: BookshelfProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;

    // Orthographic Camera for flat, illustration-like view
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 6;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    camera.position.set(0, 1.2, 5);
    camera.lookAt(0, 1.2, 0);

    // Renderer with alpha enabled for transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.domElement.style.pointerEvents = "auto"; // Ensure canvas receives pointer events
    container.appendChild(renderer.domElement);

    // Lighting - much brighter for vibrant colors
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Create bookshelf structure (dark gray/black)
    const shelfMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b2b2b,
      roughness: 0.3,
      metalness: 0.1,
    });

    // Shelf dimensions
    const shelfWidth = 3.3; // Shortened shelf
    const shelfDepth = 1.5;
    const shelfHeight = 0.2; // Make shelves thicker/more prominent
    const numShelves = 2; // Only 2 rows
    const verticalSpacing = 1.5;

    // Create floating shelves (just horizontal planks)
    const shelfGeometry = new THREE.BoxGeometry(
      shelfWidth,
      shelfHeight,
      shelfDepth
    );

    for (let i = 0; i < numShelves; i++) {
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelf.position.set(0, i * verticalSpacing + shelfHeight, 0);
      shelf.castShadow = true;
      shelf.receiveShadow = true;
      scene.add(shelf);
    }

    // Book colors
    const bookColors = [
      0xaaa799, // sage green
      0xc0d6ed, //pastel blue
      0x75a8df, // Bright Yellow
      0xaeb463, // olive
      0xb1d8b7, // teal green
      0x4a4947, // Dark Charcoal
      0x82a4e3,
      0xa2c4e0,
      0x52688f, // Light Brown
    ];

    // Function to create a book
    function createBook(
      width: number,
      height: number,
      depth: number,
      color: number,
      position: THREE.Vector3,
      rotation: number = 0
    ) {
      const bookGeometry = new THREE.BoxGeometry(width, height, depth);
      const bookMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.6,
        metalness: 0.0,
        emissive: color,
        emissiveIntensity: 0.3, // Add slight glow to make colors pop
      });

      const book = new THREE.Mesh(bookGeometry, bookMaterial);
      book.position.copy(position);
      book.rotation.y = rotation;
      book.castShadow = true;
      book.receiveShadow = true;

      // Add border/edges to make books more defined
      const edgesGeometry = new THREE.EdgesGeometry(bookGeometry);
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: 0x000000, // Black borders
        linewidth: 1,
        opacity: 0.4,
        transparent: true,
      });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      book.add(edges);

      // Add spine detail
      const spineGeometry = new THREE.BoxGeometry(
        width + 0.01,
        height * 0.9,
        depth * 0.1
      );
      const spineMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).multiplyScalar(0.8),
        roughness: 0.8,
      });
      const spine = new THREE.Mesh(spineGeometry, spineMaterial);
      spine.position.z = -depth / 2 + 0.02;
      book.add(spine);

      return book;
    }

    // Place books on shelves
    const bookHeights = [0.8, 1.0, 1.2, 0.9, 1.1, 0.85, 1.15];
    const bookWidths = [0.15, 0.2, 0.18, 0.16, 0.14, 0.19, 0.17];
    const bookDepth = 1.0;
    let interactiveBook: THREE.Mesh | null = null;

    for (let shelfIndex = 0; shelfIndex < numShelves; shelfIndex++) {
      const shelfY = shelfIndex * verticalSpacing + shelfHeight;
      const numBooks = Math.floor(Math.random() * 6) + 16; // 16-21 books per shelf (more packed)
      let currentX = -shelfWidth / 2 + 0.15;

      // For bottom shelf, reserve space for interactive book on the right
      const isBottomShelf = shelfIndex === 0;
      const maxX = isBottomShelf ? shelfWidth / 2 - 0.5 : shelfWidth / 2 - 0.15;

      for (let bookIndex = 0; bookIndex < numBooks; bookIndex++) {
        const bookWidth =
          bookWidths[Math.floor(Math.random() * bookWidths.length)];

        // Check if adding this book would exceed shelf bounds
        if (currentX + bookWidth > maxX) break;

        const bookHeight =
          bookHeights[Math.floor(Math.random() * bookHeights.length)];
        const bookColor =
          bookColors[Math.floor(Math.random() * bookColors.length)];

        // Small random tilt for natural look
        const tilt = (Math.random() - 0.5) * 0.08;

        const bookPosition = new THREE.Vector3(
          currentX + bookWidth / 2,
          shelfY + bookHeight / 2 + 0.03,
          0.1
        );

        const book = createBook(
          bookWidth,
          bookHeight,
          bookDepth,
          bookColor,
          bookPosition,
          tilt
        );
        scene.add(book);

        currentX += bookWidth + 0.01 + Math.random() * 0.02; // Tighter spacing for packed look
      }
    }

    // Add special interactive book on the bottom right
    const interactiveBookWidth = 0.2;
    const interactiveBookHeight = 1.0;

    const interactiveBookColor = 0x0e86d4;
    const bottomShelfY = shelfHeight;
    const interactiveBookPosition = new THREE.Vector3(
      shelfWidth / 2 - 0.3,
      bottomShelfY + interactiveBookHeight / 2 + 0.03,
      0.1
    );

    interactiveBook = createBook(
      interactiveBookWidth,
      interactiveBookHeight,
      bookDepth,
      interactiveBookColor,
      interactiveBookPosition,
      0
    );
    interactiveBook.userData.isInteractive = true;
    interactiveBook.userData.originalZ = 0.1;
    scene.add(interactiveBook);

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Mouse move handler for hover effect
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true); // Check children recursively

      // Reset all books
      scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.userData.isInteractive) {
          child.position.z = child.userData.originalZ;
          child.position.y = bottomShelfY + interactiveBookHeight / 2 + 0.03;
        }
      });

      // Check if hovering over interactive book (check parent too)
      for (const intersect of intersects) {
        const obj = intersect.object;
        let targetBook = null;

        // Find the interactive book (either the object itself or its parent)
        if (obj instanceof THREE.Mesh && obj.userData.isInteractive) {
          targetBook = obj;
        } else if (
          obj.parent instanceof THREE.Mesh &&
          obj.parent.userData.isInteractive
        ) {
          targetBook = obj.parent;
        }

        if (targetBook) {
          // Much more obvious pop-out effect
          targetBook.position.z = targetBook.userData.originalZ + 0.8;
          // Add slight upward movement for extra emphasis
          targetBook.position.y =
            bottomShelfY + interactiveBookHeight / 2 + 0.13;
          document.body.style.cursor = "pointer";
          renderer.render(scene, camera);
          return;
        }
      }
      document.body.style.cursor = "default";
      renderer.render(scene, camera);
    };

    // Click handler to navigate to manga book page or close on empty space
    const handleClick = (event: MouseEvent) => {
      // Prevent default behavior
      event.preventDefault();
      event.stopPropagation();

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true); // Check children recursively

      console.log("Click detected, intersects:", intersects.length);

      // Check if clicked on interactive book (check parent too since edges might be hit)
      for (const intersect of intersects) {
        const obj: THREE.Object3D = intersect.object;

        console.log(
          "Clicked object:",
          obj.type,
          "userData:",
          obj.userData,
          "parent userData:",
          obj.parent?.userData
        );

        // Walk up the parent chain to find an interactive book
        let current: THREE.Object3D | null = obj;
        while (current) {
          if (current.userData && current.userData.isInteractive) {
            console.log("Interactive book clicked! Opening manga...");
            if (onMangaClick) {
              onMangaClick();
            } else {
              router.push("/manga");
            }
            return;
          }
          current = current.parent;
        }
      }

      console.log("No interactive book clicked");
      // If clicked on empty space (no intersections with books/shelves) and onClose exists, close the bookshelf
      if (intersects.length === 0 && onClose) {
        onClose();
      }
    };

    // ESC key to close
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyPress);

    // Handle window resize
    const handleResize = () => {
      const aspect = window.innerWidth / window.innerHeight;
      const frustumSize = 6;

      camera.left = (frustumSize * aspect) / -2;
      camera.right = (frustumSize * aspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = frustumSize / -2;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Initial render
    renderer.render(scene, camera);

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("resize", handleResize);
      document.body.style.cursor = "default";
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [router, onClose, onMangaClick]);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          position: "relative",
          pointerEvents: "auto",
        }}
      />
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            width: "44px",
            height: "44px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "2px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "20px",
            fontWeight: "400",
            zIndex: 10000,
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#333",
            pointerEvents: "auto",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 1)";
            e.currentTarget.style.transform = "scale(1.1) rotate(90deg)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            e.currentTarget.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.15)";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </>
  );
}
