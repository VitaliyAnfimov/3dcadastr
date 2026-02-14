"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function Viewer3D() {
  const mountRef = useRef(null);
  const viewportRef = useRef(null);
  const [selectedData, setSelectedData] = useState(null);
  const [is2D, setIs2D] = useState(false);

  useEffect(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) return;

    const getSize = () => {
      const w = viewportEl.clientWidth;
      const h = viewportEl.clientHeight;
      return { w: Math.max(1, w), h: Math.max(1, h) };
    };

    let { w: width, h: height } = getSize();

    // ===== Scene =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe9edf2);

    // ===== Cameras =====
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.set(70, 55, 95);

    const orthoSize = 120;
    const orthoCamera = new THREE.OrthographicCamera(
      -orthoSize,
      orthoSize,
      orthoSize,
      -orthoSize,
      1,
      2000
    );
    orthoCamera.position.set(0, 220, 0);
    orthoCamera.lookAt(0, 0, 0);

    // ===== Renderer =====
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.display = "block";
    mountRef.current.appendChild(renderer.domElement);

    // ===== Controls =====
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 8, 0); // чуть выше земли, приятнее вращать

    // ===== Light =====
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(80, 120, 80);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);

    // ===== Clickable list =====
    const clickable = [];

    const makeClickable = (mesh, userData, baseColorHex) => {
      mesh.userData = { ...userData, baseColor: baseColorHex };
      clickable.push(mesh);
      scene.add(mesh);
    };

    // ===== Base ground (участок) =====
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(160, 1, 140),
      new THREE.MeshStandardMaterial({ color: 0xd4b106 })
    );
    ground.position.y = -0.5;
    scene.add(ground);

    // ===== Yard / придомовая территория (покрытие) =====
    const yard = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 130),
      new THREE.MeshStandardMaterial({ color: 0xcfe3c2 })
    );
    yard.rotation.x = -Math.PI / 2;
    yard.position.y = 0.01;
    scene.add(yard);

    // ===== Roads (дороги/проезды) =====
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xbdbdbd });

    // центральный проезд между домами (вертикальная дорога)
    const roadMain = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 120), roadMat);
    roadMain.position.set(0, 0.11, 0);
    scene.add(roadMain);

    // поперечный проезд к школе/саду (горизонтальная дорога)
    const roadCross = new THREE.Mesh(new THREE.BoxGeometry(120, 0.2, 10), roadMat);
    roadCross.position.set(0, 0.11, 0);
    scene.add(roadCross);

    // бордюры (тонкие полосы)
    const curb1 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.25, 120), curbMat);
    curb1.position.set(-7.5, 0.13, 0);
    scene.add(curb1);

    const curb2 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.25, 120), curbMat);
    curb2.position.set(7.5, 0.13, 0);
    scene.add(curb2);

    const curb3 = new THREE.Mesh(new THREE.BoxGeometry(120, 0.25, 12), curbMat);
    curb3.position.set(0, 0.13, -7.5);
    scene.add(curb3);

    const curb4 = new THREE.Mesh(new THREE.BoxGeometry(120, 0.25, 12), curbMat);
    curb4.position.set(0, 0.13, 7.5);
    scene.add(curb4);

    // ===== Buildings =====
    const createBuilding = ({
      x,
      z,
      floors,
      w,
      d,
      color,
      prefix,
      type,
      address
    }) => {
      const floorHeight = 3;
      for (let i = 0; i < floors; i++) {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(w, floorHeight, d),
          new THREE.MeshStandardMaterial({ color })
        );
        mesh.position.set(x, i * floorHeight + floorHeight / 2, z);

        makeClickable(
          mesh,
          {
            cadastralNumber: `${prefix}-${i + 1}`,
            type,
            floor: i + 1,
            area: `${w * d} м²`,
            address
          },
          color
        );
      }
    };

    // Компактно: дома ближе к центру
    // Дом 1 (лево)
    createBuilding({
      x: -45,
      z: 30,
      floors: 9,
      w: 26,
      d: 18,
      color: 0x1f4e79,
      prefix: "68:25:0000000:201",
      type: "Жилой дом",
      address: "Тамбовская область, г. Котовск"
    });

    // Дом 2 (право)
    createBuilding({
      x: 45,
      z: 30,
      floors: 9,
      w: 26,
      d: 18,
      color: 0x1f4e79,
      prefix: "68:25:0000000:202",
      type: "Жилой дом",
      address: "Тамбовская область, г. Котовск"
    });

    // Школа (центр, 3 этажа)
    createBuilding({
      x: 0,
      z: -35,
      floors: 3,
      w: 50,
      d: 26,
      color: 0x2e8b57,
      prefix: "68:25:0000000:301",
      type: "Школа",
      address: "г. Котовск, школьный участок"
    });

    // Детский сад (рядом со школой)
    createBuilding({
      x: -35,
      z: -35,
      floors: 2,
      w: 34,
      d: 20,
      color: 0xff8c00,
      prefix: "68:25:0000000:401",
      type: "Детский сад",
      address: "г. Котовск, дошкольный участок"
    });

    // ===== Underground parking (2 шт — под каждым домом) =====
    const createParking = (x, z, cadastralNumber) => {
      const parking = new THREE.Mesh(
        new THREE.BoxGeometry(30, 6, 22),
        new THREE.MeshStandardMaterial({
          color: 0x444444,
          transparent: true,
          opacity: 0.65
        })
      );
      parking.position.set(x, -4, z);

      makeClickable(
        parking,
        {
          cadastralNumber,
          type: "Подземная парковка",
          floor: "-1",
          area: "660 м²",
          address: "г. Котовск"
        },
        0x444444
      );
    };

    createParking(-45, 30, "68:25:0000001:901");
    createParking(45, 30, "68:25:0000001:902");

    // ===== Playground (детская площадка) =====
    const playground = new THREE.Mesh(
      new THREE.BoxGeometry(26, 0.6, 18),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
    );
    playground.position.set(35, 0.3, -35);

    makeClickable(
      playground,
      {
        cadastralNumber: "68:25:0000000:501",
        type: "Детская площадка",
        floor: "0",
        area: "468 м²",
        address: "Дворовая территория"
      },
      0x3b82f6
    );

    // ===== Trees (деревья из примитивов) =====
    const addTree = (x, z) => {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.8, 5, 10),
        new THREE.MeshStandardMaterial({ color: 0x7a4a21 })
      );
      trunk.position.set(x, 2.5, z);

      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(2.5, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x2f7d32 })
      );
      crown.position.set(x, 6, z);

      // деревья делаем НЕ кликабельными (чтобы не мешали выбора объектов)
      scene.add(trunk);
      scene.add(crown);
    };

    // несколько рядов деревьев вдоль дорог
    for (let i = -55; i <= 55; i += 10) {
      addTree(-18, i);
      addTree(18, i);
    }
    for (let i = -55; i <= 55; i += 14) {
      addTree(i, -18);
      addTree(i, 18);
    }

    // ===== Click handling =====
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function resetColors() {
      for (const obj of clickable) {
        if (obj.material && obj.userData?.baseColor != null) {
          obj.material.color.setHex(obj.userData.baseColor);
        }
      }
    }

    function onClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const activeCamera = is2D ? orthoCamera : camera;

      raycaster.setFromCamera(mouse, activeCamera);
      const intersects = raycaster.intersectObjects(clickable);

      resetColors();

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        obj.material.color.set(0xcc0000);
        setSelectedData(obj.userData);
      }
    }

    renderer.domElement.addEventListener("click", onClick);

    // ===== Resize =====
    function onResize() {
      const { w, h } = getSize();
      width = w;
      height = h;

      renderer.setSize(width, height);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", onResize);

    // ===== Render loop =====
    let raf = 0;
    function animate() {
      raf = requestAnimationFrame(animate);

      if (!is2D) controls.update();

      renderer.render(scene, is2D ? orthoCamera : camera);
    }

    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);

      controls.dispose();
      renderer.dispose();

      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [is2D]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          height: "60px",
          background: "#003366",
          color: "white",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          fontWeight: "600",
          flex: "0 0 auto"
        }}
      >
        Федеральная служба государственной регистрации, кадастра и картографии
      </div>

      <div style={{ display: "flex", flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: "260px",
            background: "#f4f6f9",
            padding: "20px",
            flex: "0 0 auto",
            borderRight: "1px solid #d0d0d0"
          }}
        >
          <button
            onClick={() => setIs2D(!is2D)}
            style={{
              width: "100%",
              padding: "8px",
              background: "#0055a5",
              color: "white",
              border: "none",
              cursor: "pointer"
            }}
          >
            Переключить {is2D ? "3D" : "2D"}
          </button>

          <div style={{ marginTop: 14, fontSize: 13, color: "#444" }}>
            Подсказка: в 3D зажми ЛКМ и крути, колесо — зум.
          </div>
        </div>

        <div
          ref={viewportRef}
          style={{
            flex: 1,
            minWidth: 0,
            position: "relative",
            overflow: "hidden",
            background: "#e9edf2"
          }}
        >
          <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
        </div>

        <div
          style={{
            width: "320px",
            background: "#ffffff",
            borderLeft: "1px solid #ccc",
            padding: "20px",
            flex: "0 0 auto"
          }}
        >
          {selectedData ? (
            <>
              <p>
                <strong>Кадастровый номер:</strong>
                <br />
                {selectedData.cadastralNumber}
              </p>
              <p>
                <strong>Тип:</strong>
                <br />
                {selectedData.type}
              </p>
              <p>
                <strong>Этаж:</strong>
                <br />
                {selectedData.floor ?? "-"}
              </p>
              <p>
                <strong>Площадь:</strong>
                <br />
                {selectedData.area ?? "-"}
              </p>
              <p>
                <strong>Адрес:</strong>
                <br />
                {selectedData.address ?? "-"}
              </p>
            </>
          ) : (
            <p>Выберите объект</p>
          )}
        </div>
      </div>
    </div>
  );
}
