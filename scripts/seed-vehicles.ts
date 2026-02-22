/**
 * Script para cargar vehículos de ejemplo (5 motos, 5 autos/camionetas).
 * Ejecutar: npm run seed:vehicles
 * Requiere MONGODB_URI en .env
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const MOTOS = [
  { brand: 'Honda', model: 'XR 190', year: 2023, price: 3200000, title: 'Honda XR 190 2023', description: 'Moto trail ideal para campo y ciudad. Muy cuidada, única mano. Papeles al día, transferencia a cargo del comprador.', location: 'Córdoba Capital', mileage: 8500, fuel: 'Nafta', transmission: 'Manual', color: 'Roja', vehicleType: 'moto' },
  { brand: 'Yamaha', model: 'FZ 2.0', year: 2024, price: 4500000, title: 'Yamaha FZ 2.0 2024', description: 'Excelente moto urbana. Motor 150cc, bajo consumo. Perfecto estado, lista para usar.', location: 'Buenos Aires', mileage: 2200, fuel: 'Nafta', transmission: 'Manual', color: 'Negra', vehicleType: 'moto' },
  { brand: 'Zanella', model: 'Zr 150', year: 2022, price: 1800000, title: 'Zanella Zr 150 2022', description: 'Clásica Zanella argentina. Económica y confiable. Ideal para primer vehículo o delivery.', location: 'Rosario', mileage: 15000, fuel: 'Nafta', transmission: 'Manual', color: 'Azul', vehicleType: 'moto' },
  { brand: 'Motomel', model: 'S2', year: 2023, price: 950000, title: 'Motomel S2 2023', description: 'Moto 110cc super económica. Impecable, con muy poco uso. Papeles en regla.', location: 'Mendoza', mileage: 3000, fuel: 'Nafta', transmission: 'Manual', color: 'Roja', vehicleType: 'moto' },
  { brand: 'Gilera', model: 'Smash 110', year: 2024, price: 1200000, title: 'Gilera Smash 110 2024', description: 'Moto utilitaria 110cc. Bajo consumo, práctica para la ciudad. Casi nueva.', location: 'La Plata', mileage: 1200, fuel: 'Nafta', transmission: 'Manual', color: 'Blanca', vehicleType: 'moto' },
];

const AUTOS = [
  { brand: 'Toyota', model: 'Hilux', year: 2022, price: 28500000, title: 'Toyota Hilux 2022', description: 'Camioneta doble cabina SRX 4x4. Diesel, impecable. Un solo dueño, service en concesionario.', location: 'CABA', mileage: 45000, fuel: 'Diésel', transmission: 'Manual', color: 'Blanca', bodyType: 'Pickup', doors: 4, vehicleType: 'auto' },
  { brand: 'Chevrolet', model: 'S10', year: 2023, price: 26500000, title: 'Chevrolet S10 2023', description: 'Camioneta LTZ plus cabina doble. Equipada, aire, dirección, vidrios eléctricos. Excelente estado.', location: 'Zona Norte GBA', mileage: 18000, fuel: 'Diésel', transmission: 'Automática', color: 'Gris', bodyType: 'Pickup', doors: 4, vehicleType: 'auto' },
  { brand: 'Ford', model: 'Ranger', year: 2021, price: 22000000, title: 'Ford Ranger 2021', description: 'Ranger XLT 4x2. Motor 2.2 turbodiesel. Muy cuidada, historial de service completo.', location: 'Córdoba', mileage: 62000, fuel: 'Diésel', transmission: 'Manual', color: 'Negra', bodyType: 'Pickup', doors: 4, vehicleType: 'auto' },
  { brand: 'Fiat', model: 'Cronos', year: 2024, price: 12500000, title: 'Fiat Cronos 2024', description: 'Sedán Drive 1.3 GSE. Cero km prácticamente. Garantía Fiat vigente. Papeles al día.', location: 'Tucumán', mileage: 500, fuel: 'Nafta', transmission: 'Manual', color: 'Blanco', bodyType: 'Sedan', doors: 4, vehicleType: 'auto' },
  { brand: 'Volkswagen', model: 'Amarok', year: 2022, price: 32000000, title: 'Volkswagen Amarok 2022', description: 'Amarok Highline V6. Full equipada, techo panorámico, leather. Impecable mecánica.', location: 'Mendoza', mileage: 38000, fuel: 'Diésel', transmission: 'Automática', color: 'Gris', bodyType: 'Pickup', doors: 4, vehicleType: 'auto' },
];

async function seedVehicles() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI no está definida en .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: 'StuntArgentinoCars' });
    console.log('✅ Conectado a MongoDB');

    const vehiclesCollection = mongoose.connection.collection('vehicles');
    const now = new Date();

    const toInsert = (items: typeof MOTOS, type: string) =>
      items.map((v) => ({
        ...v,
        currency: 'ARS',
        images: [],
        featured: false,
        published: true,
        details: [],
        sellerPhone: '5491112345678',
        sellerEmail: 'contacto@stuntargentino.com',
        createdAt: now,
        updatedAt: now,
      }));

    const motos = toInsert(MOTOS, 'moto');
    const autos = toInsert(AUTOS, 'auto');

    const { insertedCount: countMotos } = await vehiclesCollection.insertMany(motos);
    const { insertedCount: countAutos } = await vehiclesCollection.insertMany(autos);

    console.log(`✅ ${countMotos} motos creadas`);
    console.log(`✅ ${countAutos} autos/camionetas creadas`);
    console.log('🎉 Total:', countMotos + countAutos, 'vehículos cargados (sin fotos)');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedVehicles();
