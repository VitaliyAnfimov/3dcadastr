export default function Home() {
  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>3D Кадастр РФ</h1>
      <p>
        Прототип 3D-кадастра недвижимости на примере
        г. Котовск (Тамбовская область).
      </p>

      <div style={{ marginTop: 20 }}>
        <a
          href="/3d"
          style={{
            padding: "12px 20px",
            background: "#2d6cdf",
            color: "white",
            textDecoration: "none",
            borderRadius: 8
          }}
        >
          Открыть 3D Viewer
        </a>
      </div>

      <div style={{ marginTop: 30 }}>
        <p>API:</p>
        <ul>
          <li>
            <a href="/api/objects">/api/objects</a>
          </li>
          <li>
            <a href="/api/osm/kotovsk">/api/osm/kotovsk</a>
          </li>
        </ul>
      </div>
    </main>
  );
}
