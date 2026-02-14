import { prisma } from "@/lib/prisma";

export async function autoSeedCadastreIfEmpty() {
  const count = await prisma.parcel.count();
  if (count > 0) return;

  // Демонстрационный участок (Котовск)
  const demoParcel = {
    type: "Polygon",
    coordinates: [[
      [41.5068, 52.5922],
      [41.5073, 52.5922],
      [41.5073, 52.5927],
      [41.5068, 52.5927],
      [41.5068, 52.5922]
    ]]
  };

  const parcel = await prisma.parcel.create({
    data: {
      cadastralNumber: "68:07:010101:101",
      areaM2: 1200,
      category: "Земли населённых пунктов",
      permittedUse: "Жилая застройка (демо)",
      footprintGeoJson: demoParcel
    }
  });

  const building = await prisma.cadastreBuilding.create({
    data: {
      cadastralNumber: "68:07:010101:201",
      address: "Тамбовская область, г. Котовск (демо)",
      floors: 9,
      lon: 41.5070,
      lat: 52.5924,
      heightM: 27,
      parcelId: parcel.id
    }
  });

  await prisma.premise.createMany({
    data: [
      {
        cadastralNumber: "68:07:010101:301",
        floor: 2,
        areaM2: 45.2,
        buildingId: building.id
      },
      {
        cadastralNumber: "68:07:010101:302",
        floor: 5,
        areaM2: 62.8,
        buildingId: building.id
      },
      {
        cadastralNumber: "68:07:010101:303",
        floor: 8,
        areaM2: 39.6,
        buildingId: building.id
      }
    ]
  });

  console.log("✅ Demo cadastre data created");
}